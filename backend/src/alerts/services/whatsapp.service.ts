import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AlertDocument } from '../../schemas/alert.schema';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private configService: ConfigService) {}

  async sendAlert(alert: AlertDocument): Promise<boolean> {
    try {
      const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
      const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
      
      if (!accessToken || !phoneNumberId) {
        this.logger.warn('WhatsApp credentials not configured, skipping WhatsApp alert');
        return false;
      }

      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      
      const message = this.formatWhatsAppMessage(alert);
      
      const payload = {
        messaging_product: 'whatsapp',
        to: alert.recipient,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        this.logger.log(`WhatsApp alert sent to ${alert.recipient}`);
        return true;
      }

      return false;

    } catch (error) {
      this.logger.error(`Failed to send WhatsApp alert to ${alert.recipient}:`, error.response?.data || error.message);
      return false;
    }
  }

  private formatWhatsAppMessage(alert: AlertDocument): string {
    const timestamp = new Date().toLocaleString();
    
    let emoji = '🔍';
    switch (alert.type) {
      case 'down':
        emoji = '🔴';
        break;
      case 'up':
        emoji = '🟢';
        break;
      case 'slow':
        emoji = '🟡';
        break;
      case 'validation_failed':
        emoji = '⚠️';
        break;
    }

    let message = `${emoji} *Bharat Monitor Alert*\n\n`;
    message += `${alert.message}\n\n`;
    message += `⏰ Time: ${timestamp}\n`;
    
    if (alert.metadata?.responseTime) {
      message += `⚡ Response Time: ${alert.metadata.responseTime}ms\n`;
    }
    
    if (alert.metadata?.statusCode) {
      message += `📊 Status Code: ${alert.metadata.statusCode}\n`;
    }

    message += `\n🔗 Check your dashboard for more details.`;
    
    return message;
  }
}
