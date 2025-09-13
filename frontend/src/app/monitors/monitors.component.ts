import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MonitorService, Monitor } from '../core/services/monitor.service';

@Component({
  selector: 'app-monitors',
  templateUrl: './monitors.component.html',
  styleUrls: ['./monitors.component.scss']
})
export class MonitorsComponent implements OnInit {
  displayedColumns: string[] = ['status', 'name', 'url', 'type', 'uptime', 'responseTime', 'lastChecked', 'actions'];
  dataSource = new MatTableDataSource<Monitor>();
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private monitorService: MonitorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMonitors();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMonitors(): void {
    this.loading = true;
    this.monitorService.getMonitors().subscribe({
      next: (monitors) => {
        this.dataSource.data = monitors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading monitors:', error);
        this.snackBar.open('Error loading monitors', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  viewMonitor(monitor: Monitor): void {
    this.router.navigate(['/monitors', monitor._id]);
  }

  editMonitor(monitor: Monitor): void {
    this.router.navigate(['/monitors', monitor._id, 'edit']);
  }

  deleteMonitor(monitor: Monitor): void {
    if (confirm(`Are you sure you want to delete "${monitor.name}"?`)) {
      this.monitorService.deleteMonitor(monitor._id).subscribe({
        next: () => {
          this.snackBar.open('Monitor deleted successfully', 'Close', { duration: 3000 });
          this.loadMonitors();
        },
        error: (error) => {
          console.error('Error deleting monitor:', error);
          this.snackBar.open('Error deleting monitor', 'Close', { duration: 5000 });
        }
      });
    }
  }

  addMonitor(): void {
    this.router.navigate(['/monitors/new']);
  }

  refresh(): void {
    this.loadMonitors();
  }

  formatDate(date: string): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  formatUptime(uptime: number): string {
    return uptime ? `${uptime.toFixed(1)}%` : '0%';
  }

  formatResponseTime(time: number): string {
    return time ? `${time}ms` : '-';
  }
}
