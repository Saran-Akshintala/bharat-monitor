import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Monitor, MonitorDocument, MonitorStatus } from '../schemas/monitor.schema';
import { Log, LogDocument } from '../schemas/log.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
  ) {}

  async create(createMonitorDto: CreateMonitorDto, userId: string): Promise<Monitor> {
    const monitor = new this.monitorModel({
      ...createMonitorDto,
      userId: new Types.ObjectId(userId),
    });
    return monitor.save();
  }

  async findAll(userId: string): Promise<Monitor[]> {
    return this.monitorModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findById(id).exec();
    
    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    if (monitor.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return monitor;
  }

  async update(id: string, updateData: any, userId: string): Promise<Monitor> {
    const monitor = await this.monitorModel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );
    
    if (!monitor) {
      throw new NotFoundException('Monitor not found or you do not have permission to update it');
    }
    
    return monitor;
  }

  async remove(id: string, userId: string): Promise<void> {
    const monitor = await this.findOne(id, userId);
    
    // Delete associated logs
    await this.logModel.deleteMany({ monitorId: new Types.ObjectId(id) }).exec();
    
    // Delete monitor
    await this.monitorModel.findByIdAndDelete(id).exec();
  }

  async findAllForMonitoring(): Promise<Monitor[]> {
    return this.monitorModel.find().exec();
  }

  async updateStatus(
    id: string,
    status: MonitorStatus,
    responseTime: number,
    statusCode?: number,
  ): Promise<Monitor> {
    return this.monitorModel.findByIdAndUpdate(
      id,
      {
        status,
        lastResponseTime: responseTime,
        lastStatusCode: statusCode,
        lastCheckedAt: new Date(),
      },
      { new: true },
    ).exec();
  }
}
