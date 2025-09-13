import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';
import { Alert, AlertDocument, AlertType, AlertStatus } from '../schemas/alert.schema';
import { Monitor } from '../schemas/monitor.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    // Initialize SendGrid
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
    }
  }

  async sendDowntimeAlert(monitor: Monitor, responseTime: number, errorMessage?: string): Promise<void> {
    const user = await this.usersService.findById(monitor.userId.toString());
    if (!user) return;

    const message = `🚨 ALERT: ${monitor.name} is DOWN!\n\nURL: ${monitor.url}\nResponse Time: ${responseTime}ms\nError: ${errorMessage || 'Unknown error'}\nTime: ${new Date().toISOString()}`;

    await this.sendAlerts(user, monitor, message, 'downtime');
  }

  async sendRecoveryAlert(monitor: Monitor, responseTime: number): Promise<void> {
    const user = await this.usersService.findById(monitor.userId.toString());
    if (!user) return;

    const message = `✅ RECOVERY: ${monitor.name} is back UP!\n\nURL: ${monitor.url}\nResponse Time: ${responseTime}ms\nTime: ${new Date().toISOString()}`;

    await this.sendAlerts(user, monitor, message, 'recovery');
  }

  async sendDegradedAlert(monitor: Monitor, responseTime: number): Promise<void> {
    const user = await this.usersService.findById(monitor.userId.toString());
    if (!user) return;

    const message = `⚠️ WARNING: ${monitor.name} is DEGRADED!\n\nURL: ${monitor.url}\nResponse Time: ${responseTime}ms (slow response)\nTime: ${new Date().toISOString()}`;

    await this.sendAlerts(user, monitor, message, 'degraded');
  }

  private async sendAlerts(user: any, monitor: Monitor, message: string, alertType: string): Promise<void> {
    const promises = [];

    // Email alerts
    if (user.emailAlertsEnabled) {
      promises.push(this.sendEmailAlert(user, monitor, message, alertType));
    }

    // WhatsApp alerts
    if (user.whatsappAlertsEnabled && user.whatsappNumber) {
      promises.push(this.sendWhatsAppAlert(user.whatsappNumber, monitor, message));
    }

    // Slack alerts
    if (user.slackAlertsEnabled && user.slackWebhookUrl) {
      promises.push(this.sendSlackAlert(user.slackWebhookUrl, monitor, message));
    }

    // Teams alerts
    if (user.teamsAlertsEnabled && user.teamsWebhookUrl) {
      promises.push(this.sendTeamsAlert(user.teamsWebhookUrl, monitor, message));
    }

    await Promise.allSettled(promises);
  }

  private async sendEmailAlert(user: any, monitor: Monitor, message: string, alertType: string): Promise<void> {
    try {
      const subject = `Bharat Monitor Alert: ${monitor.name} - ${alertType.toUpperCase()}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${alertType === 'downtime' ? '#dc3545' : alertType === 'recovery' ? '#28a745' : '#ffc107'}; color: white; padding: 20px; text-align: center;">
            <h1>${alertType === 'downtime' ? '🚨' : alertType === 'recovery' ? '✅' : '⚠️'} Monitor Alert</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2>${monitor.name}</h2>
            <p><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></p>
            <p><strong>Status:</strong> ${alertType.toUpperCase()}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <pre style="white-space: pre-wrap; margin: 0;">${message}</pre>
            </div>
            <p style="color: #6c757d; font-size: 12px;">
              This alert was sent by Bharat Monitor. To manage your alert preferences, log in to your dashboard.
            </p>
          </div>
        </div>
      `;

      const msg = {
        to: user.email,
        from: this.configService.get<string>('FROM_EMAIL') || 'alerts@bharatmonitor.com',
        subject,
        text: message,
        html: htmlContent,
      };

      await sgMail.send(msg);
      
      await this.logAlert(monitor._id, user._id, AlertType.EMAIL, message, AlertStatus.SENT, user.email);
      this.logger.log(`Email alert sent to ${user.email} for monitor ${monitor.name}`);

    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`);
      await this.logAlert(monitor._id, user._id, AlertType.EMAIL, message, AlertStatus.FAILED, user.email, error.message);
    }
  }

  private async sendWhatsAppAlert(phoneNumber: string, monitor: Monitor, message: string): Promise<void> {
    try {
      const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
      const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');

      if (!accessToken || !phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
      
      const data = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      };

      await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      await this.logAlert(monitor._id, monitor.userId, AlertType.WHATSAPP, message, AlertStatus.SENT, phoneNumber);
      this.logger.log(`WhatsApp alert sent to ${phoneNumber} for monitor ${monitor.name}`);

    } catch (error) {
      this.logger.error(`Failed to send WhatsApp alert: ${error.message}`);
      await this.logAlert(monitor._id, monitor.userId, AlertType.WHATSAPP, message, AlertStatus.FAILED, phoneNumber, error.message);
    }
  }

  private async sendSlackAlert(webhookUrl: string, monitor: Monitor, message: string): Promise<void> {
    try {
      const color = message.includes('DOWN') ? 'danger' : message.includes('UP') ? 'good' : 'warning';
      
      const payload = {
        attachments: [
          {
            color,
            title: `Monitor Alert: ${monitor.name}`,
            text: message,
            fields: [
              {
                title: 'URL',
                value: monitor.url,
                short: true,
              },
              {
                title: 'Time',
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      await axios.post(webhookUrl, payload);

      await this.logAlert(monitor._id, monitor.userId, AlertType.SLACK, message, AlertStatus.SENT, webhookUrl);
      this.logger.log(`Slack alert sent for monitor ${monitor.name}`);

    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`);
      await this.logAlert(monitor._id, monitor.userId, AlertType.SLACK, message, AlertStatus.FAILED, webhookUrl, error.message);
    }
  }

  private async sendTeamsAlert(webhookUrl: string, monitor: Monitor, message: string): Promise<void> {
    try {
      const color = message.includes('DOWN') ? 'FF0000' : message.includes('UP') ? '00FF00' : 'FFA500';
      
      const payload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: color,
        summary: `Monitor Alert: ${monitor.name}`,
        sections: [
          {
            activityTitle: `Monitor Alert: ${monitor.name}`,
            activitySubtitle: monitor.url,
            text: message,
            facts: [
              {
                name: 'URL',
                value: monitor.url,
              },
              {
                name: 'Time',
                value: new Date().toISOString(),
              },
            ],
          },
        ],
      };

      await axios.post(webhookUrl, payload);

      await this.logAlert(monitor._id, monitor.userId, AlertType.TEAMS, message, AlertStatus.SENT, webhookUrl);
      this.logger.log(`Teams alert sent for monitor ${monitor.name}`);

    } catch (error) {
      this.logger.error(`Failed to send Teams alert: ${error.message}`);
      await this.logAlert(monitor._id, monitor.userId, AlertType.TEAMS, message, AlertStatus.FAILED, webhookUrl, error.message);
    }
  }

  private async logAlert(
    monitorId: any,
    userId: any,
    type: AlertType,
    message: string,
    status: AlertStatus,
    recipient: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const alert = new this.alertModel({
        monitorId,
        userId,
        type,
        message,
        status,
        recipient,
        triggeredAt: new Date(),
        sentAt: status === AlertStatus.SENT ? new Date() : undefined,
        errorMessage,
      });

      await alert.save();
    } catch (error) {
      this.logger.error(`Failed to log alert: ${error.message}`);
    }
  }

  async getAlerts(userId: string, limit = 50): Promise<Alert[]> {
    return this.alertModel
      .find({ userId })
      .populate('monitorId', 'name url')
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .exec();
  }

  async getAlertStats(userId: string, days = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const alerts = await this.alertModel
      .find({
        userId,
        triggeredAt: { $gte: startDate },
      })
      .exec();

    const totalAlerts = alerts.length;
    const sentAlerts = alerts.filter(a => a.status === AlertStatus.SENT).length;
    const failedAlerts = alerts.filter(a => a.status === AlertStatus.FAILED).length;

    const alertsByType = {
      email: alerts.filter(a => a.type === AlertType.EMAIL).length,
      whatsapp: alerts.filter(a => a.type === AlertType.WHATSAPP).length,
      slack: alerts.filter(a => a.type === AlertType.SLACK).length,
      teams: alerts.filter(a => a.type === AlertType.TEAMS).length,
    };

    return {
      totalAlerts,
      sentAlerts,
      failedAlerts,
      successRate: totalAlerts > 0 ? (sentAlerts / totalAlerts) * 100 : 0,
      alertsByType,
    };
  }
}
