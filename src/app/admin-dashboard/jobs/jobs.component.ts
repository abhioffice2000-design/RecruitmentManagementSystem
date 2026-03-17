import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent {
  jobs = [
    { id: 1, title: 'Senior Frontend Developer', dept: 'Engineering', location: 'Remote', type: 'Full-time', status: 'Active', applicants: 45, daysLeft: 12 },
    { id: 2, title: 'Backend Cloud Architect', dept: 'Engineering', location: 'New York, NY', type: 'Full-time', status: 'Active', applicants: 12, daysLeft: 5 },
    { id: 3, title: 'Product Manager', dept: 'Product', location: 'San Francisco, CA', type: 'Full-time', status: 'Active', applicants: 89, daysLeft: 20 },
    { id: 4, title: 'DevOps Engineer', dept: 'Engineering', location: 'Remote', type: 'Contract', status: 'Closed', applicants: 34, daysLeft: 0 },
    { id: 5, title: 'UI/UX Designer', dept: 'Design', location: 'London, UK', type: 'Full-time', status: 'Active', applicants: 67, daysLeft: 15 },
    { id: 6, title: 'Marketing Specialist', dept: 'Marketing', location: 'Austin, TX', type: 'Part-time', status: 'Draft', applicants: 0, daysLeft: -1 }
  ];
}
