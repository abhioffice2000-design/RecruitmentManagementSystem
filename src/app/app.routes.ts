import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'candidate',
    loadComponent: () =>
      import('./candidate-portal/candidate-portal').then((m) => m.CandidatePortal),
  },
  {
    path: 'hr',
    loadComponent: () =>
      import('./hr-dashboard/hr-dashboard').then((m) => m.HrDashboard),
  },
  {
    path: 'interviewer',
    loadComponent: () =>
      import('./interviewer-portal/interviewer-portal').then((m) => m.InterviewerPortal),
  },
  {
    path: 'manager',
    loadComponent: () =>
      import('./manager-dashboard/manager-dashboard').then((m) => m.ManagerDashboard),
  },
];
