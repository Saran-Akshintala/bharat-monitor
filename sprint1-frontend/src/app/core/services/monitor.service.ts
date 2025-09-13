import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Monitor {
  _id: string;
  name: string;
  url: string;
  type: 'website' | 'api';
  interval: number;
  status: 'up' | 'down' | 'pending';
  lastResponseTime: number;
  lastStatusCode?: number;
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMonitorDto {
  name: string;
  url: string;
  type: 'website' | 'api';
  interval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  constructor(private http: HttpClient) {}

  getMonitors(): Observable<Monitor[]> {
    return this.http.get<Monitor[]>(`${environment.apiUrl}/monitors`);
  }

  createMonitor(monitor: CreateMonitorDto): Observable<Monitor> {
    return this.http.post<Monitor>(`${environment.apiUrl}/monitors`, monitor);
  }

  deleteMonitor(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/monitors/${id}`);
  }
}
