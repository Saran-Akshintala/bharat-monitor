import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;

  // Alert preferences
  @Prop({ default: true })
  emailAlertsEnabled: boolean;

  @Prop({ default: false })
  whatsappAlertsEnabled: boolean;

  @Prop()
  whatsappNumber: string;

  @Prop({ default: false })
  slackAlertsEnabled: boolean;

  @Prop()
  slackWebhookUrl: string;

  @Prop({ default: false })
  teamsAlertsEnabled: boolean;

  @Prop()
  teamsWebhookUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
