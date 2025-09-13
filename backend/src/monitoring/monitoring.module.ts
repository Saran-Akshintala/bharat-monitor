import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoringService } from './monitoring.service';
import { Monitor, MonitorSchema } from '../schemas/monitor.schema';
import { MonitorLog, MonitorLogSchema } from '../schemas/monitor-log.schema';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Monitor.name, schema: MonitorSchema },
      { name: MonitorLog.name, schema: MonitorLogSchema },
    ]),
    AlertsModule,
  ],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
