import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MonitorDocument = Monitor & Document;

export enum MonitorType {
  WEBSITE = 'website',
  API = 'api',
}

export enum MonitorStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded',
}

@Schema({ timestamps: true })
export class Monitor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: String, enum: MonitorType, required: true })
  type: MonitorType;

  @Prop({ required: true, min: 1, max: 60 })
  checkInterval: number; // in minutes

  @Prop({ type: [Number], default: [200, 201, 202, 204] })
  expectedStatusCodes: number[];

  @Prop({ type: String, enum: MonitorStatus, default: MonitorStatus.UP })
  currentStatus: MonitorStatus;

  @Prop({ default: 0 })
  responseTime: number; // in milliseconds

  @Prop()
  lastCheckedAt: Date;

  @Prop()
  lastDowntimeAt: Date;

  @Prop({ default: 0 })
  uptimePercentage: number;

  @Prop({ default: 0 })
  totalChecks: number;

  @Prop({ default: 0 })
  failedChecks: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  // HTTP specific settings
  @Prop()
  httpMethod: string; // GET, POST, PUT, etc.

  @Prop({ type: Object })
  httpHeaders: Record<string, string>;

  @Prop()
  httpBody: string;

  @Prop({ default: 30000 })
  timeout: number; // in milliseconds
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
