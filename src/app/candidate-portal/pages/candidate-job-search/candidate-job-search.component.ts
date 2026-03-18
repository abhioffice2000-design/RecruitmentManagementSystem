import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SoapService } from '../../../services/soap.service';

interface JobCard {
  requisition_id: string;
  title: string;
  department_id: string;
  department_name: string;
  description: string;
  experience_min: string;
  experience_max: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  open_positions: string;
  posting_source: string;
  created_at: string;
  skills: { skill_name: string; required_level: string }[];
}

@Component({
  selector: 'app-candidate-job-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-job-search.component.html',
  styleUrls: ['./candidate-job-search.component.scss']
})
export class CandidateJobSearchComponent implements OnInit {
  allJobs: JobCard[] = [];
  filteredJobs: JobCard[] = [];
  departments: { department_id: string; department_name: string }[] = [];
  isLoading = true;

  // Filters
  searchQuery = '';
  departmentFilter = '';
  experienceFilter = '';

  constructor(private soap: SoapService, private router: Router) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  async loadJobs(): Promise<void> {
    this.isLoading = true;
    try {
      // Load departments map + skills map in parallel with jobs
      const [jobsRaw, deptsRaw, skillsRaw] = await Promise.all([
        this.soap.getJobRequisitions(),
        this.soap.getDepartments(),
        this.soap.getSkills()
      ]);

      const deptMap = new Map<string, string>();
      deptsRaw.forEach(d => {
        deptMap.set(d['department_id'] || '', d['department_name'] || '');
        this.departments.push({
          department_id: d['department_id'] || '',
          department_name: d['department_name'] || ''
        });
      });

      const skillMap = new Map<string, string>();
      skillsRaw.forEach(s => skillMap.set(s['skill_id'] || '', s['skill_name'] || ''));

      // Only show APPROVED jobs to candidates
      const approvedJobs = jobsRaw.filter(j => (j['status'] || '').toUpperCase() === 'APPROVED');

      // Enrich with department names and load skills for each
      this.allJobs = [];
      for (const j of approvedJobs) {
        const reqId = j['requisition_id'] || '';
        let skills: { skill_name: string; required_level: string }[] = [];
        try {
          const jobSkills = await this.soap.getJobSkillsByRequisition(reqId);
          skills = jobSkills.map(js => ({
            skill_name: skillMap.get(js['skill_id'] || '') || js['skill_id'] || '',
            required_level: js['required_level'] || ''
          }));
        } catch (e) { /* ignore skill fetch failure */ }

        this.allJobs.push({
          requisition_id: reqId,
          title: j['title'] || '',
          department_id: j['department_id'] || '',
          department_name: deptMap.get(j['department_id'] || '') || j['department_id'] || '',
          description: j['description'] || '',
          experience_min: j['experience_min'] || '',
          experience_max: j['experience_max'] || '',
          salary_min: j['salary_min'] || '',
          salary_max: j['salary_max'] || '',
          salary_currency: j['salary_currency'] || 'INR',
          open_positions: j['open_positions'] || '1',
          posting_source: j['posting_source'] || '',
          created_at: j['created_at'] || '',
          skills
        });
      }

      this.applyFilters();
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    let list = [...this.allJobs];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.department_name.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some(s => s.skill_name.toLowerCase().includes(q))
      );
    }

    if (this.departmentFilter) {
      list = list.filter(j => j.department_id === this.departmentFilter);
    }

    if (this.experienceFilter) {
      const maxExp = parseInt(this.experienceFilter, 10);
      list = list.filter(j => {
        const min = parseInt(j.experience_min, 10) || 0;
        return min <= maxExp;
      });
    }

    this.filteredJobs = list;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.departmentFilter = '';
    this.experienceFilter = '';
    this.applyFilters();
  }

  applyToJob(jobId: string): void {
    this.router.navigate(['/candidate/jobs', jobId, 'apply']);
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return diff + ' days ago';
    if (diff < 30) return Math.floor(diff / 7) + ' weeks ago';
    return Math.floor(diff / 30) + ' months ago';
  }

  formatSalary(min: string, max: string, currency: string): string {
    if (!min && !max) return 'Not disclosed';
    const fmt = (n: string) => {
      const num = parseInt(n, 10);
      if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
      return n;
    };
    return `${currency} ${fmt(min)} – ${fmt(max)}`;
  }
}
