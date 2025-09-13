import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Monitor, MonitorDocument, MonitorStatus } from '../schemas/monitor.schema';
import { MonitorLog, MonitorLogDocument } from '../schemas/monitor-log.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    @InjectModel(MonitorLog.name) private monitorLogModel: Model<MonitorLogDocument>,
  ) {}

  async create(createMonitorDto: CreateMonitorDto, userId: string): Promise<Monitor> {
    const monitorData = {
      ...createMonitorDto,
      userId,
      httpMethod: createMonitorDto.httpMethod || 'GET',
      timeout: createMonitorDto.timeout || 30000,
    };
    
    const createdMonitor = new this.monitorModel(monitorData);
    return createdMonitor.save();
  }

  async findAll(userId: string): Promise<Monitor[]> {
    return this.monitorModel.find({ userId, isActive: true }).exec();
  }

  async findAllActive(): Promise<Monitor[]> {
    return this.monitorModel.find({ isActive: true }).exec();
  }

  async findOne(id: string, userId: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ _id: id, userId, isActive: true }).exec();
    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }
    return monitor;
  }

  async update(id: string, updateMonitorDto: UpdateMonitorDto, userId: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findOne({ _id: id, userId, isActive: true }).exec();
    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    const updatedMonitor = await this.monitorModel
      .findByIdAndUpdate(id, updateMonitorDto, { new: true })
      .exec();
    
    return updatedMonitor;
  }

  async remove(id: string, userId: string): Promise<void> {
    const monitor = await this.monitorModel.findOne({ _id: id, userId, isActive: true }).exec();
    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    await this.monitorModel.findByIdAndUpdate(id, { isActive: false });
  }

  async updateMonitorStatus(
    monitorId: string,
    status: MonitorStatus,
    responseTime: number,
    statusCode?: number,
    errorMessage?: string,
  ): Promise<void> {
    const monitor = await this.monitorModel.findById(monitorId);
    if (!monitor) {
      return;
    }

    // Update monitor status and metrics
    const totalChecks = monitor.totalChecks + 1;
    const failedChecks = status !== MonitorStatus.UP ? monitor.failedChecks + 1 : monitor.failedChecks;
    const uptimePercentage = ((totalChecks - failedChecks) / totalChecks) * 100;

    await this.monitorModel.findByIdAndUpdate(monitorId, {
      currentStatus: status,
      responseTime,
      lastCheckedAt: new Date(),
      totalChecks,
      failedChecks,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      ...(status === MonitorStatus.DOWN && { lastDowntimeAt: new Date() }),
    });

    // Log the check result
    const logData = {
      monitorId,
      status,
      responseTime,
      statusCode,
      errorMessage,
      checkedAt: new Date(),
    };

    const monitorLog = new this.monitorLogModel(logData);
    await monitorLog.save();
  }

  async getMonitorLogs(monitorId: string, userId: string, limit = 100): Promise<MonitorLog[]> {
    // Verify user owns the monitor
    const monitor = await this.findOne(monitorId, userId);
    
    return this.monitorLogModel
      .find({ monitorId })
      .sort({ checkedAt: -1 })
      .limit(limit)
      .exec();
  }

  async getMonitorStats(monitorId: string, userId: string, days = 7): Promise<any> {
    const monitor = await this.findOne(monitorId, userId);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.monitorLogModel
      .find({
        monitorId,
        checkedAt: { $gte: startDate },
      })
      .sort({ checkedAt: 1 })
      .exec();

    const totalChecks = logs.length;
    const upChecks = logs.filter(log => log.status === MonitorStatus.UP).length;
    const downChecks = logs.filter(log => log.status === MonitorStatus.DOWN).length;
    const degradedChecks = logs.filter(log => log.status === MonitorStatus.DEGRADED).length;

    const avgResponseTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length 
      : 0;

    return {
      monitor: {
        id: monitor._id,
        name: monitor.name,
        url: monitor.url,
        type: monitor.type,
        currentStatus: monitor.currentStatus,
      },
      stats: {
        totalChecks,
        upChecks,
        downChecks,
        degradedChecks,
        uptimePercentage: totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime),
      },
      logs: logs.map(log => ({
        status: log.status,
        responseTime: log.responseTime,
        statusCode: log.statusCode,
        checkedAt: log.checkedAt,
        errorMessage: log.errorMessage,
      })),
    };
  }

  async getDashboardStats(userId: string): Promise<any> {
    const monitors = await this.findAll(userId);
    
    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter(m => m.currentStatus === MonitorStatus.UP).length;
    const downMonitors = monitors.filter(m => m.currentStatus === MonitorStatus.DOWN).length;
    const degradedMonitors = monitors.filter(m => m.currentStatus === MonitorStatus.DEGRADED).length;

    const avgUptimePercentage = monitors.length > 0
      ? monitors.reduce((sum, m) => sum + m.uptimePercentage, 0) / monitors.length
      : 0;

    return {
      totalMonitors,
      upMonitors,
      downMonitors,
      degradedMonitors,
      avgUptimePercentage: Math.round(avgUptimePercentage * 100) / 100,
      monitors: monitors.map(m => ({
        id: m._id,
        name: m.name,
        url: m.url,
        type: m.type,
        status: m.currentStatus,
        responseTime: m.responseTime,
        uptimePercentage: m.uptimePercentage,
        lastCheckedAt: m.lastCheckedAt,
      })),
    };
  }
}
