import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SoapService } from '../../services/soap.service';

interface CandidateRow {
  application_id: string;
  candidate_id: string;
  requisition_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  experience_years: string;
  location: string;
  source: string;
  status: string;
  current_stage_id: string;
  stage_name: string;
  applied_at: string;
  _raw: Record<string, string>;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-content">
      <div class="header">
        <h2>Candidates</h2>
        <div class="user-info"><span class="icon">🔔</span></div>
      </div>

      <!-- Job Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>Filter by Job:</label>
          <select [(ngModel)]="selectedJobId" (ngModelChange)="onJobChange()" class="filter-select job-select">
            <option value="ALL">All Jobs</option>
            <option *ngFor="let j of jobs" [value]="j.requisition_id">
              {{ j.title }} — {{ j.department_name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search candidates..."
                   [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                   class="search-input">
          </div>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="stageFilter" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">All Stages</option>
            <option *ngFor="let s of stages" [value]="s.stage_id">{{ s.stage_name }}</option>
          </select>
        </div>
        <div class="stats-pill" *ngIf="!isLoading">
          <strong>{{ filteredCandidates.length }}</strong> candidate{{ filteredCandidates.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading candidates...</p>
      </div>

      <!-- Tabs -->
      <div class="candidates-container" *ngIf="!isLoading">
        <div class="tabs-header">
          <button [class.active]="activeTab === 'active'" (click)="activeTab = 'active'; applyFilters()">
            Active <span class="tab-count">{{ activeCount }}</span>
          </button>
          <button [class.active]="activeTab === 'hired'" (click)="activeTab = 'hired'; applyFilters()">
            Hired <span class="tab-count">{{ hiredCount }}</span>
          </button>
          <button [class.active]="activeTab === 'rejected'" (click)="activeTab = 'rejected'; applyFilters()">
            Rejected <span class="tab-count">{{ rejectedCount }}</span>
          </button>
        </div>

        <!-- Table -->
        <div class="tab-content">
          <table class="candidates-table" *ngIf="filteredCandidates.length > 0">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Role</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCandidates" (click)="openProfile(c)" class="clickable-row">
                <td>
                  <div class="candidate-cell">
                    <div class="avatar-circle">{{ getInitials(c.candidate_name) }}</div>
                    <div class="cell-text">
                      <span class="name">{{ c.candidate_name }}</span>
                      <span class="email">{{ c.candidate_email }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="job-badge">{{ getJobTitle(c.requisition_id) }}</span></td>
                <td><span class="stage-badge" [attr.data-stage]="c.stage_name.toLowerCase()">{{ c.stage_name }}</span></td>
                <td><span class="source-text">{{ c.source || 'Direct' }}</span></td>
                <td><span class="date-text">{{ formatDate(c.applied_at) }}</span></td>
                <td>
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-view" (click)="openProfile(c)"><i class="fas fa-user"></i> Profile</button>
                    <button class="btn-pipeline" (click)="openPipelineModal(c)"><i class="fas fa-project-diagram"></i> Pipeline</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="filteredCandidates.length === 0">
            <i class="fas fa-clipboard-list empty-icon-fa"></i>
            <h3>No candidates found</h3>
            <p>Try adjusting your filters or select a different job.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CANDIDATE PROFILE DRAWER ═══ -->
    <div class="drawer-overlay" *ngIf="showDrawer" (click)="closeDrawer()"></div>
    <div class="drawer-panel" [class.open]="showDrawer">
      <div class="drawer-header">
        <h3><i class="fas fa-user-circle"></i> Candidate Profile</h3>
        <button class="drawer-close" (click)="closeDrawer()"><i class="fas fa-times"></i></button>
      </div>
      <div class="drawer-body" *ngIf="selectedCandidate">
        <div class="profile-hero">
          <div class="avatar-large">{{ getInitials(selectedCandidate.candidate_name) }}</div>
          <div>
            <h2 class="profile-name">{{ selectedCandidate.candidate_name }}</h2>
            <span class="profile-email">{{ selectedCandidate.candidate_email }}</span>
          </div>
        </div>

        <div class="profile-section">
          <h4>Contact</h4>
          <div class="info-grid">
            <div class="info-item"><span class="info-label"><i class="fas fa-envelope"></i> Email</span><span>{{ selectedCandidate.candidate_email }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-phone"></i> Phone</span><span>{{ selectedCandidate.candidate_phone || 'N/A' }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-map-marker-alt"></i> Location</span><span>{{ selectedCandidate.location || 'N/A' }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-briefcase"></i> Experience</span><span>{{ selectedCandidate.experience_years || '0' }} years</span></div>
          </div>
        </div>

        <div class="profile-section">
          <h4>Application</h4>
          <div class="info-grid">
            <div class="info-item"><span class="info-label"><i class="fas fa-building"></i> Job</span><span>{{ getJobTitle(selectedCandidate.requisition_id) }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-project-diagram"></i> Stage</span><span class="stage-badge" [attr.data-stage]="selectedCandidate.stage_name.toLowerCase()">{{ selectedCandidate.stage_name }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-link"></i> Source</span><span>{{ selectedCandidate.source || 'Direct' }}</span></div>
            <div class="info-item"><span class="info-label"><i class="fas fa-calendar-alt"></i> Applied</span><span>{{ formatDate(selectedCandidate.applied_at) }}</span></div>
          </div>
        </div>

        <div class="profile-section" *ngIf="candidateSkills.length > 0">
          <h4>Skills</h4>
          <div class="skills-list">
            <span class="skill-chip" *ngFor="let sk of candidateSkills">
              {{ getSkillName(sk['skill_id']) }} <small>({{ sk['experience_years'] || '0' }} yrs)</small>
            </span>
          </div>
        </div>

        <div class="drawer-actions">
          <button class="btn-pipeline-lg" (click)="openPipelineModal(selectedCandidate)"><i class="fas fa-project-diagram"></i> Change Pipeline Stage</button>
        </div>
      </div>
    </div>

    <!-- ═══ INLINE PIPELINE MODAL ═══ -->
    <div class="modal-overlay" *ngIf="showPipelineModal" (click)="closePipelineModal()">
      <div class="modal-card pipeline-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="fas fa-project-diagram"></i> Pipeline — {{ pipelineCandidate?.candidate_name }}</h3>
          <button class="modal-close" (click)="closePipelineModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" *ngIf="pipelineCandidate">
          <div class="pipeline-info-row">
            <div class="pipeline-avatar">{{ getInitials(pipelineCandidate.candidate_name) }}</div>
            <div>
              <span class="pipeline-cand-name">{{ pipelineCandidate.candidate_name }}</span>
              <span class="pipeline-job-name">{{ getJobTitle(pipelineCandidate.requisition_id) }}</span>
            </div>
          </div>

          <div class="pipeline-stages">
            <div class="pipeline-track">
              <div class="pipeline-fill" [style.width]="getPipelineProgress()"></div>
            </div>
            <div class="pipeline-dots">
              <div class="pipeline-dot-wrap" *ngFor="let s of stages"
                   [class.completed]="getPipelineStageStatus(s) === 'completed'"
                   [class.current]="getPipelineStageStatus(s) === 'current'"
                   [class.pending]="getPipelineStageStatus(s) === 'pending'"
                   (click)="onPipelineStageClick(s)">
                <div class="pipeline-dot">
                  <i class="fas" [ngClass]="getStageIcon(s.stage_name)"></i>
                </div>
                <span class="pipeline-stage-label">{{ s.stage_name }}</span>
              </div>
            </div>
          </div>

          <div class="pipeline-confirm" *ngIf="pendingStageMove">
            <div class="confirm-text">
              Move from <strong>{{ pipelineCandidate.stage_name }}</strong>
              <i class="fas fa-arrow-right"></i>
              <strong>{{ pendingStageMove.stage_name }}</strong>?
            </div>
            <div class="confirm-btns">
              <button class="btn-cancel-sm" (click)="pendingStageMove = null"><i class="fas fa-times"></i> Cancel</button>
              <button class="btn-confirm-sm" (click)="confirmStageMove()" [disabled]="isStageMoveInProgress">
                <i class="fas" [ngClass]="isStageMoveInProgress ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                {{ isStageMoveInProgress ? 'Moving...' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../hr-dashboard/hr-dashboard.scss'],
  styles: [`
    /* ── Filter Bar ── */
    .filter-bar {
      display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap;
      background: #fff; padding: 14px 20px; border-radius: 12px;
      border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .filter-group { display: flex; align-items: center; gap: 8px;
      label { font-weight: 600; font-size: 13px; color: #475569; white-space: nowrap; }
    }
    .filter-select { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; cursor: pointer; &:focus { border-color: #2563eb; } }
    .job-select { min-width: 260px; }
    .search-wrap { position: relative;
      .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #64748b; }
      .search-input { padding: 10px 16px 10px 36px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; width: 220px; outline: none; &:focus { border-color: #2563eb; } }
    }
    .stats-pill { margin-left: auto; padding: 6px 14px; background: #eff6ff; color: #2563eb; border-radius: 20px; font-size: 13px; font-weight: 600; white-space: nowrap; }

    /* ── Loading ── */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8;
      .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Container ── */
    .candidates-container {
      background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden;
    }
    .tabs-header {
      display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; padding: 0 24px;
      button { background: none; border: none; padding: 16px 20px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; position: relative; transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        &:hover { color: #1e293b; }
        &.active { color: #2563eb;
          &::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #2563eb; border-radius: 3px 3px 0 0; }
        }
        .tab-count { padding: 2px 8px; background: #e2e8f0; border-radius: 10px; font-size: 11px; }
        &.active .tab-count { background: #dbeafe; color: #2563eb; }
      }
    }
    .tab-content { padding: 0; }

    /* ── Table ── */
    .candidates-table { width: 100%; border-collapse: collapse;
      th { text-align: left; padding: 14px 16px; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
      td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 14px; }
      .clickable-row { cursor: pointer; transition: background 0.15s; &:hover td { background: #f0f9ff; } }
    }
    .candidate-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .cell-text { display: flex; flex-direction: column;
      .name { font-weight: 600; color: #1e293b; }
      .email { font-size: 12px; color: #94a3b8; }
    }
    .job-badge { padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-size: 13px; font-weight: 500; color: #475569; }
    .stage-badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #e2e8f0; color: #475569;
      &[data-stage="applied"] { background: #dbeafe; color: #1e40af; }
      &[data-stage="screening"] { background: #fef3c7; color: #92400e; }
      &[data-stage="interview"] { background: #ede9fe; color: #5b21b6; }
      &[data-stage="offer"] { background: #d1fae5; color: #065f46; }
      &[data-stage="hired"] { background: #dcfce7; color: #166534; }
    }
    .source-text { font-size: 13px; color: #64748b; }
    .date-text { font-size: 13px; color: #64748b; }
    .action-btns { display: flex; gap: 6px; }
    .btn-view { padding: 6px 12px; border: 1px solid #2563eb; background: #fff; color: #2563eb; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; &:hover { background: #2563eb; color: #fff; } }
    .btn-pipeline { padding: 6px 12px; border: 1px solid #10b981; background: #fff; color: #10b981; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; &:hover { background: #10b981; color: #fff; } }

    /* ── Empty State ── */
    .empty-state { text-align: center; padding: 60px 20px;
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
      h3 { color: #475569; margin: 0 0 8px; }
      p { color: #94a3b8; font-size: 14px; margin: 0; }
    }

    /* ── DRAWER ── */
    .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 900; animation: fadeIn 0.2s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .drawer-panel { position: fixed; top: 0; right: -480px; width: 460px; height: 100vh; background: #fff; z-index: 1000; box-shadow: -4px 0 20px rgba(0,0,0,0.12); transition: right 0.3s ease; overflow-y: auto;
      &.open { right: 0; }
    }
    .drawer-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #fff; z-index: 1;
      h3 { margin: 0; font-size: 18px; color: #1e293b; }
      .drawer-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b; padding: 4px; &:hover { color: #ef4444; } }
    }
    .drawer-body { padding: 24px; }
    .profile-hero { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .avatar-large { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; flex-shrink: 0; }
    .profile-name { margin: 0; font-size: 20px; color: #1e293b; }
    .profile-email { font-size: 14px; color: #64748b; }
    .profile-section { margin-bottom: 24px;
      h4 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin: 0 0 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { display: flex; flex-direction: column; gap: 2px;
      .info-label { font-size: 12px; color: #94a3b8; }
      span:last-child { font-size: 14px; color: #1e293b; font-weight: 500; }
    }
    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; font-size: 13px; color: #1e40af; font-weight: 500;
      small { font-weight: 400; color: #64748b; }
    }
    .drawer-actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .btn-pipeline-lg { width: 100%; padding: 12px; border: none; background: #2563eb; color: #fff; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; &:hover { background: #1d4ed8; } }

    /* ── INLINE PIPELINE MODAL ── */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s; }
    .modal-card { background: white; border-radius: 14px; width: 480px; max-width: 95%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); overflow: hidden; }
    .modal-header { padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;
      h3 { margin: 0; font-size: 17px; color: #1e293b; i { margin-right: 8px; color: #2563eb; } }
      .modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; padding: 4px; &:hover { color: #ef4444; } }
    }
    .modal-body { padding: 24px; }
    
    .pipeline-info-row { display: flex; align-items: center; gap: 16px; margin-bottom: 30px; }
    .pipeline-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
    .pipeline-cand-name { font-size: 18px; font-weight: 600; color: #1e293b; display: block; }
    .pipeline-job-name { font-size: 13px; color: #64748b; font-weight: 500; }

    .pipeline-stages { position: relative; padding-bottom: 20px; }
    .pipeline-track { height: 4px; background: #e2e8f0; border-radius: 4px; position: relative; margin: 0 28px; }
    .pipeline-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #7c3aed); border-radius: 4px; transition: width 0.5s ease; }
    
    .pipeline-dots { display: flex; justify-content: space-between; margin-top: -14px; position: relative; z-index: 1; }
    .pipeline-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.15s; width: 60px;
      &:hover { transform: scale(1.1); }
      &.completed .pipeline-dot { background: #2563eb; color: #fff; border-color: #2563eb; }
      &.current .pipeline-dot { background: #7c3aed; color: #fff; border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,0.2); animation: pulseModal 2s infinite; }
      &.pending .pipeline-dot { background: #fff; color: #cbd5e1; border-color: #e2e8f0; }
    }
    @keyframes pulseModal { 0%, 100% { box-shadow: 0 0 0 4px rgba(124,58,237,0.2); } 50% { box-shadow: 0 0 0 8px rgba(124,58,237,0.08); } }
    .pipeline-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.3s; background: white; }
    .pipeline-stage-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; text-align: center; line-height: 1.2; word-wrap: break-word; }

    .pipeline-confirm { margin-top: 30px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; animation: slideDownConfirm 0.2s ease-out; }
    @keyframes slideDownConfirm { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .confirm-text { font-size: 14px; color: #334155; margin-bottom: 12px; text-align: center;
      strong { color: #0f172a; }
      i { color: #94a3b8; margin: 0 8px; }
    }
    .confirm-btns { display: flex; justify-content: center; gap: 10px; }
    .btn-cancel-sm { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-weight: 600; font-size: 13px; color: #64748b; &:hover { background: #f1f5f9; } }
    .btn-confirm-sm { padding: 8px 16px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; font-weight: 600; font-size: 13px; &:hover { background: #1d4ed8; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  `]
})
export class CandidatesTab implements OnInit {
  isLoading = true;
  activeTab = 'active';

  // Data
  jobs: { requisition_id: string; title: string; department_name: string }[] = [];
  stages: { stage_id: string; stage_name: string; order: number }[] = [];
  skills: Record<string, string>[] = [];
  allCandidates: CandidateRow[] = [];
  filteredCandidates: CandidateRow[] = [];

  // Filters
  selectedJobId = 'ALL';
  searchQuery = '';
  stageFilter = '';

  // Counts
  activeCount = 0;
  hiredCount = 0;
  rejectedCount = 0;

  // Drawer
  showDrawer = false;
  selectedCandidate: CandidateRow | null = null;
  candidateSkills: Record<string, string>[] = [];

  // Inline Pipeline Modal
  showPipelineModal = false;
  pipelineCandidate: CandidateRow | null = null;
  pendingStageMove: { stage_id: string; stage_name: string } | null = null;
  isStageMoveInProgress = false;

  // Stage icon mapping
  private stageIcons: Record<string, string> = {
    'applied': 'fa-file-alt',
    'screening': 'fa-search',
    'interview': 'fa-comments',
    'offer': 'fa-handshake',
    'hired': 'fa-check-circle',
  };

  private loggedInUserId = '';

  constructor(private soap: SoapService, private router: Router) {}

  ngOnInit(): void {
    this.loggedInUserId = sessionStorage.getItem('loggedInUserId') || '';
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      const [jobsRaw, deptsRaw, stagesRaw, skillsRaw, candidatesRaw, appsRaw] = await Promise.all([
        this.soap.getJobRequisitions(),
        this.soap.getDepartments(),
        this.soap.getPipelineStages(),
        this.soap.getSkills(),
        this.soap.getCandidates(),
        this.soap.getApplications()
      ]);

      // Department map
      const deptMap = new Map<string, string>();
      deptsRaw.forEach(d => deptMap.set(d['department_id'] || '', d['department_name'] || ''));

      // Jobs (only APPROVED)
      this.jobs = jobsRaw
        .filter(j => (j['status'] || '').toUpperCase() === 'APPROVED')
        .map(j => ({
          requisition_id: j['requisition_id'] || '',
          title: j['title'] || '',
          department_name: deptMap.get(j['department_id'] || '') || ''
        }));

      // Stages
      this.stages = stagesRaw
        .map(s => ({ stage_id: s['stage_id'] || '', stage_name: s['stage_name'] || '', order: parseInt(s['stage_order'] || '0', 10) }))
        .sort((a, b) => a.order - b.order);

      // Skills
      this.skills = skillsRaw;

      // Candidate map
      const candMap = new Map<string, Record<string, string>>();
      candidatesRaw.forEach(c => candMap.set(c['candidate_id'] || '', c));

      // Stage name map
      const stageMap = new Map<string, string>();
      this.stages.forEach(s => stageMap.set(s.stage_id, s.stage_name));

      // Build rows from applications
      this.allCandidates = appsRaw.map(a => {
        const cand = candMap.get(a['candidate_id'] || '');
        const name = cand ? ((cand['first_name'] || '') + ' ' + (cand['last_name'] || '')).trim() : a['candidate_id'] || '';
        return {
          application_id: a['application_id'] || '',
          candidate_id: a['candidate_id'] || '',
          requisition_id: a['requisition_id'] || '',
          candidate_name: name || 'Unknown',
          candidate_email: cand?.['email'] || '',
          candidate_phone: cand?.['phone'] || '',
          experience_years: cand?.['experience_years'] || '',
          location: cand?.['location'] || '',
          source: a['source'] || '',
          status: (a['status'] || '').toUpperCase(),
          current_stage_id: a['current_stage_id'] || '',
          stage_name: stageMap.get(a['current_stage_id'] || '') || 'New',
          applied_at: a['applied_at'] || a['created_at'] || '',
          _raw: a
        };
      });

      this.computeCounts();
      this.applyFilters();
    } catch (err) {
      console.error('Failed to load candidates data:', err);
    } finally {
      this.isLoading = false;
    }
  }

  // ═══════════════════════════════════════════════════
  //  FILTERING
  // ═══════════════════════════════════════════════════

  computeCounts(): void {
    const jobFiltered = this.selectedJobId === 'ALL'
      ? this.allCandidates
      : this.allCandidates.filter(c => c.requisition_id === this.selectedJobId);
    this.activeCount = jobFiltered.filter(c => c.status === 'ACTIVE').length;
    this.hiredCount = jobFiltered.filter(c => c.status === 'HIRED').length;
    this.rejectedCount = jobFiltered.filter(c => c.status === 'REJECTED').length;
  }

  onJobChange(): void {
    this.computeCounts();
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.allCandidates;

    // Tab filter
    if (this.activeTab === 'active') list = list.filter(c => c.status === 'ACTIVE');
    else if (this.activeTab === 'hired') list = list.filter(c => c.status === 'HIRED');
    else if (this.activeTab === 'rejected') list = list.filter(c => c.status === 'REJECTED');

    // Job filter
    if (this.selectedJobId !== 'ALL') {
      list = list.filter(c => c.requisition_id === this.selectedJobId);
    }

    // Stage filter
    if (this.stageFilter) {
      list = list.filter(c => c.current_stage_id === this.stageFilter);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.candidate_name.toLowerCase().includes(q) ||
        c.candidate_email.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q)
      );
    }

    this.filteredCandidates = list;
  }

  // ═══════════════════════════════════════════════════
  //  PROFILE DRAWER
  // ═══════════════════════════════════════════════════

  async openProfile(c: CandidateRow): Promise<void> {
    this.selectedCandidate = c;
    this.showDrawer = true;
    try {
      this.candidateSkills = await this.soap.getCandidateSkills(c.candidate_id);
    } catch { this.candidateSkills = []; }
  }

  closeDrawer(): void {
    this.showDrawer = false;
    this.selectedCandidate = null;
    this.candidateSkills = [];
  }

  // ═══════════════════════════════════════════════════
  //  INLINE PIPELINE MODAL
  // ═══════════════════════════════════════════════════

  openPipelineModal(c: CandidateRow): void {
    this.pipelineCandidate = c;
    this.pendingStageMove = null;
    this.showPipelineModal = true;
  }

  closePipelineModal(): void {
    this.showPipelineModal = false;
    this.pipelineCandidate = null;
    this.pendingStageMove = null;
  }

  getStageIcon(stageName: string): string {
    return this.stageIcons[stageName.toLowerCase()] || 'fa-circle';
  }

  getPipelineProgress(): string {
    if (!this.pipelineCandidate || this.stages.length <= 1) return '0%';
    const idx = this.stages.findIndex(s => s.stage_id === this.pipelineCandidate!.current_stage_id);
    if (idx < 0) return '0%';
    return ((idx / (this.stages.length - 1)) * 100) + '%';
  }

  getPipelineStageStatus(stage: { stage_id: string; stage_name?: string }): 'completed' | 'current' | 'pending' {
    if (!this.pipelineCandidate) return 'pending';
    const currentOrder = this.stages.find(s => s.stage_id === this.pipelineCandidate!.current_stage_id)?.order || 0;
    const stageOrder = this.stages.find(s => s.stage_id === stage.stage_id)?.order || 0;
    if (stage.stage_id === this.pipelineCandidate.current_stage_id) return 'current';
    if (stageOrder < currentOrder) return 'completed';
    return 'pending';
  }

  onPipelineStageClick(stage: { stage_id: string; stage_name: string }): void {
    if (!this.pipelineCandidate || stage.stage_id === this.pipelineCandidate.current_stage_id) return;
    this.pendingStageMove = { stage_id: stage.stage_id, stage_name: stage.stage_name };
  }

  async confirmStageMove(): Promise<void> {
    if (!this.pipelineCandidate || !this.pendingStageMove) return;
    const c = this.pipelineCandidate;
    const fromStageId = c.current_stage_id;
    const toStageId = this.pendingStageMove.stage_id;
    const toStageName = this.pendingStageMove.stage_name;
    this.isStageMoveInProgress = true;

    try {
      await this.soap.updateApplicationStage(c._raw, toStageId);
      await this.soap.insertStageHistory({
        application_id: c.application_id,
        from_stage_id: fromStageId,
        to_stage_id: toStageId,
        changed_by: this.loggedInUserId,
        comments: ''
      });

      // Update local state
      c.current_stage_id = toStageId;
      c.stage_name = toStageName;
      c._raw['current_stage_id'] = toStageId;
      this.pendingStageMove = null;
      this.applyFilters(); // refresh table
    } catch (err) {
      console.error('Stage move failed:', err);
      alert('Failed to move candidate. Please try again.');
    } finally {
      this.isStageMoveInProgress = false;
    }
  }

  // ═══════════════════════════════════════════════════
  //  NAVIGATION (kept for pipeline board page link)
  // ═══════════════════════════════════════════════════

  goToPipeline(requisitionId: string): void {
    this.closeDrawer();
    this.router.navigate(['/hr/pipeline'], { queryParams: { job: requisitionId } });
  }

  // ═══════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════

  getJobTitle(reqId: string): string {
    return this.jobs.find(j => j.requisition_id === reqId)?.title || reqId;
  }

  getSkillName(skillId: string): string {
    return this.skills.find(s => s['skill_id'] === skillId)?.['skill_name'] || skillId;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
