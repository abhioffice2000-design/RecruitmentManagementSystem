import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-candidate-job-detail',
  templateUrl: './candidate-job-detail.component.html',
  styleUrls: ['./candidate-job-detail.component.scss']
})
export class CandidateJobDetailComponent implements OnInit {
  job: Job | null = null;
  applied = false;

  constructor(private route: ActivatedRoute, private dataService: MockDataService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.dataService.getJobById(id);
    if (found) {
      this.job = found;
      const apps = this.dataService.getApplications();
      this.applied = apps.some(a => a.jobId === id);
    }
  }

  apply() {
    if (this.job && !this.applied) {
      this.applied = this.dataService.applyToJob(this.job.id);
    }
  }

  toggleSave() {
    if (this.job) {
      this.dataService.toggleSaveJob(this.job.id);
      const updated = this.dataService.getJobById(this.job.id);
      if (updated) this.job = updated;
    }
  }

  getTimeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return diff + ' days ago';
  }
}
