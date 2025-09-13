import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monitor, MonitorDocument, MonitorStatus } from '../schemas/monitor.schema';
import { MonitorLog, MonitorLogDocument, LogStatus } from '../schemas/monitor-log.schema';
import { AlertsService } from '../alerts/alerts.service';
import axios from 'axios';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    @InjectModel(MonitorLog.name) private logModel: Model<MonitorLogDocument>,
    private alertsService: AlertsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleMonitoringCron() {
    this.logger.log('Starting monitoring check cycle...');
    
    try {
      const monitors = await this.monitorModel.find({ isActive: true }).populate('userId').exec();
      this.logger.log(`Found ${monitors.length} monitors to check`);

      // Process monitors in parallel with concurrency limit
      const concurrencyLimit = parseInt(process.env.MAX_CONCURRENT_CHECKS) || 10;
      const chunks = this.chunkArray(monitors, concurrencyLimit);

      for (const chunk of chunks) {
        await Promise.all(chunk.map(monitor => this.checkMonitor(monitor)));
      }

      this.logger.log('Monitoring check cycle completed');
    } catch (error) {
      this.logger.error('Error in monitoring cron job:', error);
    }
  }

  private async checkMonitor(monitor: any) {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Checking monitor: ${monitor.name} (${monitor.url})`);

      const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
      const response = await axios.get(monitor.url, {
        timeout,
        validateStatus: () => true, // Don't throw on HTTP error status codes
      });

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;

      // Determine if monitor is up or down based on status code
      const isUp = statusCode >= 200 && statusCode < 400;
      const status = isUp ? MonitorStatus.UP : MonitorStatus.DOWN;
      const logStatus = isUp ? LogStatus.SUCCESS : LogStatus.FAILED;

      // Check for status change and alert conditions
      const previousStatus = monitor.status;
      const shouldAlert = await this.shouldTriggerAlert(monitor, status, responseTime, statusCode);

      // Update monitor status
      await this.monitorModel.findByIdAndUpdate(monitor._id, {
        status,
        lastChecked: new Date(),
        responseTime,
        lastStatusCode: statusCode,
        previousStatus: previousStatus,
        ...(shouldAlert && { lastAlertSent: new Date() })
      });

      // Create log entry
      const log = new this.logModel({
        monitorId: monitor._id,
        status: logStatus,
        responseTime,
        statusCode,
        timestamp: new Date(),
      });
      await log.save();

      // Send alert if needed
      if (shouldAlert) {
        await this.alertsService.sendAlert(monitor, status, responseTime, statusCode);
      }

      this.logger.debug(
        `Monitor ${monitor.name}: ${status} (${statusCode}) - ${responseTime}ms`,
      );

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.warn(
        `Monitor ${monitor.name} failed: ${error.message}`,
      );

      const previousStatus = monitor.status;
      const shouldAlert = await this.shouldTriggerAlert(monitor, MonitorStatus.DOWN, responseTime);

      // Update monitor as down
      await this.monitorModel.findByIdAndUpdate(monitor._id, {
        status: MonitorStatus.DOWN,
        lastChecked: new Date(),
        responseTime,
        previousStatus: previousStatus,
        ...(shouldAlert && { lastAlertSent: new Date() })
      });

      // Create error log entry
      const logStatus = error.code === 'ECONNABORTED' ? LogStatus.TIMEOUT : LogStatus.FAILED;
      const log = new this.logModel({
        monitorId: monitor._id,
        status: logStatus,
        responseTime,
        statusCode: undefined,
        timestamp: new Date(),
        errorMessage: error.message,
      });
      await log.save();

      // Send alert if needed
      if (shouldAlert) {
        await this.alertsService.sendAlert(monitor, MonitorStatus.DOWN, responseTime, undefined, error.message);
      }
    }
  }

  private async shouldTriggerAlert(monitor: any, currentStatus: MonitorStatus, responseTime: number, statusCode?: number): Promise<boolean> {
    // Don't send alerts too frequently (minimum 15 minutes between alerts)
    if (monitor.lastAlertSent) {
      const timeSinceLastAlert = Date.now() - new Date(monitor.lastAlertSent).getTime();
      const minAlertInterval = 15 * 60 * 1000; // 15 minutes
      if (timeSinceLastAlert < minAlertInterval) {
        return false;
      }
    }

    // Status change alerts
    if (monitor.previousStatus && monitor.previousStatus !== currentStatus) {
      return true;
    }

    // Response time threshold alerts
    if (monitor.responseTimeThreshold && responseTime > monitor.responseTimeThreshold) {
      return true;
    }

    // Expected status code validation
    if (monitor.expectedStatusCodes && statusCode && !monitor.expectedStatusCodes.includes(statusCode)) {
      return true;
    }

    // JSON validation alerts (would need response body check - implement later)
    
    return false;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
