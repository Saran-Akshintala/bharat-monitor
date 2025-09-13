import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;
  sidenavOpened = true;

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'monitor', label: 'Monitors', route: '/monitors' },
    { icon: 'notifications', label: 'Alerts', route: '/alerts' },
    { icon: 'assessment', label: 'Reports', route: '/reports' },
    { icon: 'settings', label: 'Settings', route: '/settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
