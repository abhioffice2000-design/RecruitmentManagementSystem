import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var $: any;

// ===== DB INTERFACES =====
interface Candidate {
  candidate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_years: string;
  location: string;
}

interface Application {
  application_id: string;
  candidate_id: string;
  requisition_id: string;
  source: string;
  status: string;
  current_stage_id: string;
  candidate_name?: string;
  candidate_email?: string;
}

interface Department {
  department_id: string;
  department_name: string;
}

interface UserInterviewer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department_id: string;
}

interface InterviewSlot {
  slot_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  created_by_user: string;
  temp1: string;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-content">
      <div class="header">
        <h2>Candidates Overview</h2>
        <div class="user-info">
          <span class="icon">🔔</span>
          <div class="profile">
            <div class="text">
              <span class="name">Asley Green</span>
              <span class="role">Lead HR</span>
            </div>
            <img src="https://via.placeholder.com/40" alt="profile">
          </div>
        </div>
      </div>
      
      <div class="candidates-container">
        <div class="tabs-header">
          <button [class.active]="activeTab === 'in-progress'" (click)="activeTab = 'in-progress'">In-Progress</button>
          <button [class.active]="activeTab === 'onboarded'" (click)="activeTab = 'onboarded'">Onboarded</button>
        </div>

        <!-- In Progress Tab -->
        <div class="tab-content" *ngIf="activeTab === 'in-progress'">
          <div class="controls-bar">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search candidates..." class="search-input">
            </div>
            <select class="filter-select">
              <option>All Stages</option><option>Interview</option><option>Screening</option>
            </select>
          </div>

          <table class="candidates-table">
            <thead>
              <tr>
                <th>Candidate Name</th><th>Email</th><th>Requisition</th><th>Stage</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of activeApplications">
                <td>
                  <div class="candidate-info">
                    <div class="avatar-placeholder">{{ (app.candidate_name || 'C').charAt(0) }}</div>
                    <div class="details"><span class="name">{{ app.candidate_name || app.candidate_id }}</span></div>
                  </div>
                </td>
                <td>{{ app.candidate_email || '-' }}</td>
                <td><span class="job-role">{{ app.requisition_id }}</span></td>
                <td><span class="stage-text">{{ getStageName(app.current_stage_id) }}</span></td>
                <td><span class="status-badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span></td>
                <td>
                  <button class="btn-view" style="margin-right:8px">View Details</button>
                  <button class="btn-schedule" *ngIf="isInterviewStage(app)" (click)="openScheduleModal(app)">Schedule Interview</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="activeApplications.length === 0" style="margin-top:2rem; text-align:center; color:#94a3b8;">No active applications found.</p>
        </div>

        <div class="tab-content" *ngIf="activeTab === 'onboarded'">
          <p style="text-align:center; color:#94a3b8;">No onboarded candidates yet.</p>
        </div>
      </div>
    </div>

    <!-- ===== SCHEDULE INTERVIEW MODAL ===== -->
    <div class="modal-overlay" *ngIf="showScheduleModal" (click)="closeScheduleModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📅 Schedule Interview</h3>
          <button class="modal-close" (click)="closeScheduleModal()">✕</button>
        </div>
        <div class="modal-body">
          <p class="schedule-for">Scheduling for: <strong>{{ selectedApp?.candidate_name }}</strong> ({{ selectedApp?.application_id }})</p>

          <!-- Step 1: Select Department -->
          <div class="form-group">
            <label>1. Select Department</label>
            <select [(ngModel)]="selectedDepartmentIdx" (ngModelChange)="onDepartmentChange()" class="form-input">
              <option [ngValue]="-1">-- Select Department --</option>
              <option *ngFor="let d of departments; let i = index" [ngValue]="i">{{ d.department_name }}</option>
            </select>
          </div>

          <!-- Step 2: Select Interviewer -->
          <div class="form-group" *ngIf="formStep >= 2">
            <label>2. Select Primary Interviewer</label>
            <select [(ngModel)]="selectedInterviewerIdx" (ngModelChange)="onInterviewerChange()" class="form-input">
              <option [ngValue]="-1">-- Select Interviewer --</option>
              <option *ngFor="let u of interviewers; let i = index" [ngValue]="i">{{ u.first_name }} {{ u.last_name }} ({{ u.email }})</option>
            </select>
            <small *ngIf="interviewers.length === 0" class="hint-red">No interviewers found in this department.</small>
          </div>

          <!-- Step 3: Select Slot -->
          <div class="form-group" *ngIf="formStep >= 3">
            <label>3. Select Available Slot</label>
            <select [(ngModel)]="selectedSlotIdx" (ngModelChange)="onSlotChange()" class="form-input">
              <option [ngValue]="-1">-- Select Slot --</option>
              <option *ngFor="let s of availableSlots; let i = index" [ngValue]="i">
                {{ s.slot_date }} | {{ s.start_time }} - {{ s.end_time }}
              </option>
            </select>
            <small *ngIf="availableSlots.length === 0" class="hint-red">No available slots for this interviewer.</small>
          </div>

          <!-- Step 4: Add More Interviewers (optional) -->
          <div class="form-group" *ngIf="formStep >= 4">
            <label>4. Additional Interviewers (Optional)</label>
            <div class="added-interviewers">
              <span class="added-chip" *ngFor="let ai of additionalInterviewers; let idx = index">
                {{ ai.first_name }} {{ ai.last_name }}
                <button class="chip-remove" (click)="removeAdditionalInterviewer(idx)">✕</button>
              </span>
            </div>
            <div class="add-interviewer-row">
              <select [(ngModel)]="additionalInterviewerToAdd" class="form-input" style="flex:1">
                <option value="">-- Add Interviewer --</option>
                <option *ngFor="let u of remainingInterviewers" [value]="u.user_id">{{ u.first_name }} {{ u.last_name }}</option>
              </select>
              <button class="btn-add" (click)="addInterviewer()" [disabled]="!additionalInterviewerToAdd">+ Add</button>
            </div>
          </div>

          <!-- Step 5: Interview Details -->
          <div *ngIf="formStep >= 4">
            <div class="form-group">
              <label>5. Interview Type</label>
              <select [(ngModel)]="interviewType" class="form-input">
                <option value="">-- Select Type --</option>
                <option value="Technical Round">Technical Round</option>
                <option value="HR Screening">HR Screening</option>
                <option value="System Design">System Design</option>
                <option value="Managerial Round">Managerial Round</option>
                <option value="Culture Fit">Culture Fit</option>
                <option value="Portfolio Review">Portfolio Review</option>
              </select>
            </div>
            <div class="form-group">
              <label>6. Round Number</label>
              <input type="number" [(ngModel)]="roundNumber" class="form-input" min="1" max="10" placeholder="1" />
            </div>
            <div class="form-group">
              <label>7. Meeting Link</label>
              <div class="meeting-link-row">
                <input type="text" [(ngModel)]="meetingLink" class="form-input" style="flex:1" placeholder="https://meet.google.com/..." />
                <button class="btn-generate" (click)="generateMeetingLink()">🔗 Generate</button>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeScheduleModal()">Cancel</button>
          <button class="btn-submit" (click)="scheduleInterview()" [disabled]="isScheduling || !canSchedule()">
            {{ isScheduling ? 'Scheduling...' : '✅ Schedule Interview' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../hr-dashboard/hr-dashboard.scss'],
  styles: [`
    .candidates-container {
      background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden;
      .tabs-header {
        display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; padding: 0 24px;
        button { background: none; border: none; padding: 20px 24px; font-size: 15px; font-weight: 600; color: #64748b; cursor: pointer; position: relative; transition: all 0.2s;
          &:hover { color: #1e293b; }
          &.active { color: #2563eb;
            &::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #2563eb; border-radius: 3px 3px 0 0; }
          }
        }
      }
      .tab-content {
        padding: 24px;
        .controls-bar { display: flex; justify-content: space-between; margin-bottom: 24px;
          .search-wrap { position: relative;
            .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #64748b; }
            .search-input { padding: 10px 16px 10px 36px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; width: 280px; outline: none; &:focus { border-color: #2563eb; } }
          }
          .filter-select { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; cursor: pointer; }
        }
        .candidates-table { width: 100%; border-collapse: collapse;
          th { text-align: left; padding: 16px; color: #64748b; font-weight: 600; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
          td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;
            .candidate-info { display: flex; align-items: center; gap: 12px;
              .avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #475569; }
              .details .name { font-weight: 600; font-size: 14px; }
            }
            .job-role { font-weight: 500; font-size: 14px; }
            .stage-text { font-size: 13px; font-weight: 600; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #475569; &.active { background: #dcfce7; color: #166534; } }
            .btn-view { padding: 8px 16px; border: 1px solid #2563eb; background: #fff; color: #2563eb; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; &:hover { background: #2563eb; color: #fff; } }
            .btn-schedule { padding: 8px 16px; border: none; background: #10b981; color: #fff; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; margin-left: 8px; &:hover { background: #059669; } }
          }
          tr:hover td { background: #f8fafc; }
        }
      }
    }
    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { background: white; border-radius: 12px; width: 580px; max-width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal-header { padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 1;
      h3 { margin: 0; font-size: 18px; }
      .modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
    }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; position: sticky; bottom: 0; background: white; }
    .schedule-for { margin-bottom: 20px; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #2563eb; font-size: 14px; }
    .form-group { margin-bottom: 16px;
      label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #334155; }
    }
    .form-input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; &:focus { border-color: #2563eb; } }
    .hint-red { color: #ef4444; display: block; margin-top: 4px; font-size: 12px; }
    .added-interviewers { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .added-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; font-size: 13px; color: #1e40af;
      .chip-remove { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 14px; padding: 0; }
    }
    .add-interviewer-row { display: flex; gap: 8px; }
    .btn-add { padding: 10px 16px; border: none; background: #2563eb; color: white; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap; &:hover { background: #1d4ed8; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
    .meeting-link-row { display: flex; gap: 8px; }
    .btn-generate { padding: 10px 16px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; cursor: pointer; font-size: 13px; white-space: nowrap; &:hover { background: #e2e8f0; } }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-weight: 600; }
    .btn-submit { padding: 10px 20px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; font-weight: 600; &:hover { background: #1d4ed8; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  `]
})
export class CandidatesTab implements OnInit {
  activeTab = 'in-progress';

  candidatesList: Candidate[] = [];
  activeApplications: Application[] = [];

  // ─── Schedule Modal State ─────────────────────────
  showScheduleModal = false;
  selectedApp: Application | null = null;
  isScheduling = false;
  formStep = 1; // tracks which steps are visible

  // Step 1: Department
  departments: Department[] = [];
  selectedDepartmentIdx = -1;

  // Step 2: Interviewer
  interviewers: UserInterviewer[] = [];
  selectedInterviewerIdx = -1;

  // Step 3: Slot
  availableSlots: InterviewSlot[] = [];
  selectedSlotIdx = -1;

  // Step 4: Additional interviewers
  additionalInterviewers: UserInterviewer[] = [];
  additionalInterviewerToAdd = '';

  // Step 5: Details
  interviewType = '';
  roundNumber = 1;
  meetingLink = '';

  private readonly NS = 'http://schemas.cordys.com/RMST1DatabaseMetadata';

  ngOnInit(): void {
    this.loadApplications();
  }

  // ════════════════════════════════════════════════════
  //  LOAD APPLICATIONS (existing behaviour)
  // ════════════════════════════════════════════════════
  loadApplications(): void {
    $.cordys.ajax({
      method: 'GetTs_candidatesObjects', namespace: this.NS,
      parameters: { fromCandidate_id: '', toCandidate_id: '' }, dataType: 'xml'
    }).done((xmlC: any) => {
      const rowsC = xmlC.getElementsByTagName('tuple');
      const listC: Candidate[] = [];
      for (let i = 0; i < rowsC.length; i++) {
        const r = rowsC[i];
        listC.push({
          candidate_id: r.getElementsByTagName('candidate_id')[0]?.textContent || '',
          first_name: r.getElementsByTagName('first_name')[0]?.textContent || '',
          last_name: r.getElementsByTagName('last_name')[0]?.textContent || '',
          email: r.getElementsByTagName('email')[0]?.textContent || '',
          phone: r.getElementsByTagName('phone')[0]?.textContent || '',
          experience_years: r.getElementsByTagName('experience_years')[0]?.textContent || '',
          location: r.getElementsByTagName('location')[0]?.textContent || ''
        });
      }
      this.candidatesList = listC;

      $.cordys.ajax({
        method: 'GetTs_applicationsObjects', namespace: this.NS,
        parameters: { fromApplication_id: '', toApplication_id: '' }, dataType: 'xml'
      }).done((xmlA: any) => {
        const rowsA = xmlA.getElementsByTagName('tuple');
        const listA: Application[] = [];
        for (let i = 0; i < rowsA.length; i++) {
          const r = rowsA[i];
          const app: Application = {
            application_id: r.getElementsByTagName('application_id')[0]?.textContent || '',
            candidate_id: r.getElementsByTagName('candidate_id')[0]?.textContent || '',
            requisition_id: r.getElementsByTagName('requisition_id')[0]?.textContent || '',
            source: r.getElementsByTagName('source')[0]?.textContent || '',
            status: r.getElementsByTagName('status')[0]?.textContent || '',
            current_stage_id: r.getElementsByTagName('current_stage_id')[0]?.textContent || ''
          };
          const match = this.candidatesList.find(c => c.candidate_id === app.candidate_id);
          if (match) {
            app.candidate_name = match.first_name + ' ' + match.last_name;
            app.candidate_email = match.email;
          }
          listA.push(app);
        }
        this.activeApplications = listA.filter(a => a.status === 'ACTIVE');

        // Dummy data for testing
        if (this.activeApplications.length === 0) {
          this.activeApplications.push({
            application_id: 'APP-MOCK-001', candidate_id: 'CAN-MOCK-001', requisition_id: 'JOB-000001',
            source: 'LinkedIn', status: 'ACTIVE', current_stage_id: 'STG-000003',
            candidate_name: 'Jane Doe (MOCK)', candidate_email: 'jane@example.com'
          });
        }
      });
    });
  }

  // ════════════════════════════════════════════════════
  //  STAGE HELPERS
  // ════════════════════════════════════════════════════
  getStageName(stageId: string): string {
    if (!stageId) return 'New';
    if (stageId.includes('001')) return 'Screening';
    if (stageId.includes('002')) return 'Assessment';
    if (stageId.includes('003')) return 'Interview';
    if (stageId.includes('004')) return 'Offer';
    return stageId;
  }

  isInterviewStage(app: Application): boolean {
    return this.getStageName(app.current_stage_id).toLowerCase().includes('interview');
  }

  // ════════════════════════════════════════════════════
  //  MODAL OPEN / CLOSE
  // ════════════════════════════════════════════════════
  openScheduleModal(app: Application): void {
    this.selectedApp = app;
    this.resetForm();
    this.showScheduleModal = true;
    this.loadDepartments();
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.selectedApp = null;
  }

  resetForm(): void {
    this.formStep = 1;
    this.selectedDepartmentIdx = -1;
    this.selectedInterviewerIdx = -1;
    this.selectedSlotIdx = -1;
    this.additionalInterviewers = [];
    this.additionalInterviewerToAdd = '';
    this.interviewType = '';
    this.roundNumber = 1;
    this.meetingLink = '';
    this.interviewers = [];
    this.availableSlots = [];
  }

  // ════════════════════════════════════════════════════
  //  STEP 1: Load Departments
  // ════════════════════════════════════════════════════
  loadDepartments(): void {
    $.cordys.ajax({
      method: 'GetMt_departmentsObjects', namespace: this.NS,
      parameters: { fromDepartment_id: '', toDepartment_id: '' }, dataType: 'xml'
    }).done((xml: any) => {
      const rows = xml.getElementsByTagName('tuple');
      const list: Department[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        list.push({
          department_id: r.getElementsByTagName('department_id')[0]?.textContent || '',
          department_name: r.getElementsByTagName('department_name')[0]?.textContent || ''
        });
      }
      this.departments = list;

      // Dummy data
      if (this.departments.length === 0) {
        this.departments.push(
          { department_id: 'DEP-000001', department_name: 'Engineering' },
          { department_id: 'DEP-000002', department_name: 'HR' }
        );
      }
    });
  }

  // ════════════════════════════════════════════════════
  //  STEP 2: Load Interviewers by Department
  // ════════════════════════════════════════════════════
  onDepartmentChange(): void {
    this.selectedInterviewerIdx = -1;
    this.selectedSlotIdx = -1;
    this.availableSlots = [];
    this.additionalInterviewers = [];
    this.interviewers = [];

    if (this.selectedDepartmentIdx < 0) { this.formStep = 1; return; }
    this.formStep = 2;

    const dept = this.departments[this.selectedDepartmentIdx];
    const deptId = dept?.department_id || '';

    $.cordys.ajax({
      method: 'GetTs_usersObjectsFordepartment_id', namespace: this.NS,
      parameters: { Department_id: deptId }, dataType: 'xml'
    }).done((xml: any) => {
      const rows = xml.getElementsByTagName('tuple');
      const list: UserInterviewer[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const role = r.getElementsByTagName('role')[0]?.textContent || '';
        if (role === 'INTERVIEWER') {
          list.push({
            user_id: r.getElementsByTagName('user_id')[0]?.textContent || '',
            first_name: r.getElementsByTagName('first_name')[0]?.textContent || '',
            last_name: r.getElementsByTagName('last_name')[0]?.textContent || '',
            email: r.getElementsByTagName('email')[0]?.textContent || '',
            role: role,
            department_id: r.getElementsByTagName('department_id')[0]?.textContent || ''
          });
        }
      }
      this.interviewers = list;

      // Dummy data
      if (this.interviewers.length === 0) {
        this.interviewers.push(
          { user_id: 'USR-000010', first_name: 'John', last_name: 'Smith', email: 'john@company.com', role: 'INTERVIEWER', department_id: deptId },
          { user_id: 'USR-000011', first_name: 'Sarah', last_name: 'Jones', email: 'sarah@company.com', role: 'INTERVIEWER', department_id: deptId }
        );
      }
    });
  }

  // ════════════════════════════════════════════════════
  //  STEP 3: Load Available Slots for Interviewer
  // ════════════════════════════════════════════════════
  onInterviewerChange(): void {
    this.selectedSlotIdx = -1;
    this.availableSlots = [];

    if (this.selectedInterviewerIdx < 0) { this.formStep = 2; return; }
    this.formStep = 3;

    const interviewer = this.interviewers[this.selectedInterviewerIdx];
    const userId = interviewer?.user_id || '';

    $.cordys.ajax({
      method: 'GetTs_interview_slotsObjectsForcreated_by_user', namespace: this.NS,
      parameters: { Created_by_user: userId }, dataType: 'xml'
    }).done((xml: any) => {
      const rows = xml.getElementsByTagName('tuple');
      const list: InterviewSlot[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const t1 = r.getElementsByTagName('temp1')[0]?.textContent || '0';
        if (t1 === '0') {
          list.push({
            slot_id: r.getElementsByTagName('slot_id')[0]?.textContent || '',
            slot_date: r.getElementsByTagName('slot_date')[0]?.textContent || '',
            start_time: r.getElementsByTagName('start_time')[0]?.textContent || '',
            end_time: r.getElementsByTagName('end_time')[0]?.textContent || '',
            created_by_user: r.getElementsByTagName('created_by_user')[0]?.textContent || '',
            temp1: t1
          });
        }
      }
      this.availableSlots = list;

      // Dummy data
      if (this.availableSlots.length === 0) {
        this.availableSlots.push(
          { slot_id: 'SLT-MOCK-001', slot_date: '2026-04-01', start_time: '10:00', end_time: '11:00', created_by_user: userId, temp1: '0' },
          { slot_id: 'SLT-MOCK-002', slot_date: '2026-04-02', start_time: '14:00', end_time: '15:00', created_by_user: userId, temp1: '0' }
        );
      }
    });
  }

  // ════════════════════════════════════════════════════
  //  STEP 3b: Slot selected → show remaining fields
  // ════════════════════════════════════════════════════
  onSlotChange(): void {
    if (this.selectedSlotIdx < 0) { this.formStep = 3; return; }
    this.formStep = 4;
  }

  // ════════════════════════════════════════════════════
  //  STEP 4: Additional Interviewers
  // ════════════════════════════════════════════════════
  get selectedInterviewer(): UserInterviewer | null {
    return this.selectedInterviewerIdx >= 0 ? this.interviewers[this.selectedInterviewerIdx] : null;
  }

  get selectedSlot(): InterviewSlot | null {
    return this.selectedSlotIdx >= 0 ? this.availableSlots[this.selectedSlotIdx] : null;
  }

  get remainingInterviewers(): UserInterviewer[] {
    const primary = this.selectedInterviewer;
    const usedIds = new Set([...(primary ? [primary.user_id] : []), ...this.additionalInterviewers.map(a => a.user_id)]);
    return this.interviewers.filter(u => !usedIds.has(u.user_id));
  }

  addInterviewer(): void {
    if (!this.additionalInterviewerToAdd) return;
    const user = this.interviewers.find(u => u.user_id === this.additionalInterviewerToAdd);
    if (user) {
      this.additionalInterviewers.push(user);
      this.additionalInterviewerToAdd = '';
    }
  }

  removeAdditionalInterviewer(idx: number): void {
    this.additionalInterviewers.splice(idx, 1);
  }

  // ════════════════════════════════════════════════════
  //  STEP 5: Meeting Link
  // ════════════════════════════════════════════════════
  generateMeetingLink(): void {
    const id = Math.random().toString(36).substring(2, 8);
    this.meetingLink = 'https://meet.example.com/int-' + id;
  }

  // ════════════════════════════════════════════════════
  //  VALIDATION
  // ════════════════════════════════════════════════════
  canSchedule(): boolean {
    return !!(this.selectedApp && this.selectedSlot && this.selectedInterviewer && this.interviewType);
  }

  // ════════════════════════════════════════════════════
  //  SCHEDULE: 3-step save
  //  1. UpdateTs_interviews (INSERT)
  //  2. UpdateTs_interviewers (INSERT per interviewer)
  //  3. UpdateTs_interview_slots (mark booked)
  // ════════════════════════════════════════════════════
  scheduleInterview(): void {
    if (!this.canSchedule()) {
      alert('Please complete all required fields.');
      return;
    }

    const slot = this.selectedSlot!;
    const interviewer = this.selectedInterviewer!;
    this.isScheduling = true;

    // Step 1: Create interview record
    $.cordys.ajax({
      method: 'UpdateTs_interviews', namespace: this.NS,
      parameters: {
        tuple: {
          'new': {
            ts_interviews: {
              interview_id: '',
              application_id: this.selectedApp!.application_id,
              interview_type: this.interviewType,
              round_number: this.roundNumber.toString(),
              slot_id: slot.slot_id,
              meeting_link: this.meetingLink,
              status: 'SCHEDULED',
              created_by_user: '',
              temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
            }
          }
        }
      },
      dataType: 'xml'
    })
    .done((responseXml: any) => {
      // Try to extract the generated interview_id from the response
      const intId = responseXml.getElementsByTagName('interview_id')[0]?.textContent || '';

      // Step 2: Insert all interviewers (primary + additional)
      const allInterviewerIds = [interviewer.user_id, ...this.additionalInterviewers.map(a => a.user_id)];
      allInterviewerIds.forEach(userId => {
        $.cordys.ajax({
          method: 'UpdateTs_interviewers', namespace: this.NS,
          parameters: {
            tuple: {
              'new': {
                ts_interviewers: {
                  interview_id: intId,
                  user_id: userId,
                  temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
                }
              }
            }
          },
          dataType: 'xml'
        });
      });

      // Step 3: Mark slot as booked (temp1 = '1')
      this.markSlotBooked(slot);

      alert('Interview scheduled successfully!');
      this.closeScheduleModal();
      this.isScheduling = false;
    })
    .fail((err: any) => {
      console.error('Failed to schedule interview:', err);
      alert('Failed to schedule interview. Check console.');
      this.isScheduling = false;
    });
  }

  markSlotBooked(slot: InterviewSlot): void {
    $.cordys.ajax({
      method: 'UpdateTs_interview_slots', namespace: this.NS,
      parameters: {
        tuple: {
          old: {
            ts_interview_slots: {
              slot_id: slot.slot_id, slot_date: slot.slot_date, start_time: slot.start_time, end_time: slot.end_time,
              created_by_user: slot.created_by_user, temp1: '0', temp2: '', temp3: '', temp4: '', temp5: ''
            }
          },
          'new': {
            ts_interview_slots: {
              slot_id: slot.slot_id, slot_date: slot.slot_date, start_time: slot.start_time, end_time: slot.end_time,
              created_by_user: slot.created_by_user, temp1: '1', temp2: '', temp3: '', temp4: '', temp5: ''
            }
          }
        }
      },
      dataType: 'xml'
    });
  }
}
