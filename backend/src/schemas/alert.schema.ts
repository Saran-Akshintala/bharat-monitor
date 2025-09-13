import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlertDocument = Alert & Document;

export enum AlertType {
  DOWN = 'down',
  UP = 'up',
  SLOW = 'slow',
  VALIDATION_FAILED = 'validation_failed',
}

export enum AlertChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
  TEAMS = 'teams',
}

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

@Schema({
  timestamps: true,
})
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'Monitor', required: true })
  monitorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: AlertType, required: true })
  type: AlertType;

  @Prop({ enum: AlertChannel, required: true })
  channel: AlertChannel;

  @Prop({ enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Prop({ required: true })
  message: string;

  @Prop()
  recipient: string; // email, phone number, webhook URL

  @Prop()
  responseTime?: number;

  @Prop()
  statusCode?: number;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  sentAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
