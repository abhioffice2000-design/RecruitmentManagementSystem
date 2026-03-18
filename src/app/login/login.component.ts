import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  data = { user: '', pass: '' };

  // Inline validation
  errorUser = '';
  errorPass = '';

  // Toast control
  toastMessage = '';
  toastType: 'success' | 'error' = 'error';
  showToastFlag = false;
  private toastTimeout: any;

  // Show/hide password
  showPassword = false;
  isLoading = false;
  private loginSucceeded = false;

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    // Override Cordys SDK's default login error handler to use our toast
    if ($ && $.cordys && $.cordys.authentication && $.cordys.authentication.defaults) {
      const self = this;
      $.cordys.authentication.defaults.loginErrorHandler = function (
        e: any,
        statusText: any,
        errorThrown: any
      ) {
        console.log('Cordys login error intercepted:', e, statusText, errorThrown);
        self.ngZone.run(() => {
          self.isLoading = false;
          self.errorUser = 'Invalid credentials';
          self.errorPass = 'Invalid credentials';
          self.showToast('Invalid email or password. Please try again.', 'error');
        });
      };
    }
  }

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

  clearErrors() {
    this.errorUser = '';
    this.errorPass = '';
  }

  // ─── Main Login ───────────────────────────────────────────
  cordysLogin() {
    const self = this;

    this.clearErrors();
    let errors: string[] = [];

    if (!this.data.user) {
      this.errorUser = 'Email is required';
      errors.push('email');
    }

    if (!this.data.pass) {
      this.errorPass = 'Password is required';
      errors.push('password');
    }

    if (errors.length) {
      this.showToast(`Please enter your ${errors.join(' and ')}.`, 'error');
      return;
    }

    this.isLoading = true;

    // Helper function to handle login errors
    const handleLoginError = (error?: any) => {
      console.log('Login error occurred:', error);
      self.ngZone.run(() => {
        self.isLoading = false;
        self.errorUser = 'Invalid credentials';
        self.errorPass = 'Invalid credentials';
        self.showToast('Invalid email or password. Please try again.', 'error');
      });
    };

    // Authenticate via Cordys SSO
    console.log('Attempting login with:', this.data.user);
    const authPromise = $.cordys.authentication.sso.authenticate(
      this.data.user,
      this.data.pass
    );

    authPromise
      .done(function () {
        console.log('Login success, fetching role...');
        self.loginSucceeded = true;
        self.ngZone.run(() => {
          self.fetchRole(self.data.user);
        });
      })
      .fail(handleLoginError);

    if (authPromise.error) {
      authPromise.error(handleLoginError);
    }

    // Fallback timeout in case neither callback fires
    setTimeout(() => {
      if (self.loginSucceeded) return; // Auth already succeeded, skip fallback
      if (
        window.location.pathname === '/' ||
        window.location.pathname === '/login'
      ) {
        if (!self.showToastFlag && self.data.user && self.data.pass) {
          console.log('Fallback timeout — showing error');
          handleLoginError();
        }
      }
    }, 5000);
  }

  // ─── Fetch User Role ──────────────────────────────────────
  fetchRole(username: string) {
    const self = this;
    $.cordys.ajax({
      method: 'GetUserDetails',
      namespace:
        'http://schemas.cordys.com/UserManagement/1.0/Organization',
      parameters: { UserName: username },
    })
      .done((response: any) => {
        self.ngZone.run(() => {
          const roles = self.extractRoles(response).map((r) => r.toUpperCase());
          self.redirectUser(roles, username);
        });
      })
      .fail(() => {
        self.ngZone.run(() => {
          self.isLoading = false;
          self.showToast('Error fetching user role', 'error');
        });
      });
  }

  // ─── Extract Roles from Response ──────────────────────────
  extractRoles(resp: any): string[] {
    const roles: string[] = [];
    const roleNode =
      resp?.GetUserDetailsResponse?.User?.Roles?.Role ||
      resp?.User?.Roles?.Role ||
      resp?.Roles?.Role;

    if (Array.isArray(roleNode)) {
      roleNode.forEach((r: any) =>
        roles.push(
          typeof r === 'string' ? r.trim() : r['#text'] || r?.text || ''
        )
      );
    } else if (roleNode) {
      roles.push(
        typeof roleNode === 'string'
          ? roleNode.trim()
          : roleNode['#text'] || roleNode?.text || ''
      );
    }

    return roles;
  }

  // ─── Role-Based Redirect ─────────────────────────────────
  redirectUser(roles: string[], username: string) {
    sessionStorage.setItem('loggedInUser', username);

    const roleRouteMap: { role: string; route: string; label: string }[] = [
      { role: 'ADMIN_RMST1', route: '/admin', label: 'Admin Dashboard' },
      { role: 'CANDIDATE_RMST1', route: '/candidate', label: 'Candidate Portal' },
      { role: 'HR_RMST1', route: '/hr', label: 'HR Dashboard' },
      { role: 'INTERVIEWER_RMST1', route: '/interviewer', label: 'Interviewer Portal' },
      { role: 'MANAGER_RMST1', route: '/manager', label: 'Manager Dashboard' },
    ];

    for (const entry of roleRouteMap) {
      if (roles.includes(entry.role)) {
        this.showToast(
          `Login successful. Redirecting to ${entry.label}...`,
          'success'
        );
        setTimeout(() => {
          this.router.navigate([entry.route]).then((success) => {
            console.log(
              `Navigation to ${entry.route}:`,
              success ? 'successful' : 'failed'
            );
          });
        }, 800);
        return;
      }
    }

    // No recognized role
    this.isLoading = false;
    this.showToast('Unauthorized user — no valid role assigned.', 'error');
  }
}
