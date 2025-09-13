import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  alertForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  alertLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.alertForm = this.fb.group({
      emailAlertsEnabled: [true],
      whatsappAlertsEnabled: [false],
      whatsappNumber: [''],
      slackAlertsEnabled: [false],
      slackWebhookUrl: [''],
      teamsAlertsEnabled: [false],
      teamsWebhookUrl: ['']
    });
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
      }
    });

    // Load user preferences
    this.http.get(`${environment.apiUrl}/users/profile`).subscribe({
      next: (userData: any) => {
        this.alertForm.patchValue({
          emailAlertsEnabled: userData.emailAlertsEnabled ?? true,
          whatsappAlertsEnabled: userData.whatsappAlertsEnabled ?? false,
          whatsappNumber: userData.whatsappNumber || '',
          slackAlertsEnabled: userData.slackAlertsEnabled ?? false,
          slackWebhookUrl: userData.slackWebhookUrl || '',
          teamsAlertsEnabled: userData.teamsAlertsEnabled ?? false,
          teamsWebhookUrl: userData.teamsWebhookUrl || ''
        });
      },
      error: (error) => {
        console.error('Error loading user preferences:', error);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      
      this.http.patch(`${environment.apiUrl}/users/profile`, this.profileForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating profile:', error);
          this.snackBar.open('Error updating profile', 'Close', { duration: 5000 });
        }
      });
    }
  }

  updateAlertPreferences(): void {
    if (this.alertForm.valid) {
      this.alertLoading = true;
      
      this.http.patch(`${environment.apiUrl}/users/alert-preferences`, this.alertForm.value).subscribe({
        next: (response) => {
          this.alertLoading = false;
          this.snackBar.open('Alert preferences updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.alertLoading = false;
          console.error('Error updating alert preferences:', error);
          this.snackBar.open('Error updating alert preferences', 'Close', { duration: 5000 });
        }
      });
    }
  }

  testAlert(type: string): void {
    this.snackBar.open(`Test ${type} alert sent!`, 'Close', { duration: 3000 });
  }

  getErrorMessage(field: string, form: FormGroup): string {
    const control = form.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    return '';
  }
}
