import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios, { AxiosResponse } from 'axios';
import { Monitor, MonitorDocument, MonitorStatus } from '../schemas/monitor.schema';
import { MonitoringService } from './monitoring.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class MonitoringEngineService {
  private readonly logger = new Logger(MonitoringEngineService.name);
  private readonly maxConcurrentChecks = parseInt(process.env.MAX_CONCURRENT_CHECKS) || 10;
  private activeChecks = 0;

  constructor(
    @InjectModel(Monitor.name) private monitorModel: Model<MonitorDocument>,
    private monitoringService: MonitoringService,
    private alertsService: AlertsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMonitoringCron() {
    if (this.activeChecks >= this.maxConcurrentChecks) {
      this.logger.warn(`Max concurrent checks (${this.maxConcurrentChecks}) reached, skipping this cycle`);
      return;
    }

    const now = new Date();
    const monitors = await this.monitorModel.find({
      isActive: true,
      $or: [
        { lastCheckedAt: { $exists: false } },
        {
          lastCheckedAt: {
            $lte: new Date(now.getTime() - (5 * 60 * 1000)) // Default 5 minutes if no specific interval
          }
        }
      ]
    }).exec();

    // Filter monitors that are due for checking based on their individual intervals
    const monitorsToCheck = monitors.filter(monitor => {
      if (!monitor.lastCheckedAt) return true;
      
      const intervalMs = monitor.checkInterval * 60 * 1000;
      const timeSinceLastCheck = now.getTime() - monitor.lastCheckedAt.getTime();
      return timeSinceLastCheck >= intervalMs;
    });

    this.logger.log(`Found ${monitorsToCheck.length} monitors to check`);

    // Process monitors with concurrency limit
    const promises = monitorsToCheck
      .slice(0, this.maxConcurrentChecks - this.activeChecks)
      .map(monitor => this.checkMonitor(monitor));

    await Promise.allSettled(promises);
  }

  private async checkMonitor(monitor: Monitor): Promise<void> {
    this.activeChecks++;
    const startTime = Date.now();

    try {
      this.logger.debug(`Checking monitor: ${monitor.name} (${monitor.url})`);

      const result = await this.performHealthCheck(monitor);
      const responseTime = Date.now() - startTime;

      // Determine status based on response
      let status = MonitorStatus.UP;
      if (!result.success) {
        status = MonitorStatus.DOWN;
      } else if (responseTime > 5000) { // Consider degraded if response time > 5s
        status = MonitorStatus.DEGRADED;
      }

      // Update monitor status
      await this.monitoringService.updateMonitorStatus(
        monitor._id.toString(),
        status,
        responseTime,
        result.statusCode,
        result.error,
      );

      // Check if we need to send alerts
      if (status !== monitor.currentStatus) {
        await this.handleStatusChange(monitor, status, responseTime, result.error);
      }

      this.logger.debug(`Monitor check completed: ${monitor.name} - Status: ${status}, Response Time: ${responseTime}ms`);

    } catch (error) {
      this.logger.error(`Error checking monitor ${monitor.name}:`, error);
      
      const responseTime = Date.now() - startTime;
      await this.monitoringService.updateMonitorStatus(
        monitor._id.toString(),
        MonitorStatus.DOWN,
        responseTime,
        null,
        error.message,
      );

      if (monitor.currentStatus !== MonitorStatus.DOWN) {
        await this.handleStatusChange(monitor, MonitorStatus.DOWN, responseTime, error.message);
      }
    } finally {
      this.activeChecks--;
    }
  }

  private async performHealthCheck(monitor: Monitor): Promise<{
    success: boolean;
    statusCode?: number;
    error?: string;
  }> {
    try {
      const config = {
        method: monitor.httpMethod || 'GET',
        url: monitor.url,
        timeout: monitor.timeout || 30000,
        headers: monitor.httpHeaders || {},
        validateStatus: (status: number) => {
          return monitor.expectedStatusCodes.includes(status);
        },
      };

      if (monitor.httpBody && ['POST', 'PUT', 'PATCH'].includes(config.method.toUpperCase())) {
        config['data'] = monitor.httpBody;
      }

      const response: AxiosResponse = await axios(config);
      
      return {
        success: true,
        statusCode: response.status,
      };

    } catch (error) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          statusCode: error.response.status,
          error: `HTTP ${error.response.status}: ${error.response.statusText}`,
        };
      } else if (error.request) {
        // Request timeout or network error
        return {
          success: false,
          error: 'Network error or timeout',
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message,
        };
      }
    }
  }

  private async handleStatusChange(
    monitor: Monitor,
    newStatus: MonitorStatus,
    responseTime: number,
    errorMessage?: string,
  ): Promise<void> {
    this.logger.log(`Status change detected for ${monitor.name}: ${monitor.currentStatus} -> ${newStatus}`);

    // Send alerts based on status change
    if (newStatus === MonitorStatus.DOWN) {
      await this.alertsService.sendDowntimeAlert(monitor, responseTime, errorMessage);
    } else if (newStatus === MonitorStatus.UP && monitor.currentStatus === MonitorStatus.DOWN) {
      await this.alertsService.sendRecoveryAlert(monitor, responseTime);
    } else if (newStatus === MonitorStatus.DEGRADED) {
      await this.alertsService.sendDegradedAlert(monitor, responseTime);
    }
  }

  // Manual trigger for testing
  async triggerMonitorCheck(monitorId: string): Promise<void> {
    const monitor = await this.monitorModel.findById(monitorId);
    if (!monitor) {
      throw new Error('Monitor not found');
    }

    await this.checkMonitor(monitor);
  }

  // Get engine status
  getEngineStatus() {
    return {
      activeChecks: this.activeChecks,
      maxConcurrentChecks: this.maxConcurrentChecks,
      isRunning: true,
    };
  }
}
