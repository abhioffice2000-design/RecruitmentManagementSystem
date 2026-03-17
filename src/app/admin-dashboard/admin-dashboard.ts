import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard {
  
  metrics = [
    { title: 'Total Candidates', value: '1,245', trend: '+12%', isPositive: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { title: 'Active Jobs', value: '42', trend: '+4%', isPositive: true, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { title: 'Upcoming Interviews', value: '18', trend: '0%', isPositive: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { title: 'Offers Accepted', value: '8', trend: '-2%', isPositive: false, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  recentActivities = [
    { id: 1, candidate: 'Sarah Jenkins', role: 'Senior Frontend Dev', action: 'Applied', time: '2 mins ago', status: 'Pending' },
    { id: 2, candidate: 'Michael Chen', role: 'Backend Engineer', action: 'Interview Scheduled', time: '1 hour ago', status: 'In Progress' },
    { id: 3, candidate: 'Amanda Ross', role: 'Product Manager', action: 'Offer Sent', time: '3 hours ago', status: 'Wait for response' },
    { id: 4, candidate: 'David Smith', role: 'DevOps Engineer', action: 'Rejected', time: '5 hours ago', status: 'Closed' },
    { id: 5, candidate: 'Emily Davis', role: 'UI/UX Designer', action: 'Hired', time: '1 day ago', status: 'Completed' }
  ];

}
