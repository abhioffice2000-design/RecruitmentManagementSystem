import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoapService } from '../../services/soap.service';

interface PipelineStage {
  stage_id: string;
  stage_name: string;
  stage_order: number;
}

interface KanbanCard {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  current_stage_id: string;
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
  cards: KanbanCard[] = [];
  candidateMap = new Map<string, { name: string; email: string }>();

  // Drag state
  draggedCard: KanbanCard | null = null;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  loggedInUserId = '';

  constructor(private soap: SoapService) {}

  ngOnInit(): void {
    this.loggedInUserId = sessionStorage.getItem('loggedInUserId') || '';
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load jobs + departments + stages + candidates in parallel
      const [jobsRaw, deptsRaw, stagesRaw, candidatesRaw] = await Promise.all([
        this.soap.getJobRequisitions(),
        this.soap.getDepartments(),
        this.soap.getPipelineStages(),
        this.soap.getCandidates()
      ]);

      const deptMap = new Map<string, string>();
      deptsRaw.forEach(d => deptMap.set(d['department_id'] || '', d['department_name'] || ''));

      // Only show APPROVED jobs
      this.jobs = jobsRaw
        .filter(j => (j['status'] || '').toUpperCase() === 'APPROVED')
        .map(j => ({
          requisition_id: j['requisition_id'] || '',
          title: j['title'] || '',
          department_name: deptMap.get(j['department_id'] || '') || ''
        }));

      // Pipeline stages sorted by order
      this.stages = stagesRaw.map(s => ({
        stage_id: s['stage_id'] || '',
        stage_name: s['stage_name'] || '',
        stage_order: parseInt(s['stage_order'] || '0', 10)
      })).sort((a, b) => a.stage_order - b.stage_order);

      // Candidates map
      candidatesRaw.forEach(c => {
        const name = ((c['first_name'] || '') + ' ' + (c['last_name'] || '')).trim();
        this.candidateMap.set(c['candidate_id'] || '', {
          name: name || 'Unknown',
          email: c['email'] || ''
        });
      });

      // Auto-select first job
      if (this.jobs.length > 0) {
        this.selectedRequisitionId = this.jobs[0].requisition_id;
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
      this.cards = [];
      return;
    }
    try {
      const apps = await this.soap.getApplicationsByRequisition(this.selectedRequisitionId);
      this.cards = apps
        .filter(a => (a['status'] || '') === 'ACTIVE')
        .map(a => {
          const cand = this.candidateMap.get(a['candidate_id'] || '');
          return {
            application_id: a['application_id'] || '',
            candidate_id: a['candidate_id'] || '',
            candidate_name: cand?.name || a['candidate_id'] || '',
            candidate_email: cand?.email || '',
            current_stage_id: a['current_stage_id'] || '',
            status: a['status'] || '',
            applied_at: a['applied_at'] || a['created_at'] || '',
            source: a['source'] || '',
            _raw: a
          };
        });
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }

  async onJobChange(): Promise<void> {
    await this.loadApplicationsForJob();
  }

  // ═══════════════════════════════════════════════════
  //  KANBAN COLUMN HELPERS
  // ═══════════════════════════════════════════════════

  getCardsForStage(stageId: string): KanbanCard[] {
    return this.cards.filter(c => c.current_stage_id === stageId);
  }

  getUnstagedCards(): KanbanCard[] {
    const stageIds = new Set(this.stages.map(s => s.stage_id));
    return this.cards.filter(c => !stageIds.has(c.current_stage_id));
  }

  // ═══════════════════════════════════════════════════
  //  DRAG & DROP
  // ═══════════════════════════════════════════════════

  onDragStart(event: DragEvent, card: KanbanCard): void {
    this.draggedCard = card;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', card.application_id);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent): void {
    const el = (event.currentTarget as HTMLElement);
    el.classList.add('drag-hover');
  }

  onDragLeave(event: DragEvent): void {
    const el = (event.currentTarget as HTMLElement);
    el.classList.remove('drag-hover');
  }

  async onDrop(event: DragEvent, targetStageId: string): Promise<void> {
    event.preventDefault();
    const el = (event.currentTarget as HTMLElement);
    el.classList.remove('drag-hover');

    if (!this.draggedCard || this.draggedCard.current_stage_id === targetStageId) {
      this.draggedCard = null;
      return;
    }

    const card = this.draggedCard;
    const fromStageId = card.current_stage_id;
    this.draggedCard = null;

    try {
      // 1. Update ts_applications.current_stage_id
      await this.soap.updateApplicationStage(card._raw, targetStageId);

      // 2. Insert into hs_application_stage_history
      await this.soap.insertStageHistory({
        application_id: card.application_id,
        from_stage_id: fromStageId,
        to_stage_id: targetStageId,
        changed_by: this.loggedInUserId,
        comments: ''
      });

      // 3. Update local state
      card.current_stage_id = targetStageId;
      card._raw['current_stage_id'] = targetStageId;

      const stageName = this.stages.find(s => s.stage_id === targetStageId)?.stage_name || targetStageId;
      this.showToast(`${card.candidate_name} moved to "${stageName}"`, 'success');

    } catch (err) {
      console.error('Stage move failed:', err);
      this.showToast('Failed to move candidate. Please try again.', 'error');
      // Reload to ensure consistency
      await this.loadApplicationsForJob();
    }
  }

  // ═══════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastFlag = false, 4000);
  }
}
