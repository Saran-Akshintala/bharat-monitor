import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MonitorService, Monitor, MonitorStats, MonitorLog } from '../../core/services/monitor.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-monitor-details',
  templateUrl: './monitor-details.component.html',
  styleUrls: ['./monitor-details.component.scss']
})
export class MonitorDetailsComponent implements OnInit {
  monitor: Monitor | null = null;
  monitorStats: MonitorStats | null = null;
  recentLogs: MonitorLog[] = [];
  loading = true;
  statsLoading = false;
  selectedPeriod = 7;

  // Chart configuration
  public chartType: ChartType = 'line';
  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Response Time (ms)',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };

  periodOptions = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private monitorService: MonitorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMonitor(id);
      this.loadMonitorStats(id);
    }
  }

  loadMonitor(id: string): void {
    this.loading = true;
    this.monitorService.getMonitor(id).subscribe({
      next: (monitor) => {
        this.monitor = monitor;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading monitor:', error);
        this.snackBar.open('Error loading monitor details', 'Close', { duration: 5000 });
        this.router.navigate(['/monitors']);
      }
    });
  }

  loadMonitorStats(id: string, days: number = this.selectedPeriod): void {
    this.statsLoading = true;
    this.monitorService.getMonitorStats(id, days).subscribe({
      next: (stats) => {
        this.monitorStats = stats;
        this.updateChart();
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Error loading monitor stats:', error);
        this.snackBar.open('Error loading statistics', 'Close', { duration: 3000 });
        this.statsLoading = false;
      }
    });

    // Load recent logs
    this.monitorService.getMonitorLogs(id, 50).subscribe({
      next: (logs) => {
        this.recentLogs = logs;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
      }
    });
  }

  onPeriodChange(): void {
    if (this.monitor) {
      this.loadMonitorStats(this.monitor._id, this.selectedPeriod);
    }
  }

  private updateChart(): void {
    if (!this.monitorStats) return;

    const logs = this.monitorStats.logs.slice().reverse(); // Reverse to show chronological order
    const labels = logs.map(log => new Date(log.checkedAt).toLocaleTimeString());
    const data = logs.map(log => log.responseTime);

    this.chartData = {
      labels,
      datasets: [{
        label: 'Response Time (ms)',
        data,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'up': return 'status-up';
      case 'down': return 'status-down';
      case 'degraded': return 'status-degraded';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'up': return 'check_circle';
      case 'down': return 'error';
      case 'degraded': return 'warning';
      default: return 'help';
    }
  }

  editMonitor(): void {
    if (this.monitor) {
      this.router.navigate(['/monitors', this.monitor._id, 'edit']);
    }
  }

  deleteMonitor(): void {
    if (!this.monitor) return;

    if (confirm(`Are you sure you want to delete "${this.monitor.name}"?`)) {
      this.monitorService.deleteMonitor(this.monitor._id).subscribe({
        next: () => {
          this.snackBar.open('Monitor deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/monitors']);
        },
        error: (error) => {
          console.error('Error deleting monitor:', error);
          this.snackBar.open('Error deleting monitor', 'Close', { duration: 5000 });
        }
      });
    }
  }

  refresh(): void {
    if (this.monitor) {
      this.loadMonitor(this.monitor._id);
      this.loadMonitorStats(this.monitor._id, this.selectedPeriod);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  formatUptime(uptime: number): string {
    return `${uptime.toFixed(2)}%`;
  }

  getLogStatusClass(status: string): string {
    return this.getStatusClass(status);
  }

  openUrl(): void {
    if (this.monitor?.url) {
      window.open(this.monitor.url, '_blank');
    }
  }
}
