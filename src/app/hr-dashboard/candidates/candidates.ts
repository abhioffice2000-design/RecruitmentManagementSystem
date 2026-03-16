import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <div class="header">
        <h2>Candidates Overview</h2>
        <div class="user-info">
          <span class="icon">🔔</span>
          <div class="profile">
            <div class="text">
              <span class="name">Asley Green</span>
              <span class="role">Lead HR</span>
            </div>
            <img src="https://via.placeholder.com/40" alt="profile">
          </div>
        </div>
      </div>
      
      <div class="candidates-container">
        <div class="tabs-header">
          <button 
            [class.active]="activeTab === 'in-progress'" 
            (click)="activeTab = 'in-progress'">
            In-Progress
          </button>
          <button 
            [class.active]="activeTab === 'onboarded'" 
            (click)="activeTab = 'onboarded'">
            Onboarded
          </button>
        </div>

        <!-- In Progress Tab Content -->
        <div class="tab-content" *ngIf="activeTab === 'in-progress'">
          <div class="controls-bar">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search candidates..." class="search-input">
            </div>
            <select class="filter-select">
              <option>All Stages</option>
              <option>Screening</option>
              <option>Technical</option>
              <option>Final</option>
            </select>
          </div>

          <table class="candidates-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Job Applied</th>
                <th>Current Stage</th>
                <th>Applied Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let candidate of inProgressCandidates">
                <td>
                  <div class="candidate-info">
                    <img [src]="candidate.avatar" alt="Candidate">
                    <div class="details">
                      <span class="name">{{ candidate.name }}</span>
                      <span class="email">{{ candidate.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="job-role">{{ candidate.job }}</span>
                </td>
                <td>
                  <div class="stage-indicator">
                    <span class="stage-text">{{ candidate.stage }}</span>
                    <div class="progress-bar">
                      <div class="progress" [style.width]="candidate.progress + '%'" [ngClass]="candidate.processColor"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="date">{{ candidate.appliedDate }}</span>
                </td>
                <td>
                  <button class="btn-view">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Onboarded Tab Content -->
        <div class="tab-content" *ngIf="activeTab === 'onboarded'">
          <div class="controls-bar">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search onboarded candidates..." class="search-input">
            </div>
            <select class="filter-select">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>Marketing</option>
            </select>
          </div>

          <table class="candidates-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Job Title</th>
                <th>Department</th>
                <th>Onboarding Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let candidate of onboardedCandidates">
                <td>
                  <div class="candidate-info">
                    <img [src]="candidate.avatar" alt="Candidate">
                    <div class="details">
                      <span class="name">{{ candidate.name }}</span>
                      <span class="email">{{ candidate.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="job-role">{{ candidate.job }}</span>
                </td>
                <td>
                  <span class="department-tag">{{ candidate.department }}</span>
                </td>
                <td>
                  <span class="date">{{ candidate.onboardedDate }}</span>
                </td>
                <td>
                  <button class="btn-view">View Profile</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../hr-dashboard/hr-dashboard.scss'],
  styles: [`
    .candidates-container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      
      .tabs-header {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
        padding: 0 24px;
        
        button {
          background: none;
          border: none;
          padding: 20px 24px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-gray);
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          
          &:hover {
            color: var(--text-dark);
          }
          
          &.active {
            color: var(--accent-color);
            
            &::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 0;
              width: 100%;
              height: 3px;
              background: var(--accent-color);
              border-radius: 3px 3px 0 0;
            }
          }
        }
      }

      .tab-content {
        padding: 24px;
        
        &.empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          text-align: center;
          
          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          h3 { margin: 0 0 8px 0; font-size: 20px; color: var(--text-dark); }
          p { margin: 0; color: var(--text-gray); }
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          
          .search-wrap {
            position: relative;
            .search-icon {
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 14px;
              color: var(--text-gray);
            }
            .search-input {
              padding: 10px 16px 10px 36px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              font-size: 14px;
              width: 280px;
              outline: none;
              color: var(--text-dark);
              
              &:focus { border-color: var(--accent-color); }
            }
          }
          
          .filter-select {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-dark);
            outline: none;
            cursor: pointer;
          }
        }

        .candidates-table {
          width: 100%;
          border-collapse: collapse;
          
          th {
            text-align: left;
            padding: 16px;
            color: var(--text-gray);
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
            
            &:first-child { border-radius: 8px 0 0 8px; }
            &:last-child { border-radius: 0 8px 8px 0; text-align: right; }
          }
          
          td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            
            &:last-child { text-align: right; }
            
            .candidate-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
              }
              
              .details {
                display: flex;
                flex-direction: column;
                
                .name { font-weight: 600; color: var(--text-dark); font-size: 14px; }
                .email { font-size: 12px; color: var(--text-gray); }
              }
            }
            
            .job-role {
              font-weight: 500;
              color: var(--text-dark);
              font-size: 14px;
            }

            .department-tag {
              display: inline-block;
              padding: 4px 10px;
              background: #f1f5f9;
              color: var(--text-gray);
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }

            .stage-indicator {
              width: 160px;
              
              .stage-text {
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: var(--text-dark);
                margin-bottom: 6px;
              }
              
              .progress-bar {
                height: 6px;
                background: #e2e8f0;
                border-radius: 3px;
                overflow: hidden;
                
                .progress {
                  height: 100%;
                  border-radius: 3px;
                  
                  &.blue { background: #3b82f6; }
                  &.orange { background: #f59e0b; }
                  &.green { background: #22c55e; }
                  &.purple { background: #a855f7; }
                }
              }
            }
            
            .date {
              color: var(--text-gray);
              font-size: 14px;
              font-weight: 500;
            }
            
            .btn-view {
              padding: 8px 16px;
              border: 1px solid var(--accent-color);
              background: #fff;
              color: var(--accent-color);
              border-radius: 6px;
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s;
              
              &:hover {
                background: var(--accent-color);
                color: #fff;
              }
            }
          }
          
          tr:hover td {
            background: #f8fafc;
          }
        }
      }
    }
  `]
})
export class CandidatesTab {
  activeTab = 'in-progress';

  inProgressCandidates = [
    {
      name: 'Eleanor Pena',
      email: 'eleanor.p@example.com',
      avatar: 'https://i.pravatar.cc/150?u=11',
      job: 'Senior Frontend Developer',
      stage: 'Technical Interview',
      progress: 60,
      processColor: 'blue',
      appliedDate: 'Oct 23, 2023'
    },
    {
      name: 'Albert Flores',
      email: 'albert.fl@example.com',
      avatar: 'https://i.pravatar.cc/150?u=12',
      job: 'Product Designer',
      stage: 'Final HR Round',
      progress: 90,
      processColor: 'green',
      appliedDate: 'Oct 20, 2023'
    },
    {
      name: 'Dianne Russell',
      email: 'dianne.r@example.com',
      avatar: 'https://i.pravatar.cc/150?u=13',
      job: 'Marketing Manager',
      stage: 'Screening Call',
      progress: 20,
      processColor: 'orange',
      appliedDate: 'Oct 26, 2023'
    },
    {
      name: 'Ralph Edwards',
      email: 'redwards@example.com',
      avatar: 'https://i.pravatar.cc/150?u=14',
      job: 'Backend Developer (Java)',
      stage: 'Assignment Review',
      progress: 40,
      processColor: 'purple',
      appliedDate: 'Oct 21, 2023'
    },
    {
      name: 'Courtney Henry',
      email: 'chenry@example.com',
      avatar: 'https://i.pravatar.cc/150?u=15',
      job: 'Senior Frontend Developer',
      stage: 'Technical Interview',
      progress: 60,
      processColor: 'blue',
      appliedDate: 'Oct 25, 2023'
    }
  ];

  onboardedCandidates = [
    {
      name: 'Esther Howard',
      email: 'esther.h@example.com',
      avatar: 'https://i.pravatar.cc/150?u=21',
      job: 'UI/UX Designer',
      department: 'Design',
      onboardedDate: 'Oct 10, 2023'
    },
    {
      name: 'Cameron Williamson',
      email: 'c.williamson@example.com',
      avatar: 'https://i.pravatar.cc/150?u=22',
      job: 'DevOps Engineer',
      department: 'Engineering',
      onboardedDate: 'Oct 05, 2023'
    },
    {
      name: 'Brooklyn Simmons',
      email: 'brooklyn.s@example.com',
      avatar: 'https://i.pravatar.cc/150?u=23',
      job: 'Product Manager',
      department: 'Product',
      onboardedDate: 'Sep 28, 2023'
    }
  ];
}
