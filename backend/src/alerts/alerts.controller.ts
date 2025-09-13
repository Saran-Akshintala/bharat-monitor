import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user alerts' })
  @ApiResponse({ status: 200, description: 'Returns list of alerts for the user' })
  async getAlerts(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.sub;
    return this.alertsService.getAlerts(userId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiResponse({ status: 200, description: 'Returns alert statistics for the user' })
  async getAlertStats(@Request() req) {
    const userId = req.user.sub;
    return this.alertsService.getAlertStats(userId);
  }
}
