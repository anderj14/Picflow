import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ── Rutas públicas ────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./public/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./public/home/home').then(m => m.Home),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./public/services/services').then(m => m.Services),
      },
      {
        path: 'agendar',
        loadComponent: () =>
          import('./public/booking/booking').then(m => m.Booking),
      },
    ],
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login),
  },

  // ── Panel de administración ───────────────────────────────────────────────
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout').then(m => m.Layout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/clients').then(m => m.Clients),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments').then(m => m.Appointments),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/invoices/invoices').then(m => m.Invoices),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/assets').then(m => m.Assets),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then(m => m.Reports),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/users').then(m => m.Users),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
