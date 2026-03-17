import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-interviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-interviews.html',
  styleUrls: ['./manager-interviews.scss'],
})
export class ManagerInterviews {
  upcomingInterviews = [
    { candidate: 'Alex Johnson', role: 'Backend Engineer', time: '10:00 AM', duration: '60 min', interviewer: 'Michael Chen', status: 'Upcoming' },
    { candidate: 'Maria Garcia', role: 'Data Scientist', time: '02:30 PM', duration: '45 min', interviewer: 'Sarah Jenkins', status: 'Upcoming' },
    { candidate: 'James Smith', role: 'Product Manager', time: '11:00 AM (Tomorrow)', duration: '60 min', interviewer: 'Amanda Ross', status: 'Scheduled' }
  ];
}
