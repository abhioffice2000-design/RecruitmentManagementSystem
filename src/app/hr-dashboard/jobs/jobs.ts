import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <div class="header">
        <h2>Job Postings</h2>
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
      
      <div class="jobs-container" *ngIf="!showForm">
        <div class="jobs-header">
          <h3>Active & Past Postings</h3>
          <div class="controls">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search jobs..." class="search-input">
            </div>
            <button class="btn-primary" (click)="toggleForm()">
              <span class="plus-icon">+</span>
              Add New Job
            </button>
          </div>
        </div>

        <div class="jobs-grid">
          <div class="job-card" *ngFor="let job of jobs">
            <div class="card-header">
              <div class="title-section">
                <h4>{{ job.title }}</h4>
                <span class="department-tag">{{ job.department }}</span>
              </div>
              <button class="menu-dots">⋮</button>
            </div>
            
            <div class="job-stats">
              <div class="stat">
                <span class="value">{{ job.applicants }}</span>
                <span class="label">Total Applicants</span>
              </div>
              <div class="stat divider"></div>
              <div class="stat">
                <span class="value">{{ job.newApplicants }}</span>
                <span class="label">New in 24h</span>
              </div>
            </div>
            
            <div class="job-details">
              <div class="detail-row">
                <span class="icon">📍</span>
                <span>{{ job.location }} ({{ job.type }})</span>
              </div>
              <div class="detail-row">
                <span class="icon">🕒</span>
                <span>Posted: {{ job.postedDate }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="status-badge" [ngClass]="job.status.toLowerCase()">
                <span class="dot"></span> {{ job.status }}
              </span>
              <button class="btn-outline">View Details</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add New Job Form -->
      <div class="job-form-container" *ngIf="showForm">
        <div class="form-header">
          <button class="btn-back" (click)="toggleForm()">← Back to Jobs</button>
          <h3>Create New Job Posting</h3>
        </div>
        
        <form class="job-form">
          <div class="form-group">
            <label>Job Title</label>
            <input type="text" placeholder="e.g. Senior Frontend Developer" class="form-input">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Department</label>
              <select class="form-input">
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>
            <div class="form-group">
              <label>Employment Type</label>
              <select class="form-input">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Location</label>
              <input type="text" placeholder="e.g. San Francisco, CA" class="form-input">
            </div>
            <div class="form-group">
              <label>Work Model</label>
              <select class="form-input">
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Job Description</label>
            <textarea placeholder="Enter detailed job description and requirements..." class="form-input" rows="6"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-outline" (click)="toggleForm()">Cancel</button>
            <button type="button" class="btn-primary" (click)="toggleForm()">Post Job</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../../hr-dashboard/hr-dashboard.scss'],
  styles: [`
    .jobs-container {
      background: transparent;
      
      .jobs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        background: #fff;
        padding: 20px 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #e2e8f0;
        
        h3 {
          margin: 0;
          font-size: 20px;
          color: var(--text-dark);
          font-weight: 700;
        }
        
        .controls {
          display: flex;
          gap: 16px;
          align-items: center;
          
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
              width: 250px;
              outline: none;
              color: var(--text-dark);
              transition: border-color 0.2s;
              
              &:focus {
                border-color: var(--accent-color);
              }
            }
          }
          
          .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent-color);
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            
            .plus-icon {
              font-size: 18px;
              font-weight: 400;
            }
            
            &:hover {
              background: var(--accent-hover);
            }
          }
        }
      }

      .jobs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 24px;

        .job-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            
            .title-section {
              h4 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-dark);
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
            }
            
            .menu-dots {
              background: none;
              border: none;
              font-size: 20px;
              color: var(--text-gray);
              cursor: pointer;
              padding: 0 4px;
              line-height: 1;
              &:hover { color: var(--text-dark); }
            }
          }

          .job-stats {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            
            .stat {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              
              .value {
                font-size: 20px;
                font-weight: 800;
                color: var(--text-dark);
              }
              .label {
                font-size: 12px;
                color: var(--text-gray);
                font-weight: 500;
              }
            }
            
            .divider {
              flex: 0;
              width: 1px;
              height: 32px;
              background: #e2e8f0;
            }
          }

          .job-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
            
            .detail-row {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: var(--text-gray);
              
              .icon {
                font-size: 16px;
              }
            }
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
            
            .status-badge {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              font-weight: 600;
              
              .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
              }

              &.active { 
                color: #166534;
                .dot { background: #22c55e; }
              }
              &.closed { 
                color: #991b1b;
                .dot { background: #ef4444; }
              }
              &.draft { 
                color: #854d0e;
                .dot { background: #eab308; }
              }
            }
            
            .btn-outline {
              background: transparent;
              border: 1px solid #e2e8f0;
              padding: 8px 16px;
              border-radius: 6px;
              color: var(--text-dark);
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s;
              
              &:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
              }
            }
          }
        }
      }
    }

    .job-form-container {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
      
      .form-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 32px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 24px;
        
        .btn-back {
          background: none;
          border: none;
          color: var(--text-gray);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 16px;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          
          &:hover { color: var(--accent-color); }
        }
        
        h3 {
          margin: 0;
          font-size: 24px;
          color: var(--text-dark);
          font-weight: 800;
        }
      }
      
      .job-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
          }
          
          .form-input {
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-dark);
            outline: none;
            font-family: inherit;
            transition: all 0.2s;
            
            &:focus {
              border-color: var(--accent-color);
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
          }
          
          textarea {
            resize: vertical;
            min-height: 120px;
          }
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 16px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          
          .btn-outline {
            background: #fff;
            border: 1px solid #e2e8f0;
            color: var(--text-dark);
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover { background: #f8fafc; }
          }
          
          .btn-primary {
            background: var(--accent-color);
            border: none;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            
            &:hover { background: var(--accent-hover); }
          }
        }
      }
    }
  `]
})
export class JobsTab {
  showForm = false;

  toggleForm() {
    this.showForm = !this.showForm;
  }

  jobs = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      applicants: 142,
      newApplicants: 12,
      location: 'San Francisco, CA',
      type: 'Hybrid',
      postedDate: 'Oct 15, 2023',
      status: 'Active'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      applicants: 89,
      newApplicants: 5,
      location: 'New York, NY',
      type: 'Remote',
      postedDate: 'Oct 18, 2023',
      status: 'Active'
    },
    {
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      applicants: 45,
      newApplicants: 2,
      location: 'Austin, TX',
      type: 'Onsite',
      postedDate: 'Oct 20, 2023',
      status: 'Active'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      applicants: 210,
      newApplicants: 0,
      location: 'Chicago, IL',
      type: 'Hybrid',
      postedDate: 'Sep 30, 2023',
      status: 'Closed'
    },
    {
      title: 'Backend Developer (Java)',
      department: 'Engineering',
      applicants: 0,
      newApplicants: 0,
      location: 'Seattle, WA',
      type: 'Remote',
      postedDate: 'Not Posted',
      status: 'Draft'
    }
  ];
}
