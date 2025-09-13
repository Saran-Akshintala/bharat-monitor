import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertSettingsComponent } from './alert-settings/alert-settings.component';
import { MonitorFormComponent } from './monitors/monitor-form/monitor-form.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'alert-settings', component: AlertSettingsComponent, canActivate: [AuthGuard] },
  { path: 'monitors/new', component: MonitorFormComponent, canActivate: [AuthGuard] },
  { path: 'monitors/:id/edit', component: MonitorFormComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
