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
      import('./admin-dashboard/admin-layout/admin-layout.component').then((m) => m.Admin_LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./admin-dashboard/candidates/candidates.component').then((m) => m.CandidatesComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./admin-dashboard/jobs/jobs.component').then((m) => m.JobsComponent),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./admin-dashboard/interviews/interviews.component').then((m) => m.InterviewsComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin-dashboard/user-management/user-management').then((m) => m.UserManagement),
      }
    ]
  },
  {
    path: 'candidate',
    loadComponent: () =>
      import('./candidate-portal/candidate-portal').then((m) => m.CandidatePortal),
    children: [
      { path: '', redirectTo: 'jobs', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./candidate-portal/pages/candidate-dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./candidate-portal/pages/candidate-job-search/candidate-job-search.component').then(m => m.CandidateJobSearchComponent),
      },
      {
        path: 'jobs/:id/apply',
        loadComponent: () =>
          import('./candidate-portal/pages/candidate-apply-job/candidate-apply-job.component').then(m => m.CandidateApplyJobComponent),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./candidate-portal/pages/candidate-applications/candidate-applications.component').then(m => m.CandidateApplicationsComponent),
      },
    ]
  },
  {
    path: 'hr',
    loadComponent: () =>
      import('./hr-dashboard/hr-dashboard').then((m) => m.HrDashboard),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./hr-dashboard/dashboard-tab/dashboard-tab').then(m => m.DashboardTab) },
      { path: 'inbox', loadComponent: () => import('./hr-dashboard/inbox/inbox').then(m => m.InboxTab) },
      { path: 'calendar', loadComponent: () => import('./hr-dashboard/calendar/calendar').then(m => m.CalendarTab) },
      { path: 'jobs', loadComponent: () => import('./hr-dashboard/jobs/jobs').then(m => m.JobsTab) },
      { path: 'candidates', loadComponent: () => import('./hr-dashboard/candidates/candidates').then(m => m.CandidatesTab) },
      { path: 'pipeline', loadComponent: () => import('./hr-dashboard/pipeline-board/pipeline-board').then(m => m.PipelineBoardComponent) },
      { path: 'referrals', loadComponent: () => import('./hr-dashboard/referrals/referrals').then(m => m.ReferralsTab) },
      { path: 'report', loadComponent: () => import('./hr-dashboard/report/report').then(m => m.ReportTab) },
      { path: 'settings', loadComponent: () => import('./hr-dashboard/settings/settings').then(m => m.SettingsTab) },
    ]
  },
  {
    path: 'interviewer',
    loadComponent: () =>
      import('./interviewer-portal/interviewer-portal').then((m) => m.InterviewerPortal),
  },
  {
    path: 'manager',
    loadComponent: () =>
      import('./manager-dashboard/manager-layout/manager-layout').then((m) => m.ManagerLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./manager-dashboard/manager-dashboard').then((m) => m.ManagerDashboard),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./manager-dashboard/manager-team/manager-team').then((m) => m.ManagerTeam),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./manager-dashboard/manager-jobs/manager-jobs').then((m) => m.ManagerJobs),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./manager-dashboard/manager-interviews/manager-interviews').then((m) => m.ManagerInterviews),
      }
    ]
  },
];
