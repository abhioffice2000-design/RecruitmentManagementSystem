import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="portal-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-brand">
          <span class="brand-icon"><i class="fas fa-briefcase"></i></span>
          <span class="brand-text" *ngIf="!sidebarCollapsed">Recruit</span>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems" [routerLink]="item.route"
             routerLinkActive="active" class="nav-link"
             [title]="item.label">
            <i [class]="item.icon"></i>
            <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="toggle-btn" (click)="sidebarCollapsed = !sidebarCollapsed">
            <i [class]="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
          </button>
          <button class="logout-btn" (click)="logout()" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
            <span *ngIf="!sidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="portal-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .portal-wrapper { display: flex; min-height: 100vh; background: #f1f5f9; }
    .sidebar {
      width: 250px; background: #1e293b; color: #e2e8f0; display: flex;
      flex-direction: column; transition: width 0.2s ease; position: fixed;
      top: 0; left: 0; bottom: 0; z-index: 100;
      &.collapsed { width: 64px; }
    }
    .sidebar-brand {
      padding: 20px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid #334155;
      .brand-icon { font-size: 24px; }
      .brand-text { font-size: 20px; font-weight: 700; }
    }
    .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; }
    .nav-link {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: 8px; color: #94a3b8; text-decoration: none; font-size: 14px;
      font-weight: 500; transition: all 0.15s;
      i { width: 20px; text-align: center; font-size: 16px; }
      &:hover { background: #334155; color: #e2e8f0; }
      &.active { background: #2563eb; color: #fff; }
    }
    .sidebar-footer {
      padding: 12px 8px; border-top: 1px solid #334155;
      display: flex; flex-direction: column; gap: 4px;
    }
    .toggle-btn, .logout-btn {
      display: flex; align-items: center; gap: 12px; padding: 10px 16px;
      border: none; background: transparent; color: #94a3b8; cursor: pointer;
      border-radius: 8px; font-size: 14px; width: 100%; text-align: left;
      &:hover { background: #334155; color: #e2e8f0; }
    }
    .logout-btn {
      color: #ef4444;
      &:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    }
    .portal-main { flex: 1; margin-left: 250px; padding: 24px; transition: margin-left 0.2s; }
    .sidebar.collapsed + .portal-main { margin-left: 64px; }
  `]
})
export class CandidatePortal {
  sidebarCollapsed = false;

  navItems = [
    { route: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { route: 'jobs', label: 'Browse Jobs', icon: 'fas fa-search' },
    { route: 'applications', label: 'My Applications', icon: 'fas fa-file-alt' },
  ];

  constructor(private router: Router) {}

  logout(): void {
    try {
      sessionStorage.clear();
      localStorage.clear();
      this.clearAllCookies();
      if (typeof $ !== 'undefined' && $?.cordys?.authentication?.sso) {
        $.cordys.authentication.sso.logout();
      }
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/login';
    }
  }

  private clearAllCookies(): void {
    const cookies = document.cookie.split(';');
    const hostname = window.location.hostname;
    const domains = [hostname, '.' + hostname, hostname.split('.').slice(-2).join('.'), ''];
    const paths = ['/', '', '/login', '/candidate'];
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        for (const domain of domains) {
          for (const path of paths) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}`;
            if (domain) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'};domain=${domain}`;
            }
          }
        }
      }
    }
    const cordysCookies = ['defaultinst_AuthContext', 'defaultinst_ct', 'defaultinst_SAMLart', 'JSESSIONID', 'SAMLart'];
    for (const cookieName of cordysCookies) {
      for (const domain of domains) {
        for (const path of paths) {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'}`;
          if (domain) {
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'};domain=${domain}`;
          }
        }
      }
    }
  }
}

