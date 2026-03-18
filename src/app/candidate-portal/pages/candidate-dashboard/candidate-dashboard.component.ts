import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SoapService } from '../../../services/soap.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-wrap animate-fade-in">
      <div class="page-header">
        <h1>Welcome Back 👋</h1>
        <p>Track your applications and find new opportunities.</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-body"><div class="stat-val">{{ totalApplications }}</div><div class="stat-label">Applications</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-body"><div class="stat-val">{{ openJobs }}</div><div class="stat-label">Open Positions</div></div>
        </div>
      </div>
      <div class="quick-actions">
        <button class="action-btn" (click)="router.navigate(['/candidate/jobs'])">🔍 Browse Jobs</button>
        <button class="action-btn" (click)="router.navigate(['/candidate/applications'])">📊 My Applications</button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .page-header { margin-bottom: 24px; h1 { margin: 0 0 4px; font-size: 24px; color: #1e293b; } p { color: #64748b; margin: 0; } }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { flex: 1; display: flex; align-items: center; gap: 16px; background: #fff; padding: 20px 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stat-icon { font-size: 32px; }
    .stat-val { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 13px; color: #64748b; }
    .quick-actions { display: flex; gap: 12px; }
    .action-btn { padding: 14px 24px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; color: #475569; &:hover { border-color: #2563eb; color: #2563eb; } }
  `]
})
export class CandidateDashboardComponent implements OnInit {
  totalApplications = 0;
  openJobs = 0;
  constructor(private soap: SoapService, public router: Router) {}
  ngOnInit(): void {
    this.soap.getJobRequisitions().then(jobs => {
      this.openJobs = jobs.filter(j => (j['status'] || '').toUpperCase() === 'APPROVED').length;
    }).catch(() => {});
  }
}
