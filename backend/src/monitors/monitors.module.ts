import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { Monitor, MonitorSchema } from '../schemas/monitor.schema';
import { Log, LogSchema } from '../schemas/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Monitor.name, schema: MonitorSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [MonitorsController],
  providers: [MonitorsService],
  exports: [MonitorsService],
})
export class MonitorsModule {}
