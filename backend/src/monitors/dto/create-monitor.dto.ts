import { IsString, IsUrl, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MonitorType } from '../../schemas/monitor.schema';

export class CreateMonitorDto {
  @ApiProperty({ example: 'My Website', description: 'Monitor name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com', description: 'URL to monitor' })
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'website', enum: MonitorType, description: 'Type of monitor' })
  @IsEnum(MonitorType)
  type: MonitorType;

  @ApiProperty({ example: 5, description: 'Check interval in minutes (1-60)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  interval?: number;
}
