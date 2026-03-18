import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SoapService } from '../../../services/soap.service';

@Component({
  selector: 'app-candidate-apply-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-apply-job.component.html',
  styleUrls: ['./candidate-apply-job.component.scss']
})
export class CandidateApplyJobComponent implements OnInit {
  requisitionId = '';
  jobTitle = '';
  jobDepartment = '';
  jobDescription = '';
  jobSkills: { skill_id: string; skill_name: string; required_level: string }[] = [];
  isLoading = true;
  isSubmitting = false;
  submitted = false;

  // ─── Form Fields ──────────────────────────────
  form = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    experience_years: '',
    location: '',
    cover_letter: '',
    expected_salary: '',
    notice_period: '',
    source: 'Career Portal'
  };

  // ─── Skills Selection ─────────────────────────
  allSkills: { skill_id: string; skill_name: string }[] = [];
  selectedSkills: { skill_id: string; skill_name: string; experience_years: string }[] = [];
  skillToAdd = '';
  skillExpToAdd = '1';

  // ─── Resume Drag & Drop ───────────────────────
  resumeFile: File | null = null;
  resumeFileName = '';
  isDragOver = false;

  // ─── Pipeline Stages ──────────────────────────
  firstStageId = '';

  // ─── Errors ───────────────────────────────────
  errors: Record<string, string> = {};

  // ─── Toast ────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToastFlag = false;
  private toastTimeout: any;

  getRequiredSkillsText(): string {
    return this.jobSkills.map(s => s.skill_name).join(', ');
  }

  constructor(
    private soap: SoapService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.requisitionId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.requisitionId) {
      this.router.navigate(['/candidate/jobs']);
      return;
    }
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load job details
      const job = await this.soap.getJobRequisitionById(this.requisitionId);
      if (!job) {
        this.showToast('Job not found.', 'error');
        this.router.navigate(['/candidate/jobs']);
        return;
      }
      this.jobTitle = job['title'] || '';
      this.jobDescription = job['description'] || '';

      // Load department name
      const depts = await this.soap.getDepartments();
      const dept = depts.find(d => d['department_id'] === job['department_id']);
      this.jobDepartment = dept ? (dept['department_name'] || '') : (job['department_id'] || '');

      // Load all skills
      const skills = await this.soap.getSkills();
      this.allSkills = skills.map(s => ({
        skill_id: s['skill_id'] || '',
        skill_name: s['skill_name'] || ''
      }));

      // Load job-required skills
      const jobSkills = await this.soap.getJobSkillsByRequisition(this.requisitionId);
      const skillMap = new Map(this.allSkills.map(s => [s.skill_id, s.skill_name]));
      this.jobSkills = jobSkills.map(js => ({
        skill_id: js['skill_id'] || '',
        skill_name: skillMap.get(js['skill_id'] || '') || js['skill_id'] || '',
        required_level: js['required_level'] || ''
      }));

      // Load pipeline stages → get first stage
      const stages = await this.soap.getPipelineStages();
      if (stages.length > 0) {
        stages.sort((a, b) => parseInt(a['stage_order'] || '0') - parseInt(b['stage_order'] || '0'));
        this.firstStageId = stages[0]['stage_id'] || '';
      }

      // Pre-fill email from session if candidate is logged in
      const loggedInEmail = sessionStorage.getItem('loggedInUser') || '';
      if (loggedInEmail) {
        this.form.email = loggedInEmail;
      }

    } catch (err) {
      console.error('Failed to load data:', err);
      this.showToast('Failed to load job details.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ═══════════════════════════════════════════════════
  //  RESUME DRAG & DROP
  // ═══════════════════════════════════════════════════

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      this.showToast('Please upload a PDF or DOC file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File size must be under 5MB.', 'error');
      return;
    }
    this.resumeFile = file;
    this.resumeFileName = file.name;
    // Resume parsing placeholder — will be done in a later phase
  }

  removeResume(): void {
    this.resumeFile = null;
    this.resumeFileName = '';
  }

  // ═══════════════════════════════════════════════════
  //  SKILLS MANAGEMENT
  // ═══════════════════════════════════════════════════

  get availableSkills() {
    const usedIds = new Set(this.selectedSkills.map(s => s.skill_id));
    return this.allSkills.filter(s => !usedIds.has(s.skill_id));
  }

  addSkill(): void {
    if (!this.skillToAdd) return;
    const skill = this.allSkills.find(s => s.skill_id === this.skillToAdd);
    if (skill) {
      this.selectedSkills.push({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        experience_years: this.skillExpToAdd
      });
      this.skillToAdd = '';
      this.skillExpToAdd = '1';
    }
  }

  removeSkill(idx: number): void {
    this.selectedSkills.splice(idx, 1);
  }

  // ═══════════════════════════════════════════════════
  //  FORM VALIDATION
  // ═══════════════════════════════════════════════════

  validate(): boolean {
    this.errors = {};
    if (!this.form.first_name.trim()) this.errors['first_name'] = 'First name is required.';
    if (!this.form.last_name.trim()) this.errors['last_name'] = 'Last name is required.';
    if (!this.form.email.trim()) {
      this.errors['email'] = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.errors['email'] = 'Invalid email format.';
    }
    if (!this.form.phone.trim()) {
      this.errors['phone'] = 'Phone number is required.';
    } else if (!/^\+?[\d\-\s]{10,15}$/.test(this.form.phone)) {
      this.errors['phone'] = 'Invalid phone number.';
    }
    if (!this.form.experience_years) {
      this.errors['experience_years'] = 'Experience is required.';
    }
    if (!this.form.location.trim()) {
      this.errors['location'] = 'Location is required.';
    }
    return Object.keys(this.errors).length === 0;
  }

  // ═══════════════════════════════════════════════════
  //  SUBMIT APPLICATION
  // ═══════════════════════════════════════════════════

  async submitApplication(): Promise<void> {
    if (!this.validate()) {
      this.showToast('Please fix the errors in the form.', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      // Step 1: Insert candidate record
      const candidateResponse = await this.soap.insertCandidate({
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        linkedin_url: this.form.linkedin_url.trim(),
        experience_years: this.form.experience_years,
        location: this.form.location.trim()
      });

      // Extract candidate_id from response
      let candidateId = '';
      try {
        candidateId = candidateResponse.getElementsByTagName('candidate_id')[0]?.textContent || '';
      } catch (e) {
        // If extraction fails, try to find candidate by email
        const found = await this.soap.getCandidateByEmail(this.form.email.trim());
        if (found.length > 0) {
          candidateId = found[0]['candidate_id'] || '';
        }
      }

      if (!candidateId) {
        throw new Error('Failed to create candidate record.');
      }

      // Step 2: Insert candidate skills
      for (const skill of this.selectedSkills) {
        await this.soap.insertCandidateSkill(candidateId, skill.skill_id, skill.experience_years);
      }

      // Step 3: Insert application
      await this.soap.insertApplication({
        candidate_id: candidateId,
        requisition_id: this.requisitionId,
        source: this.form.source,
        current_stage_id: this.firstStageId,
        notes: this.form.cover_letter.trim()
      });

      this.submitted = true;
      this.showToast('Application submitted successfully!', 'success');

    } catch (err: any) {
      console.error('Application failed:', err);
      const errMsg = err?.responseText || err?.message || 'Unknown error';
      if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
        this.showToast('A candidate with this email or phone already exists. Your application may be linked to the existing record.', 'error');
      } else {
        this.showToast('Failed to submit application. ' + errMsg, 'error');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/candidate/jobs']);
  }

  // ═══════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastFlag = false, 4000);
  }
}
