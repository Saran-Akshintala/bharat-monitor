import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Monitor {
  _id: string;
  name: string;
  url: string;
  type: 'website' | 'api';
  checkInterval: number;
  expectedStatusCodes: number[];
  currentStatus: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheckedAt: string;
  uptimePercentage: number;
  totalChecks: number;
  failedChecks: number;
  httpMethod?: string;
  httpHeaders?: Record<string, string>;
  httpBody?: string;
  timeout?: number;
}

export interface MonitorLog {
  _id: string;
  monitorId: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  checkedAt: string;
}

export interface DashboardStats {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  degradedMonitors: number;
  avgUptimePercentage: number;
  monitors: any[];
}

export interface MonitorStats {
  monitor: {
    id: string;
    name: string;
    url: string;
    type: string;
    currentStatus: string;
  };
  stats: {
    totalChecks: number;
    upChecks: number;
    downChecks: number;
    degradedChecks: number;
    uptimePercentage: number;
    avgResponseTime: number;
  };
  logs: MonitorLog[];
}

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private apiUrl = `${environment.apiUrl}/monitors`;

  constructor(private http: HttpClient) {}

  getMonitors(): Observable<Monitor[]> {
    return this.http.get<Monitor[]>(this.apiUrl);
  }

  getMonitor(id: string): Observable<Monitor> {
    return this.http.get<Monitor>(`${this.apiUrl}/${id}`);
  }

  createMonitor(monitor: Partial<Monitor>): Observable<Monitor> {
    return this.http.post<Monitor>(this.apiUrl, monitor);
  }

  updateMonitor(id: string, monitor: Partial<Monitor>): Observable<Monitor> {
    return this.http.patch<Monitor>(`${this.apiUrl}/${id}`, monitor);
  }

  deleteMonitor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getMonitorLogs(id: string, limit?: number): Observable<MonitorLog[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<MonitorLog[]>(`${this.apiUrl}/${id}/logs`, { params });
  }

  getMonitorStats(id: string, days?: number): Observable<MonitorStats> {
    let params = new HttpParams();
    if (days) {
      params = params.set('days', days.toString());
    }
    return this.http.get<MonitorStats>(`${this.apiUrl}/${id}/stats`, { params });
  }
}
