import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert, AlertSchema } from '../schemas/alert.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Monitor, MonitorSchema } from '../schemas/monitor.schema';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: User.name, schema: UserSchema },
      { name: Monitor.name, schema: MonitorSchema },
    ]),
    ConfigModule,
  ],
  controllers: [AlertsController],
  providers: [
    AlertsService,
    EmailService,
  ],
  exports: [AlertsService],
})
export class AlertsModule {}
