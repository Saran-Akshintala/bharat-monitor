import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { MonitoringEngineService } from './monitoring-engine.service';
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
  controllers: [MonitoringController],
  providers: [MonitoringService, MonitoringEngineService],
  exports: [MonitoringService, MonitoringEngineService],
})
export class MonitoringModule {}
