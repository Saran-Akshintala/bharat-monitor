import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Monitoring')
@Controller('monitors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new monitor' })
  @ApiResponse({ status: 201, description: 'Monitor created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createMonitorDto: CreateMonitorDto, @Request() req) {
    return this.monitoringService.create(createMonitorDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all monitors for current user' })
  @ApiResponse({ status: 200, description: 'Monitors retrieved successfully' })
  findAll(@Request() req) {
    return this.monitoringService.findAll(req.user.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  getDashboardStats(@Request() req) {
    return this.monitoringService.getDashboardStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monitor by ID' })
  @ApiResponse({ status: 200, description: 'Monitor retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.monitoringService.findOne(id, req.user.id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get monitor logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of logs to retrieve' })
  @ApiResponse({ status: 200, description: 'Monitor logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  getMonitorLogs(
    @Param('id') id: string,
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.monitoringService.getMonitorLogs(id, req.user.id, limit);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get monitor statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for statistics' })
  @ApiResponse({ status: 200, description: 'Monitor stats retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  getMonitorStats(
    @Param('id') id: string,
    @Request() req,
    @Query('days') days?: number,
  ) {
    return this.monitoringService.getMonitorStats(id, req.user.id, days);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update monitor' })
  @ApiResponse({ status: 200, description: 'Monitor updated successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  update(
    @Param('id') id: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
    @Request() req,
  ) {
    return this.monitoringService.update(id, updateMonitorDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete monitor' })
  @ApiResponse({ status: 200, description: 'Monitor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Monitor not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.monitoringService.remove(id, req.user.id);
  }
}
