import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-jobs.html',
  styleUrls: ['./manager-jobs.scss'],
})
export class ManagerJobs {
  jobRequests = [
    { id: 'REQ-2041', title: 'Senior Frontend Engineer', type: 'Full-time', priority: 'High', status: 'Approved', date: 'Oct 20, 2026' },
    { id: 'REQ-2042', title: 'Product Design Lead', type: 'Full-time', priority: 'Medium', status: 'Pending Approval', date: 'Oct 24, 2026' },
    { id: 'REQ-2043', title: 'DevOps Specialist', type: 'Contract', priority: 'High', status: 'Draft', date: 'Oct 25, 2026' }
  ];
}
