import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as createCsvWriter from 'csv-writer';
import * as PDFDocument from 'pdfkit';
import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class ReportsService {
  constructor(private monitoringService: MonitoringService) {}

  async generateUptimeReportCSV(userId: string, days: number, res: Response): Promise<void> {
    const monitors = await this.monitoringService.findAll(userId);
    const reportData = [];

    for (const monitor of monitors) {
      const stats = await this.monitoringService.getMonitorStats(monitor._id.toString(), userId, days);
      
      reportData.push({
        name: monitor.name,
        url: monitor.url,
        type: monitor.type,
        currentStatus: monitor.currentStatus,
        uptimePercentage: stats.stats.uptimePercentage.toFixed(2),
        totalChecks: stats.stats.totalChecks,
        upChecks: stats.stats.upChecks,
        downChecks: stats.stats.downChecks,
        avgResponseTime: stats.stats.avgResponseTime,
        lastChecked: monitor.lastCheckedAt?.toISOString() || 'Never',
      });
    }

    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Monitor Name' },
        { id: 'url', title: 'URL' },
        { id: 'type', title: 'Type' },
        { id: 'currentStatus', title: 'Current Status' },
        { id: 'uptimePercentage', title: 'Uptime %' },
        { id: 'totalChecks', title: 'Total Checks' },
        { id: 'upChecks', title: 'Up Checks' },
        { id: 'downChecks', title: 'Down Checks' },
        { id: 'avgResponseTime', title: 'Avg Response Time (ms)' },
        { id: 'lastChecked', title: 'Last Checked' },
      ],
    });

    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(reportData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=uptime-report-${days}days-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvString);
  }

  async generateUptimeReportPDF(userId: string, days: number, res: Response): Promise<void> {
    const monitors = await this.monitoringService.findAll(userId);
    const dashboardStats = await this.monitoringService.getDashboardStats(userId);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=uptime-report-${days}days-${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Bharat Monitor - Uptime Report', 50, 50);
    doc.fontSize(12).text(`Report Period: Last ${days} days`, 50, 80);
    doc.text(`Generated: ${new Date().toISOString()}`, 50, 95);

    // Summary
    doc.fontSize(16).text('Summary', 50, 130);
    doc.fontSize(12)
       .text(`Total Monitors: ${dashboardStats.totalMonitors}`, 50, 155)
       .text(`Currently Up: ${dashboardStats.upMonitors}`, 50, 170)
       .text(`Currently Down: ${dashboardStats.downMonitors}`, 50, 185)
       .text(`Currently Degraded: ${dashboardStats.degradedMonitors}`, 50, 200)
       .text(`Average Uptime: ${dashboardStats.avgUptimePercentage.toFixed(2)}%`, 50, 215);

    let yPosition = 250;

    // Monitor Details
    doc.fontSize(16).text('Monitor Details', 50, yPosition);
    yPosition += 30;

    for (const monitor of monitors) {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const stats = await this.monitoringService.getMonitorStats(monitor._id.toString(), userId, days);

      doc.fontSize(14).text(monitor.name, 50, yPosition);
      yPosition += 20;

      doc.fontSize(10)
         .text(`URL: ${monitor.url}`, 70, yPosition)
         .text(`Type: ${monitor.type}`, 70, yPosition + 12)
         .text(`Status: ${monitor.currentStatus}`, 70, yPosition + 24)
         .text(`Uptime: ${stats.stats.uptimePercentage.toFixed(2)}%`, 70, yPosition + 36)
         .text(`Avg Response Time: ${stats.stats.avgResponseTime}ms`, 70, yPosition + 48)
         .text(`Total Checks: ${stats.stats.totalChecks}`, 300, yPosition)
         .text(`Up: ${stats.stats.upChecks}`, 300, yPosition + 12)
         .text(`Down: ${stats.stats.downChecks}`, 300, yPosition + 24)
         .text(`Degraded: ${stats.stats.degradedChecks}`, 300, yPosition + 36);

      yPosition += 80;
    }

    doc.end();
  }

  async getReportData(userId: string, days: number): Promise<any> {
    const monitors = await this.monitoringService.findAll(userId);
    const dashboardStats = await this.monitoringService.getDashboardStats(userId);
    const reportData = [];

    for (const monitor of monitors) {
      const stats = await this.monitoringService.getMonitorStats(monitor._id.toString(), userId, days);
      reportData.push({
        monitor: {
          id: monitor._id,
          name: monitor.name,
          url: monitor.url,
          type: monitor.type,
          currentStatus: monitor.currentStatus,
        },
        stats: stats.stats,
        recentLogs: stats.logs.slice(0, 10), // Last 10 logs
      });
    }

    return {
      summary: dashboardStats,
      period: `${days} days`,
      generatedAt: new Date().toISOString(),
      monitors: reportData,
    };
  }
}
