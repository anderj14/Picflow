import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: '',
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
        path: 'pre-orders',
        loadComponent: () =>
          import('./features/pre-orders/pre-orders').then(m => m.PreOrders),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/assets').then(m => m.Assets),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/catalog').then(m => m.Catalog),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then(m => m.Reports),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users').then(m => m.Users),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
