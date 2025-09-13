import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bharat Monitor API is running! 🚀';
  }
}
