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
        <h1><i class="fas fa-hand-sparkles"></i> Welcome Back</h1>
        <p>Track your applications and find new opportunities.</p>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card stat-apps">
          <div class="stat-icon-wrap"><i class="fas fa-file-alt"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ totalApplications }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
        </div>
        <div class="stat-card stat-active">
          <div class="stat-icon-wrap"><i class="fas fa-spinner"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ activeApplications }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
        <div class="stat-card stat-jobs">
          <div class="stat-icon-wrap"><i class="fas fa-briefcase"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ openJobs }}</div>
            <div class="stat-label">Open Positions</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn" (click)="router.navigate(['/candidate/jobs'])">
          <i class="fas fa-search"></i> Browse Jobs
        </button>
        <button class="action-btn" (click)="router.navigate(['/candidate/applications'])">
          <i class="fas fa-list-alt"></i> My Applications
        </button>
      </div>

      <!-- Recent Applications -->
      <div class="recent-section" *ngIf="recentApps.length > 0">
        <h3><i class="fas fa-clock"></i> Recent Applications</h3>
        <div class="recent-list">
          <div class="recent-card" *ngFor="let app of recentApps">
            <div class="recent-left">
              <div class="recent-avatar">{{ app.jobTitle.charAt(0) }}</div>
              <div>
                <span class="recent-title">{{ app.jobTitle }}</span>
                <span class="recent-date">Applied {{ formatDate(app.applied_at) }}</span>
              </div>
            </div>
            <div class="recent-right">
              <span class="stage-pill"><i class="fas fa-map-signs"></i> {{ app.stageName }}</span>
              <span class="status-pill" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { margin-bottom: 28px;
      h1 { margin: 0 0 4px; font-size: 26px; color: #1e293b; i { margin-right: 8px; color: #f59e0b; } }
      p { color: #64748b; margin: 0; font-size: 15px; }
    }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      display: flex; align-items: center; gap: 16px; background: #fff; padding: 22px 24px;
      border-radius: 14px; border: 1px solid #e2e8f0; transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    }
    .stat-icon-wrap {
      width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center;
      justify-content: center; font-size: 20px;
    }
    .stat-apps .stat-icon-wrap { background: #dbeafe; color: #2563eb; }
    .stat-active .stat-icon-wrap { background: #fef3c7; color: #d97706; }
    .stat-jobs .stat-icon-wrap { background: #dcfce7; color: #16a34a; }
    .stat-val { font-size: 30px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }

    /* Quick Actions */
    .quick-actions { display: flex; gap: 12px; margin-bottom: 28px; }
    .action-btn {
      padding: 14px 24px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      cursor: pointer; font-size: 14px; font-weight: 600; color: #475569; transition: all 0.15s;
      i { margin-right: 8px; }
      &:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    }

    /* Recent */
    .recent-section {
      h3 { font-size: 16px; color: #334155; margin: 0 0 14px; i { margin-right: 6px; color: #64748b; } }
    }
    .recent-list { display: flex; flex-direction: column; gap: 10px; }
    .recent-card {
      display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
      background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; transition: all 0.15s;
      &:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    }
    .recent-left { display: flex; align-items: center; gap: 14px; }
    .recent-avatar {
      width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;
    }
    .recent-title { display: block; font-weight: 600; color: #1e293b; font-size: 14px; }
    .recent-date { display: block; font-size: 12px; color: #94a3b8; }
    .recent-right { display: flex; align-items: center; gap: 10px; }
    .stage-pill {
      padding: 5px 12px; background: #eff6ff; color: #2563eb; border-radius: 16px;
      font-size: 12px; font-weight: 600; i { margin-right: 4px; font-size: 10px; }
    }
    .status-pill {
      padding: 5px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;
      &.active { background: #dcfce7; color: #166534; }
      &.hired { background: #dbeafe; color: #1e40af; }
      &.rejected { background: #fee2e2; color: #991b1b; }
    }
  `]
})
export class CandidateDashboardComponent implements OnInit {
  totalApplications = 0;
  activeApplications = 0;
  openJobs = 0;
  recentApps: { jobTitle: string; stageName: string; status: string; applied_at: string }[] = [];

  constructor(private soap: SoapService, public router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      const [jobs, apps, stages] = await Promise.all([
        this.soap.getJobRequisitions(),
        this.soap.getApplications(),
        this.soap.getPipelineStages()
      ]);

      this.openJobs = jobs.filter(j => (j['status'] || '').toUpperCase() === 'APPROVED').length;

      const jobMap = new Map<string, string>();
      jobs.forEach(j => jobMap.set(j['requisition_id'] || '', j['title'] || ''));

      const stageMap = new Map<string, string>();
      stages.forEach(s => stageMap.set(s['stage_id'] || '', s['stage_name'] || ''));

      this.totalApplications = apps.length;
      this.activeApplications = apps.filter(a => (a['status'] || '').toUpperCase() === 'ACTIVE').length;

      this.recentApps = apps
        .sort((a, b) => new Date(b['applied_at'] || b['created_at'] || '').getTime() - new Date(a['applied_at'] || a['created_at'] || '').getTime())
        .slice(0, 5)
        .map(a => ({
          jobTitle: jobMap.get(a['requisition_id'] || '') || a['requisition_id'] || '',
          stageName: stageMap.get(a['current_stage_id'] || '') || 'New',
          status: a['status'] || 'ACTIVE',
          applied_at: a['applied_at'] || a['created_at'] || ''
        }));
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
