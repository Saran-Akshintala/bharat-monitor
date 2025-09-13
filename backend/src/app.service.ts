import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bharat Monitor API - Website and API Monitoring Service';
  }
}
