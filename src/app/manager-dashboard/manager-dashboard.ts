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
  job_title?: string;
  department_name?: string;
  requester_name?: string;
  // Raw data for update calls
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

  // ─── Stats ──────────────────────────────────────
  overviewStats = [
    { label: 'Pending Approvals', value: '0', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-warning' },
    { label: 'Approved This Month', value: '0', icon: 'M5 13l4 4L19 7', colorClass: 'text-success' },
    { label: 'Rejected', value: '0', icon: 'M6 18L18 6M6 6l12 12', colorClass: 'text-danger' },
  ];

  // ─── Action Modal ──────────────────────────────
  showActionModal = false;
  actionType: 'APPROVED' | 'REJECTED' = 'APPROVED';
  actionApproval: PendingApproval | null = null;
  actionComments = '';
  isActioning = false;

  // ─── Toast ──────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  constructor(private soap: SoapService) {}

  ngOnInit(): void {
    this.loggedInUserId = sessionStorage.getItem('loggedInUserId') || '';
    this.loadApprovals();
  }

  // ═══════════════════════════════════════════════════
  //  LOAD APPROVALS
  // ═══════════════════════════════════════════════════

  async loadApprovals(): Promise<void> {
    this.isLoading = true;
    try {
      const rows = await this.soap.getApprovals();

      // Map all approval records
      this.allApprovals = rows.map(r => ({
        approval_id: r['approval_id'] || '',
        entity_type: r['entity_type'] || '',
        entity_id: r['entity_id'] || '',
        status: r['status'] || '',
        requested_by: r['requested_by'] || '',
        requested_at: r['requested_at'] || '',
        comments: r['comments'] || '',
        _raw: r
      }));

      // Filter pending ones
      this.pendingApprovals = this.allApprovals.filter(a => a.status === 'PENDING');

      // Enrich with job details
      await this.enrichApprovals();

      // Update stats
      this.updateStats();
    } catch (err) {
      console.error('Failed to load approvals:', err);
      this.showToast('Failed to load approvals.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private async enrichApprovals(): Promise<void> {
    // Load all departments for mapping
    let deptMap = new Map<string, string>();
    try {
      const depts = await this.soap.getDepartments();
      depts.forEach(d => deptMap.set(d['department_id'] || '', d['department_name'] || ''));
    } catch (e) { /* ignore */ }

    // Load all users for requester name mapping
    let userMap = new Map<string, string>();
    try {
      const users = await this.soap.getUsers();
      users.forEach(u => {
        const name = ((u['first_name'] || '') + ' ' + (u['last_name'] || '')).trim();
        userMap.set(u['user_id'] || '', name || u['email'] || u['user_id'] || '');
      });
    } catch (e) { /* ignore */ }

    // For each pending approval of type REQUISITION, load the job details
    for (const approval of this.allApprovals) {
      // Set requester name
      approval.requester_name = userMap.get(approval.requested_by) || approval.requested_by;

      if (approval.entity_type === 'REQUISITION' && approval.entity_id) {
        try {
          const job = await this.soap.getJobRequisitionById(approval.entity_id);
          if (job) {
            approval.job_title = job['title'] || approval.entity_id;
            approval.department_name = deptMap.get(job['department_id'] || '') || job['department_id'] || '';
          }
        } catch (e) {
          approval.job_title = approval.entity_id;
        }
      }
    }
  }

  private updateStats(): void {
    const pending = this.allApprovals.filter(a => a.status === 'PENDING').length;
    const approved = this.allApprovals.filter(a => a.status === 'APPROVED').length;
    const rejected = this.allApprovals.filter(a => a.status === 'REJECTED').length;

    this.overviewStats[0].value = pending.toString();
    this.overviewStats[1].value = approved.toString();
    this.overviewStats[2].value = rejected.toString();
  }

  // ═══════════════════════════════════════════════════
  //  APPROVE / REJECT ACTIONS
  // ═══════════════════════════════════════════════════

  openApproveModal(approval: PendingApproval): void {
    this.actionType = 'APPROVED';
    this.actionApproval = approval;
    this.actionComments = '';
    this.showActionModal = true;
  }

  openRejectModal(approval: PendingApproval): void {
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

    // Reject action requires comments
    if (this.actionType === 'REJECTED' && !this.actionComments.trim()) {
      this.showToast('Please provide a reason for rejection.', 'error');
      return;
    }

    this.isActioning = true;

    try {
      // Step 1: Update ts_approvals status
      await this.soap.updateApprovalStatus(
        this.actionApproval._raw,
        this.actionType,
        this.loggedInUserId,
        this.actionComments.trim()
      );

      // Step 2: Update ts_job_requisitions status (if it's a REQUISITION approval)
      if (this.actionApproval.entity_type === 'REQUISITION') {
        const jobData = await this.soap.getJobRequisitionById(this.actionApproval.entity_id);
        if (jobData) {
          const newJobStatus = this.actionType === 'APPROVED' ? 'APPROVED' : 'CLOSED';
          await this.soap.updateJobRequisitionStatus(jobData, newJobStatus);
        }
      }

      const label = this.actionType === 'APPROVED' ? 'approved' : 'rejected';
      this.showToast(`Requisition ${this.actionApproval.entity_id} has been ${label}.`, 'success');

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
