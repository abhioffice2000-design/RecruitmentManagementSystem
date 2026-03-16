import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {

  data = {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  };

  // Field errors
  errors: { [key: string]: string } = {};

  // Toast control
  toastMessage = '';
  toastType: 'success' | 'error' = 'error';
  showToastFlag = false;
  private toastTimeout: any;

  // UI state
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(private router: Router, private ngZone: NgZone) {}

  // ─── Toast Helpers ────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.showToastFlag = false;
  }

  // ─── UI Helpers ───────────────────────────────────────────
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError(field: string) {
    this.errors[field] = '';
  }

  // ─── Validation ───────────────────────────────────────────
  validate(): boolean {
    this.errors = {};
    let valid = true;

    if (!this.data.fullName.trim()) {
      this.errors['fullName'] = 'Full name is required';
      valid = false;
    }

    if (!this.data.email.trim()) {
      this.errors['email'] = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email)) {
      this.errors['email'] = 'Please enter a valid email address';
      valid = false;
    }

    if (!this.data.phone.trim()) {
      this.errors['phone'] = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(this.data.phone.replace(/[\s\-]/g, ''))) {
      this.errors['phone'] = 'Please enter a valid 10-digit phone number';
      valid = false;
    }

    if (!this.data.dob) {
      this.errors['dob'] = 'Date of birth is required';
      valid = false;
    }


    if (!this.data.password) {
      this.errors['password'] = 'Password is required';
      valid = false;
    } else if (this.data.password.length < 6) {
      this.errors['password'] = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!this.data.confirmPassword) {
      this.errors['confirmPassword'] = 'Please confirm your password';
      valid = false;
    } else if (this.data.password !== this.data.confirmPassword) {
      this.errors['confirmPassword'] = 'Passwords do not match';
      valid = false;
    }

    return valid;
  }

  // ─── Register ─────────────────────────────────────────────
  onRegister() {
    if (!this.validate()) {
      this.showToast('Please fix the errors below.', 'error');
      return;
    }

    this.isLoading = true;
    const self = this;

    // Call Cordys SOAP to create user
    $.cordys.ajax({
      method: 'CreateUser',
      namespace: 'http://schemas.cordys.com/UserManagement/1.0/Organization',
      parameters: {
        UserName: this.data.email,
        Password: this.data.password,
        FullName: this.data.fullName,
        Email: this.data.email,
        Phone: this.data.phone,
        DateOfBirth: this.data.dob,
      },
    })
      .done((response: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          self.showToast('Registration successful! Redirecting to login...', 'success');
          setTimeout(() => {
            self.router.navigate(['/login']);
          }, 1500);
        });
      })
      .fail((error: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          console.error('Registration error:', error);
          self.showToast('Registration failed. Please try again or contact admin.', 'error');
        });
      });
  }
}
