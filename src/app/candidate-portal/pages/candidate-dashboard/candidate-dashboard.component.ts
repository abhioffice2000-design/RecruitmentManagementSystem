import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../services/mock-data.service';
import { Job, Application, Interview, UserProfile } from '../../models/job.model';

@Component({
  selector: 'app-candidate-dashboard',
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.scss']
})
export class CandidateDashboardComponent implements OnInit {
  user!: UserProfile;
  userInitials = '';
  today = '';
  interviews: Interview[] = [];
  recommendedJobs: Job[] = [];
  recentApplications: Application[] = [];
  statusCards: any[] = [];

  profileTips = [
    { text: 'Upload resume', done: true },
    { text: 'Add work experience', done: true },
    { text: 'Add skills', done: true },
    { text: 'Add LinkedIn profile', done: true },
    { text: 'Add certifications', done: false },
    { text: 'Add portfolio link', done: false }
  ];

  constructor(private dataService: MockDataService) {}

  ngOnInit() {
    this.user = this.dataService.getUser();
    this.userInitials = this.user.firstName[0] + this.user.lastName[0];
    this.today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.interviews = this.dataService.getInterviews();
    this.recommendedJobs = this.dataService.getJobs().slice(0, 3);
    this.recentApplications = this.dataService.getApplications().slice(0, 4);

    const stats = this.dataService.getApplicationStats();
    this.statusCards = [
      { icon: 'fa-solid fa-paper-plane', label: 'Applied', value: stats.applied, bg: 'var(--info-bg)', color: 'var(--info)' },
      { icon: 'fa-solid fa-magnifying-glass', label: 'Under Review', value: stats.screening, bg: 'var(--warning-bg)', color: 'var(--warning)' },
      { icon: 'fa-solid fa-microphone', label: 'Interview', value: stats.interview, bg: '#E0E7FF', color: 'var(--primary)' },
      { icon: 'fa-solid fa-gift', label: 'Offer', value: stats.offer, bg: 'var(--success-bg)', color: 'var(--success)' },
      { icon: 'fa-solid fa-circle-xmark', label: 'Rejected', value: stats.rejected, bg: 'var(--danger-bg)', color: 'var(--danger)' }
    ];
  }

  getMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
  }

  getDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString();
  }

  toggleSave(jobId: number) {
    this.dataService.toggleSaveJob(jobId);
    this.recommendedJobs = this.dataService.getJobs().slice(0, 3);
  }

  getStatusBadge(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
