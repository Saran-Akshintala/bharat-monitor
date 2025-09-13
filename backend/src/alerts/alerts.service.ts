import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert, AlertDocument, AlertChannel, AlertStatus, AlertType } from '../schemas/alert.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Monitor, MonitorDocument, MonitorStatus } from '../schemas/monitor.schema';
import { EmailService } from './services/email.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    private emailService: EmailService,
  ) {}

  async createAlert(
    monitorId: string,
    userId: string,
    type: AlertType,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.alertPreferences) {
        this.logger.warn(`No alert preferences found for user ${userId}`);
        return;
      }

      const monitor = await this.monitorModel.findById(monitorId).exec();
      if (!monitor) {
        this.logger.warn(`Monitor ${monitorId} not found`);
        return;
      }

      // Check if we should send alerts (avoid spam)
      const lastAlert = monitor.lastAlertSent;
      const now = new Date();
      const minAlertInterval = 5 * 60 * 1000; // 5 minutes

      if (lastAlert && (now.getTime() - lastAlert.getTime()) < minAlertInterval) {
        this.logger.debug(`Skipping alert for monitor ${monitorId} - too soon since last alert`);
        return;
      }

      // Create alerts for enabled channels
      const alertPromises: Promise<void>[] = [];

      if (user.alertPreferences.email?.enabled) {
        alertPromises.push(this.createChannelAlert(
          monitorId, userId, type, AlertChannel.EMAIL, message, 
          user.alertPreferences.email.address, metadata
        ));
      }

      if (user.alertPreferences.whatsapp?.enabled) {
        alertPromises.push(this.createChannelAlert(
          monitorId, userId, type, AlertChannel.WHATSAPP, message,
          user.alertPreferences.whatsapp.phoneNumber, metadata
        ));
      }

      if (user.alertPreferences.slack?.enabled) {
        alertPromises.push(this.createChannelAlert(
          monitorId, userId, type, AlertChannel.SLACK, message,
          user.alertPreferences.slack.webhookUrl, metadata
        ));
      }

      if (user.alertPreferences.teams?.enabled) {
        alertPromises.push(this.createChannelAlert(
          monitorId, userId, type, AlertChannel.TEAMS, message,
          user.alertPreferences.teams.webhookUrl, metadata
        ));
      }

      await Promise.all(alertPromises);

      // Update monitor's last alert sent time
      await this.monitorModel.findByIdAndUpdate(monitorId, {
        lastAlertSent: now,
      }).exec();

    } catch (error) {
      this.logger.error(`Error creating alerts for monitor ${monitorId}:`, error);
    }
  }

  private async createChannelAlert(
    monitorId: string,
    userId: string,
    type: AlertType,
    channel: AlertChannel,
    message: string,
    recipient: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const alert = new this.alertModel({
        monitorId: new Types.ObjectId(monitorId),
        userId: new Types.ObjectId(userId),
        type,
        channel,
        message,
        recipient,
        metadata,
        status: AlertStatus.PENDING,
      });

      await alert.save();
      
      // Send alert immediately
      await this.processAlert(alert);

    } catch (error) {
      this.logger.error(`Error creating ${channel} alert:`, error);
    }
  }

  async sendAlert(monitor: any, status: string, responseTime: number, statusCode?: number, errorMessage?: string): Promise<void> {
    try {
      // Create alert record
      const alert = new this.alertModel({
        monitorId: monitor._id,
        userId: monitor.userId._id || monitor.userId,
        type: this.getAlertType(status, responseTime, monitor.responseTimeThreshold),
        message: this.formatAlertMessage(monitor, status, responseTime, statusCode, errorMessage),
        channels: [],
        status: 'pending',
        metadata: {
          responseTime,
          statusCode,
          errorMessage,
        },
      });

      await alert.save();
      await this.processAlert(alert);
    } catch (error) {
      this.logger.error('Error in retry cron job:', error);
    }
  }

  private getAlertType(status: string, responseTime: number, threshold?: number): string {
    if (status === 'DOWN') return 'down';
    if (status === 'UP') return 'up';
    if (threshold && responseTime > threshold) return 'slow';
    return 'validation_failed';
  }

  private formatAlertMessage(monitor: any, status: string, responseTime: number, statusCode?: number, errorMessage?: string): string {
    let message = `Monitor "${monitor.name}" is ${status.toLowerCase()}`;
    
    if (statusCode) {
      message += ` (HTTP ${statusCode})`;
    }
    
    if (responseTime) {
      message += ` - Response time: ${responseTime}ms`;
    }
    
    if (errorMessage) {
      message += ` - Error: ${errorMessage}`;
    }
    
    message += `\nURL: ${monitor.url}`;
    
    return message;
  }

  private async processAlert(alert: AlertDocument): Promise<void> {
    try {
      let success = false;

      switch (alert.channel) {
        case AlertChannel.EMAIL:
          success = await this.emailService.sendAlert(alert);
          break;
        case AlertChannel.WHATSAPP:
          // WhatsApp service integration - placeholder for now
          this.logger.warn('WhatsApp service not yet integrated');
          success = false;
          break;
        case AlertChannel.SLACK:
          // Slack service integration - placeholder for now
          this.logger.warn('Slack service not yet integrated');
          success = false;
          break;
        case AlertChannel.TEAMS:
          // Teams service integration - placeholder for now
          this.logger.warn('Teams service not yet integrated');
          success = false;
          break;
      }

      if (success) {
        await this.alertModel.findByIdAndUpdate(alert._id, {
          status: AlertStatus.SENT,
          sentAt: new Date(),
        }).exec();
        this.logger.log(`Alert sent successfully via ${alert.channel} to ${alert.recipient}`);
      } else {
        await this.handleAlertFailure(alert);
      }

    } catch (error) {
      this.logger.error(`Error sending alert ${alert._id}:`, error);
      await this.handleAlertFailure(alert);
    }
  }

  private async handleAlertFailure(alert: AlertDocument): Promise<void> {
    const maxRetries = 3;
    const retryCount = alert.retryCount + 1;

    if (retryCount <= maxRetries) {
      // Schedule retry
      await this.alertModel.findByIdAndUpdate(alert._id, {
        status: AlertStatus.RETRYING,
        retryCount,
      }).exec();

      // Retry after delay (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
      setTimeout(() => {
        this.processAlert(alert);
      }, delay);

      this.logger.warn(`Alert ${alert._id} failed, scheduling retry ${retryCount}/${maxRetries}`);
    } else {
      // Mark as failed
      await this.alertModel.findByIdAndUpdate(alert._id, {
        status: AlertStatus.FAILED,
        failedAt: new Date(),
      }).exec();

      this.logger.error(`Alert ${alert._id} failed permanently after ${maxRetries} retries`);
    }
  }

  async getAlerts(userId: string, limit = 50): Promise<Alert[]> {
    return this.alertModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('monitorId', 'name url')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getAlertStats(userId: string): Promise<any> {
    const stats = await this.alertModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
  }

  // Method to trigger alerts based on monitor status changes
  async checkAndTriggerAlerts(
    monitor: MonitorDocument,
    currentStatus: MonitorStatus,
    responseTime?: number,
    statusCode?: number,
    validationError?: string,
  ): Promise<void> {
    const previousStatus = monitor.previousStatus || MonitorStatus.PENDING;
    let alertType: AlertType | null = null;
    let message = '';

    // Status change alerts
    if (previousStatus !== currentStatus) {
      if (currentStatus === MonitorStatus.DOWN && previousStatus === MonitorStatus.UP) {
        alertType = AlertType.DOWN;
        message = `🔴 Monitor "${monitor.name}" is DOWN\nURL: ${monitor.url}\nStatus Code: ${statusCode || 'N/A'}`;
      } else if (currentStatus === MonitorStatus.UP && previousStatus === MonitorStatus.DOWN) {
        alertType = AlertType.UP;
        message = `🟢 Monitor "${monitor.name}" is back UP\nURL: ${monitor.url}\nResponse Time: ${responseTime || 'N/A'}ms`;
      }
    }

    // Response time threshold alert
    if (responseTime && responseTime > monitor.responseTimeThreshold) {
      alertType = AlertType.SLOW;
      message = `🟡 Monitor "${monitor.name}" is responding slowly\nURL: ${monitor.url}\nResponse Time: ${responseTime}ms (threshold: ${monitor.responseTimeThreshold}ms)`;
    }

    // Validation failure alert
    if (validationError) {
      alertType = AlertType.VALIDATION_FAILED;
      message = `⚠️ Monitor "${monitor.name}" validation failed\nURL: ${monitor.url}\nError: ${validationError}`;
    }

    if (alertType) {
      await this.createAlert(
        monitor._id.toString(),
        monitor.userId.toString(),
        alertType,
        message,
        {
          responseTime,
          statusCode,
          validationError,
          previousStatus,
          currentStatus,
        },
      );
    }
  }
}
