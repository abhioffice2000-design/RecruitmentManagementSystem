import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <div class="header">
        <h2>Inbox - Applications</h2>
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
      
      <div class="inbox-container">
        <div class="inbox-header">
          <h3>Recent Applications</h3>
          <div class="controls">
            <input type="text" placeholder="Search applications..." class="search-input">
            <select class="filter-select">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Reviewed</option>
            </select>
          </div>
        </div>

        <div class="applications-list">
          <div class="application-item" *ngFor="let app of applications">
            <div class="candidate-info">
              <img [src]="app.avatar" alt="Candidate">
              <div class="details">
                <span class="name">{{ app.name }}</span>
                <span class="email">{{ app.email }}</span>
              </div>
            </div>
            
            <div class="job-info">
              <span class="label">Job Profile</span>
              <span class="value">{{ app.jobProfile }}</span>
            </div>
            
            <div class="date-info">
              <span class="label">Applied Date</span>
              <span class="value">{{ app.appliedDate }}</span>
            </div>
            
            <div class="status-info">
              <span class="status-badge" [ngClass]="app.status.toLowerCase()">
                {{ app.status }}
              </span>
            </div>
            
            <div class="actions">
              <button class="btn-view">View Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../hr-dashboard/hr-dashboard.scss'],
  styles: [`
    .inbox-container {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      
      .inbox-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f5f9;
        
        h3 {
          margin: 0;
          font-size: 20px;
          color: var(--text-dark);
          font-weight: 700;
        }
        
        .controls {
          display: flex;
          gap: 12px;
          
          input, select {
            padding: 8px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-dark);
            outline: none;
            
            &:focus {
              border-color: var(--accent-color);
            }
          }
          
          input { width: 250px; }
        }
      }

      .applications-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .application-item {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s ease;
          background: #fafbfc;
          
          &:hover {
            border-color: #bfdbfe;
            background: #fff;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.05);
          }

          .candidate-info {
            display: flex;
            align-items: center;
            gap: 16px;
            
            img {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .details {
              display: flex;
              flex-direction: column;
              gap: 4px;
              
              .name {
                font-weight: 600;
                color: var(--text-dark);
                font-size: 15px;
              }
              .email {
                font-size: 13px;
                color: var(--text-gray);
              }
            }
          }

          .job-info, .date-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .label {
              font-size: 12px;
              color: var(--text-gray);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              font-size: 14px;
              font-weight: 500;
              color: var(--text-dark);
            }
          }

          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            display: inline-block;
            
            &.pending { background: #fef3c7; color: #b45309; }
            &.reviewed { background: #e0e7ff; color: #4338ca; }
            &.interviewed { background: #dcfce7; color: #166534; }
          }
          
          .actions {
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
        }
      }
    }
  `]
})
export class InboxTab {
  applications = [
    {
      name: 'Michael Chen',
      email: 'm.chen@example.com',
      avatar: 'https://i.pravatar.cc/150?u=1',
      jobProfile: 'Senior Frontend Developer',
      appliedDate: 'Oct 24, 2023',
      status: 'Pending'
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      avatar: 'https://i.pravatar.cc/150?u=2',
      jobProfile: 'Product Designer',
      appliedDate: 'Oct 23, 2023',
      status: 'Reviewed'
    },
    {
      name: 'David Rodriguez',
      email: 'd.rodriguez@example.com',
      avatar: 'https://i.pravatar.cc/150?u=3',
      jobProfile: 'DevOps Engineer',
      appliedDate: 'Oct 21, 2023',
      status: 'Interviewed'
    },
    {
      name: 'Emily Watson',
      email: 'ewatson@example.com',
      avatar: 'https://i.pravatar.cc/150?u=4',
      jobProfile: 'Backend Developer (Java)',
      appliedDate: 'Oct 20, 2023',
      status: 'Pending'
    },
    {
      name: 'James Foster',
      email: 'jfoster.dev@example.com',
      avatar: 'https://i.pravatar.cc/150?u=5',
      jobProfile: 'Senior Frontend Developer',
      appliedDate: 'Oct 19, 2023',
      status: 'Reviewed'
    }
  ];
}
