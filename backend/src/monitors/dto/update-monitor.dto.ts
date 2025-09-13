import { IsOptional, IsString, IsNumber, IsArray, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MonitorType } from '../../schemas/monitor.schema';

export class UpdateMonitorDto {
  @ApiProperty({ example: 'My Updated Website', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://updated-example.com', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ example: 'website', enum: MonitorType, required: false })
  @IsOptional()
  type?: MonitorType;

  @ApiProperty({ example: 10, description: 'Check interval in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  interval?: number;

  @ApiProperty({ 
    example: [200, 201, 204], 
    description: 'Expected HTTP status codes',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  expectedStatusCodes?: number[];

  @ApiProperty({ 
    example: { key: 'status', expectedValue: 'ok' },
    description: 'JSON key validation for API responses',
    required: false 
  })
  @IsOptional()
  @IsObject()
  jsonKeyCheck?: {
    key: string;
    expectedValue: any;
  };

  @ApiProperty({ 
    example: 2000,
    description: 'Response time threshold in milliseconds',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(60000)
  responseTimeThreshold?: number;
}
