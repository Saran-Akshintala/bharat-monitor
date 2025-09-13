import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, Max, IsOptional, IsArray, IsUrl, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MonitorType } from '../../schemas/monitor.schema';

export class CreateMonitorDto {
  @ApiProperty({
    example: 'My Website',
    description: 'Monitor name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'URL to monitor',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: MonitorType.WEBSITE,
    description: 'Type of monitor',
    enum: MonitorType,
  })
  @IsEnum(MonitorType)
  type: MonitorType;

  @ApiProperty({
    example: 5,
    description: 'Check interval in minutes (1-60)',
  })
  @IsNumber()
  @Min(1)
  @Max(60)
  checkInterval: number;

  @ApiProperty({
    example: [200, 201, 202, 204],
    description: 'Expected HTTP status codes',
    required: false,
  })
  @IsArray()
  @IsOptional()
  expectedStatusCodes?: number[];

  @ApiProperty({
    example: 'GET',
    description: 'HTTP method',
    required: false,
  })
  @IsString()
  @IsOptional()
  httpMethod?: string;

  @ApiProperty({
    example: { 'Authorization': 'Bearer token' },
    description: 'HTTP headers',
    required: false,
  })
  @IsObject()
  @IsOptional()
  httpHeaders?: Record<string, string>;

  @ApiProperty({
    example: '{"key": "value"}',
    description: 'HTTP request body',
    required: false,
  })
  @IsString()
  @IsOptional()
  httpBody?: string;

  @ApiProperty({
    example: 30000,
    description: 'Request timeout in milliseconds',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  timeout?: number;
}
