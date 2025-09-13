import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user alerts' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of alerts to retrieve' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  getAlerts(@Request() req, @Query('limit') limit?: number) {
    return this.alertsService.getAlerts(req.user.id, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for statistics' })
  @ApiResponse({ status: 200, description: 'Alert stats retrieved successfully' })
  getAlertStats(@Request() req, @Query('days') days?: number) {
    return this.alertsService.getAlertStats(req.user.id, days);
  }
}
