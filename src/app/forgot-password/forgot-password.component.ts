import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {

  // Step control: 'request' → 'reset' → 'success'
  step: 'request' | 'reset' | 'success' = 'request';

  // Step 1 — Request
  username = '';
  errorUsername = '';

  // Step 2 — Reset
  newPassword = '';
  confirmPassword = '';
  errorNewPassword = '';
  errorConfirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'error';
  showToastFlag = false;
  private toastTimeout: any;

  // UI
  isLoading = false;

  constructor(private router: Router, private ngZone: NgZone) {}

  // ─── Toast ────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' = 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastTimeout = setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }

  hideToast() {
    this.showToastFlag = false;
  }

  // ─── Step 1: Verify username exists ───────────────────────
  onVerifyUser() {
    this.errorUsername = '';

    if (!this.username.trim()) {
      this.errorUsername = 'Email is required';
      this.showToast('Please enter your email.', 'error');
      return;
    }

    this.isLoading = true;
    const self = this;

    $.cordys.ajax({
      method: 'GetUserDetails',
      namespace: 'http://schemas.cordys.com/UserManagement/1.0/Organization',
      parameters: { UserName: this.username },
    })
      .done((response: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          // If we get a response, user exists → move to reset step
          self.showToast('User verified. Please set a new password.', 'success');
          setTimeout(() => {
            self.step = 'reset';
          }, 500);
        });
      })
      .fail((error: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          self.errorUsername = 'Email not found';
          self.showToast('Email not found. Please check and try again.', 'error');
        });
      });
  }

  // ─── Step 2: Reset password ───────────────────────────────
  onResetPassword() {
    this.errorNewPassword = '';
    this.errorConfirmPassword = '';
    let valid = true;

    if (!this.newPassword) {
      this.errorNewPassword = 'New password is required';
      valid = false;
    } else if (this.newPassword.length < 6) {
      this.errorNewPassword = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!this.confirmPassword) {
      this.errorConfirmPassword = 'Please confirm your password';
      valid = false;
    } else if (this.newPassword !== this.confirmPassword) {
      this.errorConfirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (!valid) {
      this.showToast('Please fix the errors below.', 'error');
      return;
    }

    this.isLoading = true;
    const self = this;

    $.cordys.ajax({
      method: 'SetPassword',
      namespace: 'http://schemas.cordys.com/UserManagement/1.0/Organization',
      parameters: {
        UserName: this.username,
        NewPassword: this.newPassword,
      },
    })
      .done((response: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          self.step = 'success';
          self.showToast('Password reset successfully!', 'success');
        });
      })
      .fail((error: any) => {
        self.ngZone.run(() => {
          self.isLoading = false;
          console.error('Password reset error:', error);
          self.showToast('Failed to reset password. Please try again.', 'error');
        });
      });
  }

  // ─── Navigate back to login ───────────────────────────────
  goToLogin() {
    this.router.navigate(['/login']);
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError(field: string) {
    if (field === 'username') this.errorUsername = '';
    if (field === 'newPassword') this.errorNewPassword = '';
    if (field === 'confirmPassword') this.errorConfirmPassword = '';
  }
}
