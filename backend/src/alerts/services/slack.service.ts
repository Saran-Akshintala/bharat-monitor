import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AlertDocument } from '../../schemas/alert.schema';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  async sendAlert(alert: AlertDocument): Promise<boolean> {
    try {
      if (!alert.recipient) {
        this.logger.warn('Slack webhook URL not provided');
        return false;
      }

      const payload = this.formatSlackMessage(alert);

      const response = await axios.post(alert.recipient, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        this.logger.log(`Slack alert sent successfully`);
        return true;
      }

      return false;

    } catch (error) {
      this.logger.error(`Failed to send Slack alert:`, error.response?.data || error.message);
      return false;
    }
  }

  private formatSlackMessage(alert: AlertDocument): any {
    const timestamp = Math.floor(Date.now() / 1000);
    
    let color = '#1976d2';
    let emoji = '🔍';
    
    switch (alert.type) {
      case 'down':
        color = '#f44336';
        emoji = '🔴';
        break;
      case 'up':
        color = '#4caf50';
        emoji = '🟢';
        break;
      case 'slow':
        color = '#ff9800';
        emoji = '🟡';
        break;
      case 'validation_failed':
        color = '#ff5722';
        emoji = '⚠️';
        break;
    }

    const fields = [
      {
        title: 'Alert Type',
        value: alert.type.toUpperCase(),
        short: true,
      },
      {
        title: 'Time',
        value: `<!date^${timestamp}^{date_short_pretty} at {time}|${new Date().toLocaleString()}>`,
        short: true,
      },
    ];

    if (alert.metadata?.responseTime) {
      fields.push({
        title: 'Response Time',
        value: `${alert.metadata.responseTime}ms`,
        short: true,
      });
    }

    if (alert.metadata?.statusCode) {
      fields.push({
        title: 'Status Code',
        value: `${alert.metadata.statusCode}`,
        short: true,
      });
    }

    return {
      username: 'Bharat Monitor',
      icon_emoji: ':mag:',
      attachments: [
        {
          color: color,
          title: `${emoji} Bharat Monitor Alert`,
          text: alert.message,
          fields: fields,
          footer: 'Bharat Monitor',
          footer_icon: 'https://bharatmonitor.com/icon.png',
          ts: timestamp,
        },
      ],
    };
  }
}
