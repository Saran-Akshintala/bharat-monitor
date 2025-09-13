import { Controller, Get, UseGuards, Request, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('uptime/csv')
  @ApiOperation({ summary: 'Download uptime report as CSV' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for report (default: 7)' })
  @ApiResponse({ status: 200, description: 'CSV report downloaded successfully' })
  async downloadUptimeCSV(
    @Request() req,
    @Query('days') days: number = 7,
    @Res() res: Response,
  ) {
    return this.reportsService.generateUptimeReportCSV(req.user.id, days, res);
  }

  @Get('uptime/pdf')
  @ApiOperation({ summary: 'Download uptime report as PDF' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for report (default: 7)' })
  @ApiResponse({ status: 200, description: 'PDF report downloaded successfully' })
  async downloadUptimePDF(
    @Request() req,
    @Query('days') days: number = 7,
    @Res() res: Response,
  ) {
    return this.reportsService.generateUptimeReportPDF(req.user.id, days, res);
  }

  @Get('uptime/data')
  @ApiOperation({ summary: 'Get uptime report data as JSON' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for report (default: 7)' })
  @ApiResponse({ status: 200, description: 'Report data retrieved successfully' })
  async getUptimeReportData(
    @Request() req,
    @Query('days') days: number = 7,
  ) {
    return this.reportsService.getReportData(req.user.id, days);
  }
}
