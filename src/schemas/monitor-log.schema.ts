import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MonitorStatus } from './monitor.schema';

export type MonitorLogDocument = MonitorLog & Document;

@Schema({ timestamps: true })
export class MonitorLog {
  @Prop({ type: Types.ObjectId, ref: 'Monitor', required: true })
  monitorId: Types.ObjectId;

  @Prop({ type: String, enum: MonitorStatus, required: true })
  status: MonitorStatus;

  @Prop({ required: true })
  responseTime: number; // in milliseconds

  @Prop()
  statusCode: number;

  @Prop()
  errorMessage: string;

  @Prop({ required: true })
  checkedAt: Date;

  @Prop()
  responseHeaders: Record<string, string>;

  @Prop()
  responseBody: string; // Store first 1000 chars for debugging
}

export const MonitorLogSchema = SchemaFactory.createForClass(MonitorLog);
