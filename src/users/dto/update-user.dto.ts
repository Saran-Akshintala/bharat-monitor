import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: true,
    description: 'Enable email alerts',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  emailAlertsEnabled?: boolean;

  @ApiProperty({
    example: false,
    description: 'Enable WhatsApp alerts',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  whatsappAlertsEnabled?: boolean;

  @ApiProperty({
    example: '+1234567890',
    description: 'WhatsApp phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({
    example: false,
    description: 'Enable Slack alerts',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  slackAlertsEnabled?: boolean;

  @ApiProperty({
    example: 'https://hooks.slack.com/services/...',
    description: 'Slack webhook URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  slackWebhookUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Enable Teams alerts',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  teamsAlertsEnabled?: boolean;

  @ApiProperty({
    example: 'https://your-teams-webhook-url',
    description: 'Teams webhook URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  teamsWebhookUrl?: string;
}
