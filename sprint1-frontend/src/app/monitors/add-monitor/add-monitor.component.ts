import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MonitorService } from '../../core/services/monitor.service';

@Component({
  selector: 'app-add-monitor',
  templateUrl: './add-monitor.component.html',
  styleUrls: ['./add-monitor.component.scss']
})
export class AddMonitorComponent implements OnInit {
  monitorForm!: FormGroup;
  loading = false;

  monitorTypes = [
    { value: 'website', label: 'Website' },
    { value: 'api', label: 'API Endpoint' }
  ];

  intervals = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  constructor(
    private fb: FormBuilder,
    private monitorService: MonitorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.monitorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      url: ['', [Validators.required, this.urlValidator]],
      type: ['website', [Validators.required]],
      interval: [5, [Validators.required, Validators.min(1)]]
    });
  }

  urlValidator(control: any) {
    const url = control.value;
    if (!url) return null;
    
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url) ? null : { invalidUrl: true };
  }

  onSubmit(): void {
    if (this.monitorForm.valid) {
      this.loading = true;
      
      this.monitorService.createMonitor(this.monitorForm.value).subscribe({
        next: (monitor) => {
          this.loading = false;
          this.snackBar.open('Monitor created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || 'Failed to create monitor. Please try again.';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  getErrorMessage(field: string): string {
    const control = this.monitorForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${requiredLength} characters long`;
    }
    if (control?.hasError('min')) {
      return 'Interval must be at least 1 minute';
    }
    if (control?.hasError('invalidUrl')) {
      return 'Please enter a valid URL starting with http:// or https://';
    }
    return '';
  }
}
