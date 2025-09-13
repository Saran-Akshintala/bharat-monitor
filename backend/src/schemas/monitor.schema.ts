import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MonitorDocument = Monitor & Document;

export enum MonitorType {
  WEBSITE = 'website',
  API = 'api',
}

export enum MonitorStatus {
  UP = 'up',
  DOWN = 'down',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class Monitor {
  @ApiProperty({ example: 'My Website', description: 'Monitor name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'https://example.com', description: 'URL to monitor' })
  @Prop({ required: true })
  url: string;

  @ApiProperty({ example: 'website', enum: MonitorType, description: 'Type of monitor' })
  @Prop({ enum: MonitorType, required: true })
  type: MonitorType;

  @ApiProperty({ example: 5, description: 'Check interval in minutes' })
  @Prop({ default: 5 })
  interval: number;

  @ApiProperty({ example: 'up', enum: MonitorStatus, description: 'Current status' })
  @Prop({ enum: MonitorStatus, default: MonitorStatus.PENDING })
  status: MonitorStatus;

  @ApiProperty({ description: 'User ID who owns this monitor' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: 200, description: 'Last response time in ms' })
  @Prop()
  lastResponseTime?: number;

  @ApiProperty({ example: 200, description: 'Last HTTP status code' })
  @Prop()
  lastStatusCode?: number;

  @ApiProperty({ description: 'Last check timestamp' })
  @Prop()
  lastCheckedAt?: Date;

  // Sprint 2: Enhanced monitoring features
  @Prop({ type: [Number], default: [200, 201, 204] })
  expectedStatusCodes: number[];

  @Prop({ type: Object })
  jsonKeyCheck?: {
    key: string;
    expectedValue: any;
  };

  @Prop({ default: 2000 })
  responseTimeThreshold: number; // in milliseconds

  @Prop()
  lastAlertSent?: Date;

  @Prop({ default: MonitorStatus.PENDING })
  previousStatus?: MonitorStatus;

  @ApiProperty({ description: 'Monitor creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
