import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/services/auth.service';
import { MonitorService } from '../core/services/monitor.service';
import { AlertService } from '../core/services/alert.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  user: any = null;
  monitors: any[] = [];
  alerts: any[] = [];
  stats = {
    total: 0,
    up: 0,
    down: 0,
    uptime: 0
  };

  // Chart data
  public chartType: ChartType = 'doughnut';
  public chartData: ChartData<'doughnut'> = {
    labels: ['Up', 'Down'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  responseTimeChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Response Time (ms)',
      data: [],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4
    }]
  };

  responseTimeChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
          text: 'Monitor'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  constructor(
    private authService: AuthService,
    private monitorService: MonitorService,
    private alertService: AlertService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load user info
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Load monitors
    this.monitorService.getMonitors().subscribe({
      next: (monitors) => {
        this.monitors = monitors;
        this.calculateStats();
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading monitors:', error);
        this.loading = false;
      }
    });

    // Load recent alerts
    this.alertService.getAlerts(10).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.monitors.length;
    this.stats.up = this.monitors.filter(m => m.status === 'UP').length;
    this.stats.down = this.monitors.filter(m => m.status === 'DOWN').length;
    this.stats.uptime = this.stats.total > 0 ? (this.stats.up / this.stats.total) * 100 : 0;
  }

  updateCharts(): void {
    // Update status chart
    this.chartData = {
      labels: ['Up', 'Down'],
      datasets: [{
        data: [this.stats.up, this.stats.down],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Update response time chart
    const chartData = this.monitors
      .filter(m => m.responseTime)
      .slice(0, 10)
      .map(m => ({
        label: m.name,
        value: m.responseTime
      }));

    this.responseTimeChartData = {
      labels: chartData.map(d => d.label),
      datasets: [{
        label: 'Response Time (ms)',
        data: chartData.map(d => d.value),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      }]
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'UP': return 'status-up';
      case 'DOWN': return 'status-down';
      default: return 'status-unknown';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'UP': return 'check_circle';
      case 'DOWN': return 'error';
      default: return 'help';
    }
  }

  refresh(): void {
    this.loadDashboardData();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteMonitor(id: string): void {
    if (confirm('Are you sure you want to delete this monitor?')) {
      this.monitorService.deleteMonitor(id).subscribe({
        next: () => {
          this.snackBar.open('Monitor deleted successfully', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete monitor', 'Close', { duration: 3000 });
          console.error('Error deleting monitor:', error);
        }
      });
    }
  }
}
