import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LogDocument = Log & Document;

export enum LogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

@Schema({ timestamps: true })
export class Log {
  @ApiProperty({ description: 'Monitor ID this log belongs to' })
  @Prop({ type: Types.ObjectId, ref: 'Monitor', required: true })
  monitorId: Types.ObjectId;

  @ApiProperty({ example: 'success', enum: LogStatus, description: 'Check result status' })
  @Prop({ required: true, enum: LogStatus })
  status: LogStatus;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  @Prop()
  statusCode: number;

  @ApiProperty({ example: 150, description: 'Response time in milliseconds' })
  @Prop({ required: true })
  responseTime: number;

  @ApiProperty({ example: 'Connection timeout', description: 'Error message if any' })
  @Prop()
  errorMessage: string;

  @ApiProperty({ description: 'Timestamp when check was performed' })
  @Prop({ default: Date.now })
  checkedAt: Date;

  @ApiProperty({ description: 'Log creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);
