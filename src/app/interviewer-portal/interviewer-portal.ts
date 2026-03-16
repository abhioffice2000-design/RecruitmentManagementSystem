import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ─── Interfaces ─────────────────────────────────────────────
interface Interview {
  interview_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  department: string;
  interview_type: string;
  round_number: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  application_id: string;
}

interface Slot {
  slot_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface FeedbackForm {
  interview_id: string;
  candidate_name: string;
  job_title: string;
  rating: number;
  recommendation: string;
  comments: string;
}

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  status: 'UNSENT' | 'SENT';
  sent_at: string;
}

interface Delegation {
  delegation_id: string;
  delegate_name: string;
  delegate_email: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
}

@Component({
  selector: 'app-interviewer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interviewer-portal.html',
  styleUrls: ['./interviewer-portal.scss'],
})
export class InterviewerPortal implements OnInit {
  // ─── Sidebar ─────────────────────────────────────────────
  sidebarCollapsed = false;
  activeView = 'dashboard';
  loggedInUser = '';

  navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'interviews', label: 'My Interviews', icon: 'fas fa-video' },
    { id: 'availability', label: 'Availability', icon: 'fas fa-calendar-alt' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'delegation', label: 'Delegation', icon: 'fas fa-user-friends' },
  ];

  // ─── Dashboard Stats ────────────────────────────────────
  stats = {
    upcoming: 0,
    completed: 0,
    pendingFeedback: 0,
    slotsThisWeek: 0,
  };

  // ─── Interviews ─────────────────────────────────────────
  interviews: Interview[] = [];
  interviewFilter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'ALL';

  // ─── Availability ───────────────────────────────────────
  slots: Slot[] = [];
  newSlot = { date: '', startTime: '', endTime: '' };
  showSlotForm = false;

  // ─── Feedback ───────────────────────────────────────────
  feedbackInterview: Interview | null = null;
  feedbackForm: FeedbackForm = {
    interview_id: '',
    candidate_name: '',
    job_title: '',
    rating: 0,
    recommendation: '',
    comments: '',
  };
  showFeedbackModal = false;
  hoveredStar = 0;

  // ─── Notifications ─────────────────────────────────────
  notifications: Notification[] = [];

  // ─── Delegation ─────────────────────────────────────────
  delegations: Delegation[] = [];
  newDelegation = { delegateEmail: '', startDate: '', endDate: '', reason: '' };
  showDelegationForm = false;

  // ─── Toast ──────────────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loggedInUser = sessionStorage.getItem('loggedInUser') || 'interviewer@adnate.com';
    this.loadMockData();
    this.calculateStats();
  }

  // ─── Navigation ─────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setView(viewId: string): void {
    this.activeView = viewId;
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // ─── Mock Data ──────────────────────────────────────────
  loadMockData(): void {
    this.interviews = [
      {
        interview_id: 'INT-000001',
        candidate_name: 'Aarav Sharma',
        candidate_email: 'aarav.sharma@email.com',
        job_title: 'Senior Angular Developer',
        department: 'Engineering',
        interview_type: 'Technical Round',
        round_number: 2,
        slot_date: '2026-03-17',
        start_time: '10:00',
        end_time: '11:00',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        status: 'SCHEDULED',
        application_id: 'APP-000012',
      },
      {
        interview_id: 'INT-000002',
        candidate_name: 'Priya Patel',
        candidate_email: 'priya.patel@email.com',
        job_title: 'Full Stack Developer',
        department: 'Engineering',
        interview_type: 'System Design',
        round_number: 3,
        slot_date: '2026-03-18',
        start_time: '14:00',
        end_time: '15:00',
        meeting_link: 'https://meet.google.com/xyz-uvwx-yz1',
        status: 'SCHEDULED',
        application_id: 'APP-000015',
      },
      {
        interview_id: 'INT-000003',
        candidate_name: 'Rahul Verma',
        candidate_email: 'rahul.verma@email.com',
        job_title: 'UI/UX Designer',
        department: 'Design',
        interview_type: 'Portfolio Review',
        round_number: 1,
        slot_date: '2026-03-14',
        start_time: '11:00',
        end_time: '12:00',
        meeting_link: 'https://meet.google.com/lmn-opqr-stu',
        status: 'COMPLETED',
        application_id: 'APP-000008',
      },
      {
        interview_id: 'INT-000004',
        candidate_name: 'Sneha Gupta',
        candidate_email: 'sneha.gupta@email.com',
        job_title: 'Data Engineer',
        department: 'Data Science',
        interview_type: 'Technical Round',
        round_number: 1,
        slot_date: '2026-03-19',
        start_time: '09:00',
        end_time: '10:00',
        meeting_link: 'https://meet.google.com/qrs-tuvw-xyz',
        status: 'SCHEDULED',
        application_id: 'APP-000020',
      },
      {
        interview_id: 'INT-000005',
        candidate_name: 'Vikram Singh',
        candidate_email: 'vikram.singh@email.com',
        job_title: 'DevOps Engineer',
        department: 'Infrastructure',
        interview_type: 'Culture Fit',
        round_number: 2,
        slot_date: '2026-03-13',
        start_time: '16:00',
        end_time: '16:30',
        meeting_link: '',
        status: 'CANCELLED',
        application_id: 'APP-000005',
      },
      {
        interview_id: 'INT-000006',
        candidate_name: 'Ananya Reddy',
        candidate_email: 'ananya.reddy@email.com',
        job_title: 'QA Analyst',
        department: 'Quality',
        interview_type: 'Technical Round',
        round_number: 1,
        slot_date: '2026-03-12',
        start_time: '10:30',
        end_time: '11:30',
        meeting_link: 'https://meet.google.com/abc-mnop-xyz',
        status: 'COMPLETED',
        application_id: 'APP-000003',
      },
    ];

    this.slots = [
      { slot_id: 'SLT-000001', slot_date: '2026-03-17', start_time: '09:00', end_time: '10:00', is_booked: false },
      { slot_id: 'SLT-000002', slot_date: '2026-03-17', start_time: '10:00', end_time: '11:00', is_booked: true },
      { slot_id: 'SLT-000003', slot_date: '2026-03-18', start_time: '14:00', end_time: '15:00', is_booked: true },
      { slot_id: 'SLT-000004', slot_date: '2026-03-19', start_time: '09:00', end_time: '10:00', is_booked: true },
      { slot_id: 'SLT-000005', slot_date: '2026-03-19', start_time: '11:00', end_time: '12:00', is_booked: false },
      { slot_id: 'SLT-000006', slot_date: '2026-03-20', start_time: '15:00', end_time: '16:00', is_booked: false },
    ];

    this.notifications = [
      {
        notification_id: 'NOT-000001',
        title: 'New Interview Assigned',
        message: 'You have been assigned a Technical Round interview with Aarav Sharma on Mar 17, 2026.',
        entity_type: 'INTERVIEW',
        entity_id: 'INT-000001',
        status: 'SENT',
        sent_at: '2026-03-15T10:30:00',
      },
      {
        notification_id: 'NOT-000002',
        title: 'Feedback Reminder',
        message: 'Please submit feedback for the Portfolio Review with Rahul Verma (completed on Mar 14).',
        entity_type: 'INTERVIEW',
        entity_id: 'INT-000003',
        status: 'SENT',
        sent_at: '2026-03-15T14:00:00',
      },
      {
        notification_id: 'NOT-000003',
        title: 'Interview Cancelled',
        message: 'The Culture Fit interview with Vikram Singh scheduled on Mar 13 has been cancelled.',
        entity_type: 'INTERVIEW',
        entity_id: 'INT-000005',
        status: 'SENT',
        sent_at: '2026-03-13T09:00:00',
      },
      {
        notification_id: 'NOT-000004',
        title: 'New Interview Assigned',
        message: 'You have been assigned a System Design interview with Priya Patel on Mar 18, 2026.',
        entity_type: 'INTERVIEW',
        entity_id: 'INT-000002',
        status: 'UNSENT',
        sent_at: '2026-03-16T08:00:00',
      },
    ];

    this.delegations = [
      {
        delegation_id: 'DEL-000001',
        delegate_name: 'Arjun Mehta',
        delegate_email: 'arjun.mehta@adnate.com',
        start_date: '2026-03-20',
        end_date: '2026-03-25',
        status: 'ACTIVE',
        reason: 'Out of office — conference attendance',
      },
    ];
  }

  calculateStats(): void {
    this.stats.upcoming = this.interviews.filter(i => i.status === 'SCHEDULED').length;
    this.stats.completed = this.interviews.filter(i => i.status === 'COMPLETED').length;
    this.stats.pendingFeedback = this.interviews.filter(i => i.status === 'COMPLETED').length; // simplified
    this.stats.slotsThisWeek = this.slots.filter(s => !s.is_booked).length;
  }

  // ─── Dashboard helpers ──────────────────────────────────
  get upcomingInterviews(): Interview[] {
    return this.interviews
      .filter(i => i.status === 'SCHEDULED')
      .sort((a, b) => a.slot_date.localeCompare(b.slot_date));
  }

  get recentActivity(): { icon: string; text: string; time: string; color: string }[] {
    return [
      { icon: 'fas fa-check-circle', text: 'Feedback submitted for Rahul Verma — Portfolio Review', time: '2 hours ago', color: '#16a34a' },
      { icon: 'fas fa-calendar-plus', text: 'New interview assigned — Aarav Sharma, Technical Round', time: '5 hours ago', color: '#2563eb' },
      { icon: 'fas fa-times-circle', text: 'Interview cancelled — Vikram Singh, Culture Fit', time: '1 day ago', color: '#ef4444' },
      { icon: 'fas fa-clock', text: 'Availability slot added — Mar 20 (3:00 PM – 4:00 PM)', time: '2 days ago', color: '#f59e0b' },
    ];
  }

  // ─── Interviews ─────────────────────────────────────────
  get filteredInterviews(): Interview[] {
    if (this.interviewFilter === 'ALL') return this.interviews;
    return this.interviews.filter(i => i.status === this.interviewFilter);
  }

  setInterviewFilter(filter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'): void {
    this.interviewFilter = filter;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  joinMeeting(link: string): void {
    if (link) window.open(link, '_blank');
  }

  // ─── Availability ───────────────────────────────────────
  toggleSlotForm(): void {
    this.showSlotForm = !this.showSlotForm;
    if (!this.showSlotForm) {
      this.newSlot = { date: '', startTime: '', endTime: '' };
    }
  }

  addSlot(): void {
    if (!this.newSlot.date || !this.newSlot.startTime || !this.newSlot.endTime) {
      this.showToast('Please fill in all slot fields.', 'error');
      return;
    }
    const newId = 'SLT-' + String(this.slots.length + 1).padStart(6, '0');
    this.slots.push({
      slot_id: newId,
      slot_date: this.newSlot.date,
      start_time: this.newSlot.startTime,
      end_time: this.newSlot.endTime,
      is_booked: false,
    });
    this.calculateStats();
    this.toggleSlotForm();
    this.showToast('Availability slot added successfully!', 'success');
  }

  removeSlot(slotId: string): void {
    this.slots = this.slots.filter(s => s.slot_id !== slotId);
    this.calculateStats();
    this.showToast('Slot removed.', 'success');
  }

  // ─── Feedback ───────────────────────────────────────────
  openFeedback(interview: Interview): void {
    this.feedbackInterview = interview;
    this.feedbackForm = {
      interview_id: interview.interview_id,
      candidate_name: interview.candidate_name,
      job_title: interview.job_title,
      rating: 0,
      recommendation: '',
      comments: '',
    };
    this.hoveredStar = 0;
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.feedbackInterview = null;
  }

  setRating(value: number): void {
    this.feedbackForm.rating = value;
  }

  submitFeedback(): void {
    if (!this.feedbackForm.rating) {
      this.showToast('Please provide a rating.', 'error');
      return;
    }
    if (!this.feedbackForm.recommendation) {
      this.showToast('Please select a recommendation.', 'error');
      return;
    }
    // In production, this would call the Cordys API
    this.showToast('Feedback submitted successfully!', 'success');
    this.closeFeedbackModal();
  }

  // ─── Delegation ─────────────────────────────────────────
  toggleDelegationForm(): void {
    this.showDelegationForm = !this.showDelegationForm;
    if (!this.showDelegationForm) {
      this.newDelegation = { delegateEmail: '', startDate: '', endDate: '', reason: '' };
    }
  }

  addDelegation(): void {
    if (!this.newDelegation.delegateEmail || !this.newDelegation.startDate || !this.newDelegation.endDate) {
      this.showToast('Please fill in all delegation fields.', 'error');
      return;
    }
    const newId = 'DEL-' + String(this.delegations.length + 1).padStart(6, '0');
    this.delegations.push({
      delegation_id: newId,
      delegate_name: this.newDelegation.delegateEmail.split('@')[0],
      delegate_email: this.newDelegation.delegateEmail,
      start_date: this.newDelegation.startDate,
      end_date: this.newDelegation.endDate,
      status: 'ACTIVE',
      reason: this.newDelegation.reason,
    });
    this.toggleDelegationForm();
    this.showToast('Delegation created successfully!', 'success');
  }

  revokeDelegation(id: string): void {
    const del = this.delegations.find(d => d.delegation_id === id);
    if (del) del.status = 'REVOKED';
    this.showToast('Delegation revoked.', 'success');
  }

  // ─── Helpers ────────────────────────────────────────────
  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  formatDateTime(dtStr: string): string {
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
      ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  get unreadNotifications(): number {
    return this.notifications.filter(n => n.status === 'UNSENT').length;
  }

  // ─── Toast ──────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastFlag = false, 3000);
  }
}
