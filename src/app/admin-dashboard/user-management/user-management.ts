import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
})
export class UserManagement {
  activeTab = 'managers';
  showAddModal = false;
  modalType = '';
  showToast = false;
  toastMessage = '';

  newEntry: any = {};

  managers = [
    { id: 'MGR-101', name: 'Robert Johnson', email: 'robert.j@example.com', department: 'Engineering', teamSize: 12, status: 'Active' },
    { id: 'MGR-102', name: 'Michael Chen', email: 'michael.c@example.com', department: 'Product', teamSize: 8, status: 'Active' },
    { id: 'MGR-103', name: 'Laura Williams', email: 'l.williams@example.com', department: 'Marketing', teamSize: 6, status: 'Active' },
    { id: 'MGR-104', name: 'Daniel Brown', email: 'd.brown@example.com', department: 'Sales', teamSize: 15, status: 'Inactive' }
  ];

  hrMembers = [
    { id: 'HR-201', name: 'Alice Smith', email: 'alice.smith@example.com', specialization: 'Recruitment', status: 'Active' },
    { id: 'HR-202', name: 'Sarah Connor', email: 's.connor@example.com', specialization: 'Onboarding', status: 'Active' },
    { id: 'HR-203', name: 'Jessica Taylor', email: 'j.taylor@example.com', specialization: 'Employee Relations', status: 'Active' }
  ];

  departments = [
    { id: 'DEPT-01', name: 'Engineering', head: 'Robert Johnson', employees: 45, budget: '$2.4M', status: 'Active' },
    { id: 'DEPT-02', name: 'Product', head: 'Michael Chen', employees: 18, budget: '$1.2M', status: 'Active' },
    { id: 'DEPT-03', name: 'Design', head: 'Emily Davis', employees: 10, budget: '$800K', status: 'Active' },
    { id: 'DEPT-04', name: 'Marketing', head: 'Laura Williams', employees: 14, budget: '$1.1M', status: 'Active' },
    { id: 'DEPT-05', name: 'Human Resources', head: 'Alice Smith', employees: 8, budget: '$600K', status: 'Active' },
    { id: 'DEPT-06', name: 'Sales', head: 'Daniel Brown', employees: 22, budget: '$1.8M', status: 'Inactive' }
  ];

  interviewers = [
    { id: 'INT-301', name: 'Alex Johnson', email: 'a.johnson@example.com', expertise: 'System Design', interviewsConducted: 58, rating: 4.8, status: 'Active' },
    { id: 'INT-302', name: 'Emily Davis', email: 'emily.d@example.com', expertise: 'Frontend', interviewsConducted: 34, rating: 4.6, status: 'Active' },
    { id: 'INT-303', name: 'Mark Twain', email: 'm.twain@example.com', expertise: 'Cultural Fit', interviewsConducted: 22, rating: 4.9, status: 'Active' },
    { id: 'INT-304', name: 'Sarah Jenkins', email: 's.jenkins@example.com', expertise: 'Backend', interviewsConducted: 41, rating: 4.7, status: 'Inactive' }
  ];

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  openAddModal(type: string) {
    this.modalType = type;
    this.showAddModal = true;
    this.newEntry = {};
  }

  closeModal() {
    this.showAddModal = false;
    this.newEntry = {};
  }

  saveEntry() {
    if (!this.newEntry.name || !this.newEntry.email) return;

    if (this.modalType === 'manager') {
      this.managers.unshift({
        id: 'MGR-' + Math.floor(Math.random() * 900 + 100),
        name: this.newEntry.name,
        email: this.newEntry.email,
        department: this.newEntry.department || 'General',
        teamSize: 0,
        status: 'Active'
      });
    } else if (this.modalType === 'hr') {
      this.hrMembers.unshift({
        id: 'HR-' + Math.floor(Math.random() * 900 + 200),
        name: this.newEntry.name,
        email: this.newEntry.email,
        specialization: this.newEntry.specialization || 'General',
        status: 'Active'
      });
    } else if (this.modalType === 'department') {
      this.departments.unshift({
        id: 'DEPT-' + String(this.departments.length + 1).padStart(2, '0'),
        name: this.newEntry.name,
        head: this.newEntry.head || 'TBD',
        employees: 0,
        budget: this.newEntry.budget || '$0',
        status: 'Active'
      });
    } else if (this.modalType === 'interviewer') {
      this.interviewers.unshift({
        id: 'INT-' + Math.floor(Math.random() * 900 + 300),
        name: this.newEntry.name,
        email: this.newEntry.email,
        expertise: this.newEntry.expertise || 'General',
        interviewsConducted: 0,
        rating: 0,
        status: 'Active'
      });
    }
    this.closeModal();
  }

  toggleStatus(item: any) {
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
  }

  deleteItem(list: any[], item: any) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      const idx = list.indexOf(item);
      if (idx > -1) list.splice(idx, 1);
    }
  }

  resetPassword(user: any) {
    this.toastMessage = `Password reset link sent to ${user.email}`;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  resetAllPasswords() {
    if (confirm('Are you sure you want to reset passwords for ALL users in this category?')) {
      this.toastMessage = `Bulk password reset initiated for all ${this.activeTab}`;
      this.showToast = true;
      setTimeout(() => this.showToast = false, 3000);
    }
  }

  get tabCounts() {
    return {
      managers: this.managers.length,
      hr: this.hrMembers.length,
      departments: this.departments.length,
      interviewers: this.interviewers.length
    };
  }
}
