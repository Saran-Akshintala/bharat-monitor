import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface AlertPreferences {
  email?: {
    enabled: boolean;
    address: string;
  };
  whatsapp?: {
    enabled: boolean;
    phoneNumber: string;
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
  };
  teams?: {
    enabled: boolean;
    webhookUrl: string;
  };
}

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'], description: 'User role' })
  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: Object, default: {} })
  alertPreferences: AlertPreferences;

  @ApiProperty({ example: true, description: 'Whether user account is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
