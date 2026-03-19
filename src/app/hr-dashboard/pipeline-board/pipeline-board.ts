import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SoapService } from '../../services/soap.service';

interface PipelineStage {
  stage_id: string;
  stage_name: string;
  stage_order: number;
  icon: string; // FA icon class
}

interface CandidatePipeline {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  experience_years: string;
  location: string;
  current_stage_id: string;
  current_stage_order: number;
  status: string;
  applied_at: string;
  source: string;
  _raw: Record<string, string>;
}

@Component({
  selector: 'app-pipeline-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipeline-board.html',
  styleUrls: ['./pipeline-board.scss']
})
export class PipelineBoardComponent implements OnInit {
  isLoading = true;
  selectedRequisitionId = '';
  jobs: { requisition_id: string; title: string; department_name: string }[] = [];
  stages: PipelineStage[] = [];
  candidates: CandidatePipeline[] = [];
  candidateMap = new Map<string, Record<string, string>>();

  // Expand state
  expandedCardId = '';

  // Stage move confirmation
  showMoveConfirm = false;
  moveTarget: { candidate: CandidatePipeline; stage: PipelineStage } | null = null;
  isMoving = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  loggedInUserId = '';
  private pendingJobId = '';

  // Stage icon mapping
  private stageIcons: Record<string, string> = {
    'applied': 'fa-file-alt',
    'screening': 'fa-search',
    'interview': 'fa-comments',
    'offer': 'fa-handshake',
    'hired': 'fa-check-circle',
  };

  constructor(private soap: SoapService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loggedInUserId = sessionStorage.getItem('loggedInUserId') || '';
    this.route.queryParams.subscribe(params => {
      if (params['job']) {
        this.pendingJobId = params['job'];
      }
    });
    this.loadInitialData();
  }

  // ═══════════════════════════════════════════════════
  //  DATA LOADING
  // ═══════════════════════════════════════════════════

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      const [jobsRaw, deptsRaw, stagesRaw, candidatesRaw] = await Promise.all([
        this.soap.getJobRequisitions(),
        this.soap.getDepartments(),
        this.soap.getPipelineStages(),
        this.soap.getCandidates()
      ]);

      const deptMap = new Map<string, string>();
      deptsRaw.forEach(d => deptMap.set(d['department_id'] || '', d['department_name'] || ''));

      this.jobs = jobsRaw
        .filter(j => (j['status'] || '').toUpperCase() === 'APPROVED')
        .map(j => ({
          requisition_id: j['requisition_id'] || '',
          title: j['title'] || '',
          department_name: deptMap.get(j['department_id'] || '') || ''
        }));

      this.stages = stagesRaw.map(s => {
        const name = s['stage_name'] || '';
        return {
          stage_id: s['stage_id'] || '',
          stage_name: name,
          stage_order: parseInt(s['stage_order'] || '0', 10),
          icon: this.stageIcons[name.toLowerCase()] || 'fa-circle'
        };
      }).sort((a, b) => a.stage_order - b.stage_order);

      candidatesRaw.forEach(c => this.candidateMap.set(c['candidate_id'] || '', c));

      // Auto-select job
      if (this.pendingJobId && this.jobs.some(j => j.requisition_id === this.pendingJobId)) {
        this.selectedRequisitionId = this.pendingJobId;
      } else if (this.jobs.length > 0) {
        this.selectedRequisitionId = this.jobs[0].requisition_id;
      }
      if (this.selectedRequisitionId) {
        await this.loadApplicationsForJob();
      }
    } catch (err) {
      console.error('Failed to load pipeline data:', err);
      this.showToast('Failed to load data.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loadApplicationsForJob(): Promise<void> {
    if (!this.selectedRequisitionId) {
      this.candidates = [];
      return;
    }
    try {
      const apps = await this.soap.getApplicationsByRequisition(this.selectedRequisitionId);
      this.candidates = apps
        .filter(a => (a['status'] || '').toUpperCase() === 'ACTIVE')
        .map(a => {
          const cand = this.candidateMap.get(a['candidate_id'] || '');
          const name = cand ? ((cand['first_name'] || '') + ' ' + (cand['last_name'] || '')).trim() : 'Unknown';
          const currentStage = this.stages.find(s => s.stage_id === (a['current_stage_id'] || ''));
          return {
            application_id: a['application_id'] || '',
            candidate_id: a['candidate_id'] || '',
            candidate_name: name,
            candidate_email: cand?.['email'] || '',
            candidate_phone: cand?.['phone'] || '',
            experience_years: cand?.['experience_years'] || '',
            location: cand?.['location'] || '',
            current_stage_id: a['current_stage_id'] || '',
            current_stage_order: currentStage?.stage_order || 0,
            status: a['status'] || '',
            applied_at: a['applied_at'] || a['created_at'] || '',
            source: a['source'] || '',
            _raw: a
          };
        })
        .sort((a, b) => b.current_stage_order - a.current_stage_order); // furthest stage first
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }

  async onJobChange(): Promise<void> {
    this.expandedCardId = '';
    await this.loadApplicationsForJob();
  }

  // ═══════════════════════════════════════════════════
  //  STAGE HELPERS
  // ═══════════════════════════════════════════════════

  getStageStatus(candidate: CandidatePipeline, stage: PipelineStage): 'completed' | 'current' | 'pending' {
    if (stage.stage_id === candidate.current_stage_id) return 'current';
    if (stage.stage_order < candidate.current_stage_order) return 'completed';
    return 'pending';
  }

  getStageName(stageId: string): string {
    return this.stages.find(s => s.stage_id === stageId)?.stage_name || 'Unknown';
  }

  getStageIcon(stageId: string): string {
    return this.stages.find(s => s.stage_id === stageId)?.icon || 'fa-circle';
  }

  getProgressWidth(candidate: CandidatePipeline): string {
    if (this.stages.length <= 1) return '0%';
    const idx = this.stages.findIndex(s => s.stage_id === candidate.current_stage_id);
    if (idx < 0) return '0%';
    return ((idx / (this.stages.length - 1)) * 100) + '%';
  }

  // ═══════════════════════════════════════════════════
  //  STAGE MOVE
  // ═══════════════════════════════════════════════════

  onStageClick(candidate: CandidatePipeline, stage: PipelineStage): void {
    if (stage.stage_id === candidate.current_stage_id) return;
    this.moveTarget = { candidate, stage };
    this.showMoveConfirm = true;
  }

  cancelMove(): void {
    this.showMoveConfirm = false;
    this.moveTarget = null;
  }

  async confirmMove(): Promise<void> {
    if (!this.moveTarget) return;
    const { candidate, stage } = this.moveTarget;
    const fromStageId = candidate.current_stage_id;
    this.isMoving = true;

    try {
      await this.soap.updateApplicationStage(candidate._raw, stage.stage_id);
      await this.soap.insertStageHistory({
        application_id: candidate.application_id,
        from_stage_id: fromStageId,
        to_stage_id: stage.stage_id,
        changed_by: this.loggedInUserId,
        comments: ''
      });

      // Update local state
      candidate.current_stage_id = stage.stage_id;
      candidate.current_stage_order = stage.stage_order;
      candidate._raw['current_stage_id'] = stage.stage_id;

      this.showToast(`${candidate.candidate_name} moved to "${stage.stage_name}"`, 'success');
    } catch (err) {
      console.error('Stage move failed:', err);
      this.showToast('Failed to move candidate. Please try again.', 'error');
    } finally {
      this.isMoving = false;
      this.showMoveConfirm = false;
      this.moveTarget = null;
    }
  }

  // ═══════════════════════════════════════════════════
  //  UI HELPERS
  // ═══════════════════════════════════════════════════

  toggleExpand(id: string): void {
    this.expandedCardId = this.expandedCardId === id ? '' : id;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastFlag = false, 4000);
  }
}
