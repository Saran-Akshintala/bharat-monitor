import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MonitorService, Monitor } from '../../core/services/monitor.service';

@Component({
  selector: 'app-monitor-form',
  templateUrl: './monitor-form.component.html',
  styleUrls: ['./monitor-form.component.scss']
})
export class MonitorFormComponent implements OnInit {
  monitorForm!: FormGroup;
  loading = false;
  isEditMode = false;
  monitorId: string | null = null;

  monitorTypes = [
    { value: 'website', label: 'Website' },
    { value: 'api', label: 'API Endpoint' }
  ];

  httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  constructor(
    private fb: FormBuilder,
    private monitorService: MonitorService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.monitorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      type: ['website', Validators.required],
      checkInterval: [5, [Validators.required, Validators.min(1), Validators.max(60)]],
      expectedStatusCodes: [this.fb.array([200, 201, 202, 204])],
      httpMethod: ['GET'],
      httpHeaders: [''],
      httpBody: [''],
      timeout: [30000, [Validators.min(1000), Validators.max(120000)]]
    });

    // Watch for type changes to adjust form
    this.monitorForm.get('type')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });
  }

  private checkEditMode(): void {
    this.monitorId = this.route.snapshot.paramMap.get('id');
    if (this.monitorId) {
      this.isEditMode = true;
      this.loadMonitor();
    }
  }

  private loadMonitor(): void {
    if (!this.monitorId) return;
    
    this.loading = true;
    this.monitorService.getMonitor(this.monitorId).subscribe({
      next: (monitor) => {
        this.populateForm(monitor);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading monitor:', error);
        this.snackBar.open('Error loading monitor', 'Close', { duration: 5000 });
        this.router.navigate(['/monitors']);
      }
    });
  }

  private populateForm(monitor: Monitor): void {
    this.monitorForm.patchValue({
      name: monitor.name,
      url: monitor.url,
      type: monitor.type,
      checkInterval: monitor.checkInterval,
      expectedStatusCodes: monitor.expectedStatusCodes,
      httpMethod: monitor.httpMethod || 'GET',
      httpHeaders: monitor.httpHeaders ? JSON.stringify(monitor.httpHeaders, null, 2) : '',
      httpBody: monitor.httpBody || '',
      timeout: monitor.timeout || 30000
    });
  }

  private onTypeChange(type: string): void {
    const httpMethodControl = this.monitorForm.get('httpMethod');
    const httpBodyControl = this.monitorForm.get('httpBody');
    
    if (type === 'website') {
      httpMethodControl?.setValue('GET');
      httpBodyControl?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.monitorForm.valid) {
      this.loading = true;
      
      const formData = this.prepareFormData();
      
      const operation = this.isEditMode 
        ? this.monitorService.updateMonitor(this.monitorId!, formData)
        : this.monitorService.createMonitor(formData);

      operation.subscribe({
        next: (monitor) => {
          this.loading = false;
          const message = this.isEditMode ? 'Monitor updated successfully' : 'Monitor created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/monitors', monitor._id]);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving monitor:', error);
          const message = error.error?.message || 'Error saving monitor';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  private prepareFormData(): Partial<Monitor> {
    const formValue = this.monitorForm.value;
    
    // Parse headers if provided
    let httpHeaders = undefined;
    if (formValue.httpHeaders?.trim()) {
      try {
        httpHeaders = JSON.parse(formValue.httpHeaders);
      } catch (e) {
        // If JSON parsing fails, treat as simple key:value format
        const headers: Record<string, string> = {};
        formValue.httpHeaders.split('\n').forEach((line: string) => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(':').trim();
          }
        });
        httpHeaders = headers;
      }
    }

    return {
      name: formValue.name,
      url: formValue.url,
      type: formValue.type,
      checkInterval: formValue.checkInterval,
      expectedStatusCodes: formValue.expectedStatusCodes,
      httpMethod: formValue.httpMethod,
      httpHeaders,
      httpBody: formValue.httpBody || undefined,
      timeout: formValue.timeout
    };
  }

  getErrorMessage(field: string): string {
    const control = this.monitorForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid URL starting with http:// or https://';
    }
    if (control?.hasError('minlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `Value must be at least ${control.errors?.['min']?.min}`;
    }
    if (control?.hasError('max')) {
      return `Value must be at most ${control.errors?.['max']?.max}`;
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/monitors']);
  }

  isApiType(): boolean {
    return this.monitorForm.get('type')?.value === 'api';
  }

  addStatusCode(): void {
    // Implementation for adding custom status codes
  }

  testConnection(): void {
    // Implementation for testing the connection
    this.snackBar.open('Test connection feature coming soon', 'Close', { duration: 3000 });
  }
}
