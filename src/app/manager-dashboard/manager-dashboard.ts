import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.scss'],
})
export class ManagerDashboard {
  overviewStats = [
    { label: 'Pending Approvals', value: '12', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-warning' },
    { label: 'Interviews Today', value: '5', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', colorClass: 'text-primary' },
    { label: 'Open Positions', value: '8', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', colorClass: 'text-success' },
  ];

  jobApprovals = [
    { id: 'REQ-2041', title: 'Senior Frontend Engineer', department: 'Engineering', requestedBy: 'HR User A', date: 'Today', status: 'Pending' },
    { id: 'REQ-2042', title: 'Product Design Lead', department: 'Design', requestedBy: 'HR User B', date: 'Yesterday', status: 'Pending' },
    { id: 'REQ-2043', title: 'DevOps Specialist', department: 'Operations', requestedBy: 'HR User A', date: 'Oct 22', status: 'Pending' }
  ];

  candidatesToReview = [
    { name: 'Alex Johnson', position: 'Backend Engineeer', stage: 'Technical Round 1', date: 'Today, 10:00 AM' },
    { name: 'Maria Garcia', position: 'Data Scientist', stage: 'Final Interview', date: 'Today, 2:30 PM' },
    { name: 'James Smith', position: 'Product Manager', stage: 'Culture Fit', date: 'Tomorrow, 11:00 AM' }
  ];

  approveRequest(id: string) {
    this.jobApprovals = this.jobApprovals.filter(req => req.id !== id);
    // In a real app, this would make an API call
  }

  rejectRequest(id: string) {
    this.jobApprovals = this.jobApprovals.filter(req => req.id !== id);
    // In a real app, this would make an API call
  }
}
