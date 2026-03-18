import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoapService } from '../../services/soap.service';

export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  INTERVIEWER = 'INTERVIEWER',
  LEADERSHIP = 'LEADERSHIP',
  MANAGER = 'MANAGER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
})
export class UserManagement implements OnInit {
  activeTab = 'managers';
  showAddModal = false;
  modalType = '';
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  isSaving = false;

  newEntry: any = {};
  dbDepartments: Record<string, string>[] = [];

  managers: any[] = [];
  hrMembers: any[] = [];
  interviewers: any[] = [];
  departments: any[] = [];

  constructor(private soapService: SoapService) { }

  ngOnInit() {
    this.fetchInitialData();
  }

  private fetchInitialData() {
    // Fetch departments and then fetch based on active tab
    this.soapService.getAllDepartments().then(depts => {
      this.dbDepartments = depts;
      this.departments = depts.map(d => ({
        id: d['department_id'],
        name: d['department_name'],
        head: 'TBD',
        employees: 0,
        budget: '$0',
        status: 'Active'
      }));
      this.refreshActiveTab();
    }).catch(err => {
      console.error('Failed to fetch initial departments:', err);
      this.refreshActiveTab();
    });
  }

  fetchManagers() {
    this.soapService.getAllManagers().then(data => {
      this.managers = data.map(m => {
        const deptId = m['department_id'] || m['Department_id'];
        const deptObj = this.dbDepartments.find((d: any) => d['department_id'] === deptId);
        return {
          id: m['user_id'] || m['User_id'] || ('MGR-' + Math.floor(Math.random() * 900 + 100)),
          name: (m['first_name'] || m['First_name'] || '') + ' ' + (m['last_name'] || m['Last_name'] || ''),
          email: m['email'] || m['Email'] || '',
          department: deptObj ? deptObj['department_name'] : (m['department_id'] || m['Department_id'] || 'N/A'),
          teamSize: 0,
          status: m['status'] || m['Status'] || UserStatus.ACTIVE
        };
      });
    }).catch(err => {
      console.error('Failed to fetch managers:', err);
    });
  }

  fetchHRMembers() {
    this.soapService.getAllHR().then(data => {
      this.hrMembers = data.map(m => ({
        id: m['user_id'] || m['User_id'] || ('HR-' + Math.floor(Math.random() * 900 + 100)),
        name: (m['first_name'] || m['First_name'] || '') + ' ' + (m['last_name'] || m['Last_name'] || ''),
        email: m['email'] || m['Email'] || '',
        specialization: m['temp1'] || 'General',
        status: m['status'] || m['Status'] || UserStatus.ACTIVE
      }));
    }).catch(err => {
      console.error('Failed to fetch HR members:', err);
    });
  }

  fetchInterviewers() {
    this.soapService.getAllInterviewers().then(data => {
      this.interviewers = data.map(m => ({
        id: m['user_id'] || m['User_id'] || ('INT-' + Math.floor(Math.random() * 900 + 100)),
        name: (m['first_name'] || m['First_name'] || '') + ' ' + (m['last_name'] || m['Last_name'] || ''),
        email: m['email'] || m['Email'] || '',
        expertise: m['temp1'] || 'General',
        interviewsConducted: m['temp2'] || 0,
        rating: m['temp3'] || 0,
        status: m['status'] || m['Status'] || UserStatus.ACTIVE
      }));
    }).catch(err => {
      console.error('Failed to fetch interviewers:', err);
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.refreshActiveTab();
  }

  private refreshActiveTab() {
    switch (this.activeTab) {
      case 'managers': this.fetchManagers(); break;
      case 'hr': this.fetchHRMembers(); break;
      case 'interviewers': this.fetchInterviewers(); break;
    }
  }

  openAddModal(type: string) {
    this.modalType = type;
    this.showAddModal = true;
    this.newEntry = {};

    // Fetch departments from DB when opening manager modal
    if (type === 'manager') {
      this.soapService.getAllDepartments().then(depts => {
        this.dbDepartments = depts;
      }).catch(err => {
        console.error('Failed to fetch departments:', err);
        this.dbDepartments = [];
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.newEntry = {};
  }

  private showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  saveEntry() {
    // Department save uses Cordys SOAP – handled separately
    if (this.modalType === 'department') {
      this.saveDepartment();
      return;
    }

    // Manager save uses Cordys SOAP – handled separately
    if (this.modalType === 'manager') {
      this.saveManager();
      return;
    }

    if (!this.newEntry.name || !this.newEntry.email) return;

    if (this.modalType === 'hr') {
      this.saveHRMember();
      return;
    }

    if (this.modalType === 'interviewer') {
      this.saveInterviewer();
      return;
    }

    this.closeModal();
  }

  /** Save a new manager via Cordys SOAP: 1) Create user in Cordys Organization  2) Insert user in DB */
  private async saveManager() {
    if (!this.newEntry.firstName || !this.newEntry.lastName || !this.newEntry.email || !this.newEntry.password) {
      this.showToastMessage('Please fill all required fields.', 'error');
      return;
    }

    if (this.newEntry.password !== this.newEntry.confirmPassword) {
      this.showToastMessage('Passwords do not match.', 'error');
      return;
    }

    if (!this.newEntry.department || this.newEntry.department === '') {
      this.showToastMessage('Please select a department.', 'error');
      return;
    }

    this.isSaving = true;

    // Capture values before closeModal() clears newEntry
    const firstName = this.newEntry.firstName;
    const lastName = this.newEntry.lastName;
    const email = this.newEntry.email;
    const password = this.newEntry.password;
    const departmentId = this.newEntry.department;

    // Construct Cordys Username from email (part before @)
    const emailPrefix = email.split('@')[0];
    const cordysUsername = emailPrefix; // For CreateUserInOrganization, we use simple username, not full DN

    try {
      // Step 1: Create user in Cordys Organization and assign Manager_RMST1 role
      await this.soapService.createUserInOrganization({
        userName: cordysUsername,
        description: `${firstName} ${lastName}`,
        password: password,
        role: 'Manager_RMST1'
      });

      // Step 2: Insert user into ts_users table (only if Step 1 succeeds)
      await this.soapService.insertUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: password,
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        department_id: departmentId,
        created_by: 'admin'
      });

      // Find department name for local list
      const deptObj = this.dbDepartments.find(d => d['department_id'] === departmentId);
      const departmentName = deptObj ? deptObj['department_name'] : 'Unknown';

      // Update local UI list
      this.managers.unshift({
        id: 'MGR-' + Math.floor(Math.random() * 900 + 100),
        name: firstName + ' ' + lastName,
        email: email,
        department: departmentName,
        teamSize: 0,
        status: 'Active'
      });

      this.closeModal();
      this.showToastMessage(`Manager "${firstName} ${lastName}" registered successfully!`);

    } catch (err: any) {
      console.error('Failed to register manager:', err);
      this.showToastMessage('Failed to register manager in Cordys or Database. Please try again.', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  /** Save a new HR member via Cordys SOAP */
  private async saveHRMember() {
    if (!this.newEntry.firstName || !this.newEntry.lastName || !this.newEntry.email || !this.newEntry.password) {
      this.showToastMessage('Please fill all required fields.', 'error');
      return;
    }

    if (this.newEntry.password !== this.newEntry.confirmPassword) {
      this.showToastMessage('Passwords do not match.', 'error');
      return;
    }

    this.isSaving = true;

    const firstName = this.newEntry.firstName;
    const lastName = this.newEntry.lastName;
    const email = this.newEntry.email;
    const password = this.newEntry.password;
    const specialization = this.newEntry.specialization || 'General';

    const cordysUsername = email.split('@')[0];

    try {
      await this.soapService.createUserInOrganization({
        userName: cordysUsername,
        description: `${firstName} ${lastName}`,
        password: password,
        role: 'HR_RMST1'
      });

      await this.soapService.insertUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: password,
        role: UserRole.HR,
        status: UserStatus.ACTIVE,
        department_id: '', // HR might not have a department in the same way
        created_by: 'admin',
        temp1: specialization
      });

      this.fetchHRMembers(); // Refresh list from DB
      this.closeModal();
      this.showToastMessage(`HR Member "${firstName} ${lastName}" registered successfully!`);

    } catch (err: any) {
      console.error('Failed to register HR member:', err);
      this.showToastMessage('Failed to register HR member in Cordys or Database.', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  /** Save a new Interviewer via Cordys SOAP */
  private async saveInterviewer() {
    if (!this.newEntry.firstName || !this.newEntry.lastName || !this.newEntry.email || !this.newEntry.password) {
      this.showToastMessage('Please fill all required fields.', 'error');
      return;
    }

    if (this.newEntry.password !== this.newEntry.confirmPassword) {
      this.showToastMessage('Passwords do not match.', 'error');
      return;
    }

    this.isSaving = true;

    const firstName = this.newEntry.firstName;
    const lastName = this.newEntry.lastName;
    const email = this.newEntry.email;
    const password = this.newEntry.password;
    const expertise = this.newEntry.expertise || 'General';

    const cordysUsername = email.split('@')[0];

    try {
      await this.soapService.createUserInOrganization({
        userName: cordysUsername,
        description: `${firstName} ${lastName}`,
        password: password,
        role: 'Interviewer_RMST1'
      });

      await this.soapService.insertUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: password,
        role: UserRole.INTERVIEWER,
        status: UserStatus.ACTIVE,
        department_id: '',
        created_by: 'admin',
        temp1: expertise,
        temp2: '0', // interviewsConducted
        temp3: '0'  // rating
      });

      this.fetchInterviewers(); // Refresh list from DB
      this.closeModal();
      this.showToastMessage(`Interviewer "${firstName} ${lastName}" registered successfully!`);

    } catch (err: any) {
      console.error('Failed to register interviewer:', err);
      this.showToastMessage('Failed to register interviewer in Cordys or Database.', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  /** Save a new department via Cordys SOAP request (UpdateMt_departments) */
  private saveDepartment() {
    if (!this.newEntry.name) return;

    this.isSaving = true;

    // Capture values before closeModal() clears newEntry
    const deptName = this.newEntry.name;
    const deptHead = this.newEntry.head || 'TBD';
    const deptBudget = this.newEntry.budget || '$0';

    this.soapService.insertDepartment({
      department_name: deptName,
      created_by: 'admin'   // Replace with actual logged-in user when available
    })
      .then(() => {
        // Add to local UI list so the table updates immediately
        this.departments.unshift({
          id: 'DEPT-' + String(this.departments.length + 1).padStart(2, '0'),
          name: deptName,
          head: deptHead,
          employees: 0,
          budget: deptBudget,
          status: UserStatus.ACTIVE
        });
        this.closeModal();
        this.showToastMessage(`Department "${deptName}" added successfully!`);
      })
      .catch((err: any) => {
        console.error('Failed to save department:', err);
        this.showToastMessage('Failed to save department. Please try again.', 'error');
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  toggleStatus(item: any) {
    const newStatus = item.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    this.soapService.updateUserStatus(item, newStatus)
      .then(() => {
        item.status = newStatus;
        this.showToastMessage(`Status updated to ${newStatus} for ${item.name}`);
      })
      .catch(err => {
        console.error('Failed to update status:', err);
        this.showToastMessage('Failed to update status in database.', 'error');
      });
  }

  deleteItem(list: any[], item: any) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.soapService.deleteUser(item)
        .then(() => {
          const idx = list.indexOf(item);
          if (idx > -1) list.splice(idx, 1);
          this.showToastMessage(`User ${item.name} deleted successfully.`);
        })
        .catch(err => {
          console.error('Failed to delete user:', err);
          this.showToastMessage('Failed to delete user from database.', 'error');
        });
    }
  }

  resetPassword(user: any) {
    this.showToastMessage(`Password reset link sent to ${user.email}`);
  }

  resetAllPasswords() {
    if (confirm('Are you sure you want to reset passwords for ALL users in this category?')) {
      this.showToastMessage(`Bulk password reset initiated for all ${this.activeTab}`);
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
