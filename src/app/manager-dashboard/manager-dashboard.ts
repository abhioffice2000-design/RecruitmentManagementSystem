import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoapService } from '../services/soap.service';

interface PendingApproval {
  approval_id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  requested_by: string;
  requested_at: string;
  comments: string;
  // Enriched from ts_job_requisitions
  job_title: string;
  department_name: string;
  requester_name: string;
  experience_range: string;
  salary_range: string;
  open_positions: string;
  description: string;
  posting_source: string;
  // delegation
  delegated_to: string[];
  is_delegated: boolean;
  // Raw data
  _raw: Record<string, string>;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.scss'],
})
export class ManagerDashboard implements OnInit {

  isLoading = false;
  pendingApprovals: PendingApproval[] = [];
  allApprovals: PendingApproval[] = [];
  loggedInUserId = '';
  loggedInUserRole = '';

  // ─── Stats ──────────────────────────────────────
  stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    delegated: 0,
    total: 0
  };

  // Chart data
  chartSegments: { color: string; percent: number; label: string; count: number }[] = [];

  // ─── Expanded card ──────────────────────────────
  expandedApprovalId: string | null = null;

  // ─── Action Modal ──────────────────────────────
  showActionModal = false;
  actionType: 'APPROVED' | 'REJECTED' = 'APPROVED';
  actionApproval: PendingApproval | null = null;
  actionComments = '';
  isActioning = false;

  // ─── Delegate Modal ───────────────────────────
  showDelegateModal = false;
  delegateApproval: PendingApproval | null = null;
  delegateUsers: { user_id: string; name: string; selected: boolean }[] = [];
  allUsers: { user_id: string; name: string }[] = [];
  isDelegating = false;

  // ─── Filter ───────────────────────────────────
  filterStatus = 'PENDING';

  // ─── Toast ──────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  constructor(private soap: SoapService) {}

  ngOnInit(): void {
    this.loggedInUserId = sessionStorage.getItem('loggedInUserId') || '';
    this.loggedInUserRole = sessionStorage.getItem('loggedInUserRole') || '';
    this.loadApprovals();
  }

  // ═══════════════════════════════════════════════════
  //  LOAD APPROVALS
  // ═══════════════════════════════════════════════════

  async loadApprovals(): Promise<void> {
    this.isLoading = true;
    try {
      const [rows, depts, users, jobs] = await Promise.all([
        this.soap.getApprovals(),
        this.soap.getDepartments(),
        this.soap.getUsers(),
        this.soap.getJobRequisitions()
      ]);

      const deptMap = new Map<string, string>();
      depts.forEach(d => deptMap.set(d['department_id'] || '', d['department_name'] || ''));

      const userMap = new Map<string, string>();
      users.forEach(u => {
        const name = ((u['first_name'] || u['First_name'] || '') + ' ' + (u['last_name'] || u['Last_name'] || '')).trim();
        userMap.set(u['user_id'] || u['User_id'] || '', name || u['email'] || u['Email'] || '');
      });

      this.allUsers = users.map(u => ({
        user_id: u['user_id'] || u['User_id'] || '',
        name: ((u['first_name'] || u['First_name'] || '') + ' ' + (u['last_name'] || u['Last_name'] || '')).trim()
      })).filter(u => u.user_id !== this.loggedInUserId);

      const jobMap = new Map<string, Record<string, string>>();
      jobs.forEach(j => jobMap.set(j['requisition_id'] || '', j));

      this.allApprovals = rows.map(r => {
        const job = jobMap.get(r['entity_id'] || '') || {};
        const salMin = job['salary_min'] || '';
        const salMax = job['salary_max'] || '';
        const salCur = job['salary_currency'] || 'LPA';
        const expMin = job['experience_min'] || '';
        const expMax = job['experience_max'] || '';

        return {
          approval_id: r['approval_id'] || '',
          entity_type: r['entity_type'] || '',
          entity_id: r['entity_id'] || '',
          status: r['status'] || '',
          requested_by: r['requested_by'] || '',
          requested_at: r['requested_at'] || r['created_at'] || '',
          comments: r['comments'] || '',
          job_title: job['title'] || r['entity_id'] || '',
          department_name: deptMap.get(job['department_id'] || '') || '',
          requester_name: userMap.get(r['requested_by'] || '') || r['requested_by'] || '',
          experience_range: (expMin || expMax) ? `${expMin || '0'} – ${expMax || 'Any'} yrs` : '',
          salary_range: (salMin || salMax) ? `${salMin} – ${salMax} ${salCur}` : '',
          open_positions: job['open_positions'] || '',
          description: job['description'] || '',
          posting_source: job['posting_source'] || '',
          delegated_to: [],
          is_delegated: false,
          _raw: r
        };
      });

      this.pendingApprovals = this.allApprovals.filter(a => a.status === 'PENDING');
      this.updateStats();
    } catch (err) {
      console.error('Failed to load approvals:', err);
      this.showToast('Failed to load approvals.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private updateStats(): void {
    this.stats.pending = this.allApprovals.filter(a => a.status === 'PENDING').length;
    this.stats.approved = this.allApprovals.filter(a => a.status === 'APPROVED').length;
    this.stats.rejected = this.allApprovals.filter(a => a.status === 'REJECTED').length;
    this.stats.delegated = this.allApprovals.filter(a => a.delegated_to.length > 0).length;
    this.stats.total = this.allApprovals.length;
    this.buildChart();
  }

  private buildChart(): void {
    const total = this.stats.total || 1;
    this.chartSegments = [
      { color: '#f59e0b', percent: (this.stats.pending / total) * 100, label: 'Pending', count: this.stats.pending },
      { color: '#10b981', percent: (this.stats.approved / total) * 100, label: 'Approved', count: this.stats.approved },
      { color: '#ef4444', percent: (this.stats.rejected / total) * 100, label: 'Rejected', count: this.stats.rejected },
    ];
  }

  getChartDasharray(seg: { percent: number }): string {
    const circumference = 2 * Math.PI * 45;
    const filled = (seg.percent / 100) * circumference;
    return `${filled} ${circumference - filled}`;
  }

  getChartOffset(index: number): number {
    const circumference = 2 * Math.PI * 45;
    let offset = circumference * 0.25; // start from top
    for (let i = 0; i < index; i++) {
      offset -= (this.chartSegments[i].percent / 100) * circumference;
    }
    return offset;
  }

  get filteredApprovals(): PendingApproval[] {
    if (this.filterStatus === 'ALL') return this.allApprovals;
    return this.allApprovals.filter(a => a.status === this.filterStatus);
  }

  // ═══════════════════════════════════════════════════
  //  EXPAND / COLLAPSE CARD
  // ═══════════════════════════════════════════════════

  toggleExpand(approval: PendingApproval): void {
    this.expandedApprovalId = this.expandedApprovalId === approval.approval_id ? null : approval.approval_id;
  }

  isExpanded(approval: PendingApproval): boolean {
    return this.expandedApprovalId === approval.approval_id;
  }

  // ═══════════════════════════════════════════════════
  //  APPROVE / REJECT ACTIONS
  // ═══════════════════════════════════════════════════

  openApproveModal(approval: PendingApproval, event: Event): void {
    event.stopPropagation();
    this.actionType = 'APPROVED';
    this.actionApproval = approval;
    this.actionComments = '';
    this.showActionModal = true;
  }

  openRejectModal(approval: PendingApproval, event: Event): void {
    event.stopPropagation();
    this.actionType = 'REJECTED';
    this.actionApproval = approval;
    this.actionComments = '';
    this.showActionModal = true;
  }

  closeActionModal(): void {
    this.showActionModal = false;
    this.actionApproval = null;
  }

  async confirmAction(): Promise<void> {
    if (!this.actionApproval) return;

    if (this.actionType === 'REJECTED' && !this.actionComments.trim()) {
      this.showToast('Please provide a reason for rejection.', 'error');
      return;
    }

    this.isActioning = true;

    try {
      await this.soap.updateApprovalStatus(
        this.actionApproval._raw,
        this.actionType,
        this.loggedInUserId,
        this.actionComments.trim()
      );

      if (this.actionApproval.entity_type === 'REQUISITION' || this.actionApproval.entity_type === 'Job Requisition') {
        const jobData = await this.soap.getJobRequisitionById(this.actionApproval.entity_id);
        if (jobData) {
          const newJobStatus = this.actionType === 'APPROVED' ? 'APPROVED' : 'CLOSED';
          await this.soap.updateJobRequisitionStatus(jobData, newJobStatus);
        }
      }

      const label = this.actionType === 'APPROVED' ? 'approved' : 'rejected';
      this.showToast(`"${this.actionApproval.job_title}" has been ${label}.`, 'success');

      this.closeActionModal();
      await this.loadApprovals();

    } catch (err) {
      console.error('Action failed:', err);
      this.showToast('Failed to process action. Please try again.', 'error');
    } finally {
      this.isActioning = false;
    }
  }

  // ═══════════════════════════════════════════════════
  //  DELEGATION
  // ═══════════════════════════════════════════════════

  openDelegateModal(approval: PendingApproval, event: Event): void {
    event.stopPropagation();
    if (approval.is_delegated) {
      this.showToast('This task was delegated to you. You cannot delegate it further.', 'error');
      return;
    }
    this.delegateApproval = approval;
    this.delegateUsers = this.allUsers.map(u => ({
      ...u,
      selected: approval.delegated_to.includes(u.user_id)
    }));
    this.showDelegateModal = true;
  }

  closeDelegateModal(): void {
    this.showDelegateModal = false;
    this.delegateApproval = null;
  }

  toggleDelegateUser(user: { user_id: string; name: string; selected: boolean }): void {
    user.selected = !user.selected;
  }

  get selectedDelegateCount(): number {
    return this.delegateUsers.filter(u => u.selected).length;
  }

  async confirmDelegate(): Promise<void> {
    if (!this.delegateApproval) return;
    const selected = this.delegateUsers.filter(u => u.selected).map(u => u.user_id);
    if (selected.length === 0) {
      this.showToast('Please select at least one user to delegate to.', 'error');
      return;
    }

    this.isDelegating = true;
    try {
      // In a real system, this would create delegation records via SOAP
      // For mock mode, we just update the local data
      this.delegateApproval.delegated_to = selected;
      const names = this.delegateUsers.filter(u => u.selected).map(u => u.name).join(', ');
      this.showToast(`Task delegated to: ${names}`, 'success');
      this.closeDelegateModal();
    } catch (err) {
      this.showToast('Failed to delegate task.', 'error');
    } finally {
      this.isDelegating = false;
    }
  }

  getDelegateNames(approval: PendingApproval): string {
    return approval.delegated_to
      .map(id => this.allUsers.find(u => u.user_id === id)?.name || id)
      .join(', ');
  }

  // ═══════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastFlag = false, 4000);
  }
}
