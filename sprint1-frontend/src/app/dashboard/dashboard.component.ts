import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../core/services/auth.service';
import { MonitorService, Monitor } from '../core/services/monitor.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  monitors: Monitor[] = [];
  loading = true;
  
  // Statistics
  totalMonitors = 0;
  upMonitors = 0;
  downMonitors = 0;
  pendingMonitors = 0;

  constructor(
    private authService: AuthService,
    private monitorService: MonitorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMonitors();
  }

  loadMonitors(): void {
    this.loading = true;
    this.monitorService.getMonitors().subscribe({
      next: (monitors) => {
        this.monitors = monitors;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to load monitors';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  calculateStats(): void {
    this.totalMonitors = this.monitors.length;
    this.upMonitors = this.monitors.filter(m => m.status === 'up').length;
    this.downMonitors = this.monitors.filter(m => m.status === 'down').length;
    this.pendingMonitors = this.monitors.filter(m => m.status === 'pending').length;
  }

  deleteMonitor(monitor: Monitor): void {
    if (confirm(`Are you sure you want to delete "${monitor.name}"?`)) {
      this.monitorService.deleteMonitor(monitor._id).subscribe({
        next: () => {
          this.snackBar.open('Monitor deleted successfully', 'Close', { duration: 3000 });
          this.loadMonitors();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete monitor';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  addMonitor(): void {
    this.router.navigate(['/add-monitor']);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  formatResponseTime(time: number | undefined): string {
    if (!time) return 'N/A';
    return `${time}ms`;
  }
}
