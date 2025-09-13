import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AlertDocument } from '../../schemas/alert.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  async sendAlert(alert: AlertDocument): Promise<boolean> {
    try {
      if (!alert.recipient) {
        this.logger.warn('Teams webhook URL not provided');
        return false;
      }

      const payload = this.formatTeamsMessage(alert);

      const response = await axios.post(alert.recipient, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        this.logger.log(`Teams alert sent successfully`);
        return true;
      }

      return false;

    } catch (error) {
      this.logger.error(`Failed to send Teams alert:`, error.response?.data || error.message);
      return false;
    }
  }

  private formatTeamsMessage(alert: AlertDocument): any {
    let themeColor = '1976d2';
    let emoji = '🔍';
    
    switch (alert.type) {
      case 'down':
        themeColor = 'f44336';
        emoji = '🔴';
        break;
      case 'up':
        themeColor = '4caf50';
        emoji = '🟢';
        break;
      case 'slow':
        themeColor = 'ff9800';
        emoji = '🟡';
        break;
      case 'validation_failed':
        themeColor = 'ff5722';
        emoji = '⚠️';
        break;
    }

    const facts = [
      {
        name: 'Alert Type',
        value: alert.type.toUpperCase(),
      },
      {
        name: 'Time',
        value: new Date().toLocaleString(),
      },
    ];

    if (alert.metadata?.responseTime) {
      facts.push({
        name: 'Response Time',
        value: `${alert.metadata.responseTime}ms`,
      });
    }

    if (alert.metadata?.statusCode) {
      facts.push({
        name: 'Status Code',
        value: `${alert.metadata.statusCode}`,
      });
    }

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Bharat Monitor Alert - ${alert.type.toUpperCase()}`,
      themeColor: themeColor,
      title: `${emoji} Bharat Monitor Alert`,
      text: alert.message,
      sections: [
        {
          facts: facts,
        },
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View Dashboard',
          targets: [
            {
              os: 'default',
              uri: 'https://bharatmonitor.com/dashboard',
            },
          ],
        },
      ],
    };
  }
}
