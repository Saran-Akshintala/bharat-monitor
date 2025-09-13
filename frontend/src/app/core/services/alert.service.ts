import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(limit?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getAlertStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  updateAlertPreferences(preferences: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/auth/alert-preferences`, preferences);
  }

  sendTestAlert(channel: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/test`, { channel });
  }
}
