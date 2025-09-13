import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlertDocument = Alert & Document;

export enum AlertType {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
  TEAMS = 'teams',
}

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'Monitor', required: true })
  monitorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AlertType, required: true })
  type: AlertType;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Prop()
  sentAt: Date;

  @Prop()
  errorMessage: string;

  @Prop({ required: true })
  triggeredAt: Date;

  @Prop()
  recipient: string; // email, phone number, webhook URL
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
