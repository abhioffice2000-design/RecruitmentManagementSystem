import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-candidate-apply-job',
  templateUrl: './candidate-apply-job.component.html',
  styleUrls: ['./candidate-apply-job.component.scss']
})
export class CandidateApplyJobComponent implements OnInit {
  job: Job | null = null;
  submitted = false;
  formData = {
    coverLetter: '',
    expectedSalary: '',
    noticePeriod: '',
    whyJoin: ''
  };
  resumeFileName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: MockDataService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.job = this.dataService.getJobById(id) || null;
    if (!this.job) {
      this.router.navigate(['/jobs']);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.resumeFileName = input.files[0].name;
    }
  }

  submitApplication() {
    if (this.job) {
      this.dataService.applyToJob(this.job.id);
      this.submitted = true;
    }
  }

  goBack() {
    if (this.job) {
      this.router.navigate(['/jobs', this.job.id]);
    } else {
      this.router.navigate(['/jobs']);
    }
  }
}
