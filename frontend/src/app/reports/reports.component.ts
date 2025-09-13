import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  loading = false;
  reportData: any = null;
  selectedPeriod = 7;

  periodOptions = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' }
  ];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/reports/uptime/data?days=${this.selectedPeriod}`).subscribe({
      next: (data) => {
        this.reportData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report data:', error);
        this.snackBar.open('Error loading report data', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.loadReportData();
  }

  downloadCSV(): void {
    const url = `${environment.apiUrl}/reports/uptime/csv?days=${this.selectedPeriod}`;
    window.open(url, '_blank');
  }

  downloadPDF(): void {
    const url = `${environment.apiUrl}/reports/uptime/pdf?days=${this.selectedPeriod}`;
    window.open(url, '_blank');
  }

  refresh(): void {
    this.loadReportData();
  }

  formatUptime(uptime: number): string {
    return `${uptime.toFixed(2)}%`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'up': return 'status-up';
      case 'down': return 'status-down';
      case 'degraded': return 'status-degraded';
      default: return '';
    }
  }
}
