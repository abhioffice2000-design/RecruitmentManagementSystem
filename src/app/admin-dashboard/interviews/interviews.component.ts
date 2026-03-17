import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss']
})
export class InterviewsComponent {
  today = 'October 25, 2026';
  
  schedules = [
    { time: '09:00 AM', type: 'Technical Interview', candidate: 'Michael Chen', role: 'Backend Engineer', interviewer: 'Alex Johnson', duration: '60 min', status: 'Completed' },
    { time: '11:00 AM', type: 'HR Screening', candidate: 'Sarah Jenkins', role: 'Senior Frontend Dev', interviewer: 'Emily Davis', duration: '30 min', status: 'In Progress' },
    { time: '01:30 PM', type: 'System Design', candidate: 'Amanda Ross', role: 'Product Manager', interviewer: 'Sarah Connor', duration: '90 min', status: 'Upcoming' },
    { time: '03:00 PM', type: 'Cultural Fit', candidate: 'David Smith', role: 'DevOps Engineer', interviewer: 'Mark Twain', duration: '45 min', status: 'Upcoming' },
    { time: '04:30 PM', type: 'Technical Interview', candidate: 'James Wilson', role: 'Full Stack Developer', interviewer: 'Alex Johnson', duration: '60 min', status: 'Upcoming' }
  ];
}
