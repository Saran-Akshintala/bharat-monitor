import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MonitorLogDocument = MonitorLog & Document;

export enum LogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

@Schema({ timestamps: true })
export class MonitorLog {
  @Prop({ type: Types.ObjectId, ref: 'Monitor', required: true })
  monitorId: Types.ObjectId;

  @Prop({ required: true, enum: LogStatus })
  status: LogStatus;

  @Prop({ required: true })
  responseTime: number;

  @Prop()
  statusCode?: number;

  @Prop()
  errorMessage?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MonitorLogSchema = SchemaFactory.createForClass(MonitorLog);
