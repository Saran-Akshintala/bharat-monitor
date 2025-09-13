import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/services/auth.service';
import { AlertService } from '../core/services/alert.service';

@Component({
  selector: 'app-alert-settings',
  templateUrl: './alert-settings.component.html',
  styleUrls: ['./alert-settings.component.scss']
})
export class AlertSettingsComponent implements OnInit {
  alertForm: FormGroup;
  loading = false;
  user: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private snackBar: MatSnackBar
  ) {
    this.alertForm = this.fb.group({
      email: ['', [Validators.email]],
      whatsapp: [''],
      slack: [''],
      teams: [''],
      emailEnabled: [true],
      whatsappEnabled: [false],
      slackEnabled: [false],
      teamsEnabled: [false]
    });
  }

  ngOnInit(): void {
    this.loadUserSettings();
  }

  private loadUserSettings(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        if (user.alertPreferences && typeof user.alertPreferences === 'object') {
          this.alertForm.patchValue({
            email: user.alertPreferences.email || user.email,
            whatsapp: user.alertPreferences.whatsapp || '',
            slack: user.alertPreferences.slack || '',
            teams: user.alertPreferences.teams || '',
            emailEnabled: user.alertPreferences.emailEnabled !== false,
            whatsappEnabled: user.alertPreferences.whatsappEnabled || false,
            slackEnabled: user.alertPreferences.slackEnabled || false,
            teamsEnabled: user.alertPreferences.teamsEnabled || false
          });
        } else {
          // Set default email from user profile
          this.alertForm.patchValue({
            email: user.email
          });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.alertForm.valid) {
      this.loading = true;
      const formValue = this.alertForm.value;
      
      const alertPreferences = {
        email: formValue.email,
        whatsapp: formValue.whatsapp,
        slack: formValue.slack,
        teams: formValue.teams,
        emailEnabled: formValue.emailEnabled,
        whatsappEnabled: formValue.whatsappEnabled,
        slackEnabled: formValue.slackEnabled,
        teamsEnabled: formValue.teamsEnabled
      };

      this.alertService.updateAlertPreferences(alertPreferences).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Alert settings updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Failed to update alert settings', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Error updating alert settings:', error);
        }
      });
    }
  }

  testAlert(channel: string): void {
    this.alertService.sendTestAlert(channel).subscribe({
      next: () => {
        this.snackBar.open(`Test alert sent via ${channel}!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.snackBar.open(`Failed to send test alert via ${channel}`, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Error sending test alert:', error);
      }
    });
  }
}
