import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Alert {
  _id: string;
  monitorId: {
    name: string;
    url: string;
  };
  type: string;
  message: string;
  status: string;
  triggeredAt: string;
  sentAt?: string;
  recipient: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  displayedColumns: string[] = ['status', 'monitor', 'type', 'message', 'triggeredAt', 'recipient'];
  dataSource = new MatTableDataSource<Alert>();
  loading = true;
  alertStats: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAlerts();
    this.loadAlertStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAlerts(): void {
    this.loading = true;
    this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({
      next: (alerts) => {
        this.dataSource.data = alerts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        this.loading = false;
      }
    });
  }

  loadAlertStats(): void {
    this.http.get(`${environment.apiUrl}/alerts/stats`).subscribe({
      next: (stats) => {
        this.alertStats = stats;
      },
      error: (error) => {
        console.error('Error loading alert stats:', error);
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
      case 'sent': return 'status-sent';
      case 'failed': return 'status-failed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return 'check_circle';
      case 'failed': return 'error';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'email': return 'email';
      case 'whatsapp': return 'chat';
      case 'slack': return 'chat_bubble';
      case 'teams': return 'groups';
      default: return 'notifications';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  refresh(): void {
    this.loadAlerts();
    this.loadAlertStats();
  }
}
