import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent {
  selectedCandidate: any = null;

  candidates = [
    { id: 'CND-8901', name: 'Sarah Jenkins', role: 'Senior Frontend Dev', experience: '5 years', appliedDate: 'Oct 24, 2026', status: 'In Review', email: 's.jenkins@email.com', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', education: 'B.S. Computer Science, Stanford University', skills: ['Angular', 'React', 'TypeScript', 'Node.js', 'GraphQL'] },
    { id: 'CND-8902', name: 'Michael Chen', role: 'Backend Engineer', experience: '8 years', appliedDate: 'Oct 23, 2026', status: 'Interviewing', email: 'm.chen@email.com', phone: '+1 (555) 345-6789', location: 'New York, NY', education: 'M.S. Software Engineering, MIT', skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'PostgreSQL'] },
    { id: 'CND-8903', name: 'Amanda Ross', role: 'Product Manager', experience: '4 years', appliedDate: 'Oct 21, 2026', status: 'Offer Sent', email: 'a.ross@email.com', phone: '+1 (555) 456-7890', location: 'Austin, TX', education: 'MBA, Wharton School', skills: ['Agile', 'Jira', 'Roadmapping', 'Stakeholder Mgmt', 'Analytics'] },
    { id: 'CND-8904', name: 'David Smith', role: 'DevOps Engineer', experience: '6 years', appliedDate: 'Oct 20, 2026', status: 'Rejected', email: 'd.smith@email.com', phone: '+1 (555) 567-8901', location: 'Remote', education: 'B.S. Information Technology, Georgia Tech', skills: ['Docker', 'Terraform', 'CI/CD', 'Linux', 'Azure'] },
    { id: 'CND-8905', name: 'Emily Davis', role: 'UI/UX Designer', experience: '3 years', appliedDate: 'Oct 19, 2026', status: 'Hired', email: 'e.davis@email.com', phone: '+1 (555) 678-9012', location: 'London, UK', education: 'B.F.A. Interaction Design, RISD', skills: ['Figma', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'] },
    { id: 'CND-8906', name: 'James Wilson', role: 'Full Stack Developer', experience: '2 years', appliedDate: 'Oct 18, 2026', status: 'New Applied', email: 'j.wilson@email.com', phone: '+1 (555) 789-0123', location: 'Chicago, IL', education: 'B.S. Computer Science, UIUC', skills: ['Vue.js', 'Python', 'Django', 'MongoDB', 'REST APIs'] }
  ];

  viewDetails(candidate: any) {
    this.selectedCandidate = candidate;
  }

  closeDetails() {
    this.selectedCandidate = null;
  }
}
