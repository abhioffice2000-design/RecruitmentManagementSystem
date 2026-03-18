import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoapService } from '../../../services/soap.service';

@Component({
  selector: 'app-candidate-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap animate-fade-in">
      <div class="page-header">
        <h1>My Applications</h1>
        <p>Track the status of your submitted applications.</p>
      </div>
      <div class="loading" *ngIf="isLoading"><div class="spinner"></div><p>Loading...</p></div>
      <div class="empty" *ngIf="!isLoading && applications.length === 0">
        <p>You haven't applied to any jobs yet.</p>
      </div>
      <div class="app-list" *ngIf="!isLoading && applications.length > 0">
        <div class="app-card" *ngFor="let app of applications">
          <div class="app-info">
            <h4>{{ app.jobTitle || app.requisition_id }}</h4>
            <span class="app-id">{{ app.application_id }}</span>
          </div>
          <div class="app-status">
            <span class="status-badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
            <span class="stage">{{ app.stageName }}</span>
          </div>
          <span class="app-date">{{ formatDate(app.applied_at) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .page-header { margin-bottom: 24px; h1 { margin: 0 0 4px; font-size: 24px; color: #1e293b; } p { color: #64748b; margin: 0; } }
    .loading { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8;
      .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty { text-align: center; padding: 60px; background: #fff; border-radius: 12px; border: 1px dashed #e2e8f0; color: #94a3b8; }
    .app-list { display: flex; flex-direction: column; gap: 12px; }
    .app-card { display: flex; align-items: center; background: #fff; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; gap: 20px; }
    .app-info { flex: 1; h4 { margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1e293b; } .app-id { font-size: 12px; color: #94a3b8; } }
    .app-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .status-badge { padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600;
      &.active { background: #dcfce7; color: #166534; }
      &.rejected { background: #fee2e2; color: #991b1b; }
      &.hold { background: #fef3c7; color: #92400e; }
    }
    .stage { font-size: 12px; color: #64748b; }
    .app-date { font-size: 12px; color: #94a3b8; white-space: nowrap; }
  `]
})
export class CandidateApplicationsComponent implements OnInit {
  applications: any[] = [];
  isLoading = true;
  private stageMap = new Map<string, string>();

  constructor(private soap: SoapService) {}

  async ngOnInit(): Promise<void> {
    try {
      // Load stages
      const stages = await this.soap.getPipelineStages();
      stages.forEach(s => this.stageMap.set(s['stage_id'] || '', s['stage_name'] || ''));

      // Load jobs for title mapping
      const jobs = await this.soap.getJobRequisitions();
      const jobMap = new Map<string, string>();
      jobs.forEach(j => jobMap.set(j['requisition_id'] || '', j['title'] || ''));

      // Load all applications (for now load all — in production filter by candidate)
      const apps = await this.soap.getApplications();
      this.applications = apps.map(a => ({
        ...a,
        jobTitle: jobMap.get(a['requisition_id'] || '') || a['requisition_id'] || '',
        stageName: this.stageMap.get(a['current_stage_id'] || '') || 'New',
        applied_at: a['applied_at'] || a['created_at'] || ''
      }));
    } catch (e) {
      console.error('Failed to load applications:', e);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
