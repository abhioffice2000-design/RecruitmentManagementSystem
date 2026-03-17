import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../services/mock-data.service';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-candidate-job-search',
  templateUrl: './candidate-job-search.component.html',
  styleUrls: ['./candidate-job-search.component.scss']
})
export class CandidateJobSearchComponent implements OnInit {
  filteredJobs: Job[] = [];
  totalJobs = 0;
  sortBy = 'latest';
  departments = ['Engineering', 'Design', 'Product', 'Data Science', 'Infrastructure', 'Quality'];
  experienceLevels = ['1-3 years', '2-4 years', '2-5 years', '3-5 years', '3-6 years', '5-8 years'];
  filters = { query: '', location: '', department: '', experienceLevel: '', type: '' };

  constructor(private dataService: MockDataService) {}

  ngOnInit() {
    this.totalJobs = this.dataService.getJobs().length;
    this.search();
  }

  search() {
    this.filteredJobs = this.dataService.searchJobs(this.filters);
    this.sort();
  }

  sort() {
    if (this.sortBy === 'latest') {
      this.filteredJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else {
      this.filteredJobs.sort((a, b) => b.applicants - a.applicants);
    }
  }

  clearFilters() {
    this.filters = { query: '', location: '', department: '', experienceLevel: '', type: '' };
    this.search();
  }

  toggleSave(jobId: number) {
    this.dataService.toggleSaveJob(jobId);
    this.search();
  }

  getTimeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return diff + ' days ago';
  }
}
