import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../services/mock-data.service';
import { Application } from '../../models/job.model';

@Component({
  selector: 'app-candidate-applications',
  templateUrl: './candidate-applications.component.html',
  styleUrls: ['./candidate-applications.component.scss']
})
export class CandidateApplicationsComponent implements OnInit {
  applications: Application[] = [];
  filteredApps: Application[] = [];
  activeFilter = 'All';
  filters = ['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];

  constructor(private dataService: MockDataService) {}

  ngOnInit() {
    this.applications = this.dataService.getApplications();
    this.filteredApps = [...this.applications];
  }

  filterBy(status: string) {
    this.activeFilter = status;
    this.filteredApps = status === 'All'
      ? [...this.applications]
      : this.applications.filter(a => a.status === status);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Applied': 'fa-solid fa-paper-plane',
      'Screening': 'fa-solid fa-magnifying-glass',
      'Interview': 'fa-solid fa-microphone',
      'Offer': 'fa-solid fa-gift',
      'Rejected': 'fa-solid fa-circle-xmark'
    };
    return icons[status] || 'fa-solid fa-clipboard-list';
  }
}
