import { Component, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800
                bg-white dark:bg-slate-900 flex flex-col h-full">

    <!-- Logo -->
    <div class="p-6 flex items-center gap-3">
      <div class="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
        <span class="material-symbols-outlined">photo_camera</span>
      </div>
      <div>
        <h1 class="text-slate-900 dark:text-white font-bold text-lg leading-tight">
          Picflow
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          Studio Management
        </p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
      @for (item of visibleItems(); track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="bg-primary/10 !text-primary"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600
                dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                transition-colors text-sm font-medium"
        >
          <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>

    <!-- Theme toggle -->
    <div class="px-4 pb-2">
      <button
        (click)="themeService.toggle()"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
               text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
               transition-colors"
      >
        <span class="material-symbols-outlined text-[20px]">
          {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
        </span>
        <span>{{ themeService.isDark() ? 'Modo claro' : 'Modo oscuro' }}</span>
      </button>
    </div>

    <!-- User + Logout -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
      <div class="flex items-center gap-3 px-2">
        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center
                    text-primary text-xs font-bold uppercase">
          {{ userName().charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ userName() }}
          </p>
          <p class="text-xs text-slate-500 truncate">{{ userRol() }}</p>
        </div>
      </div>
      <button
        (click)="logout()"
        class="w-full flex items-center justify-center gap-2 py-2 rounded-lg
              text-sm font-semibold text-slate-600 dark:text-slate-400
              hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20
              dark:hover:text-red-400 transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">logout</span>
        Cerrar sesión
      </button>
    </div>
  </aside>
  `,
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'dashboard',        route: '/app/dashboard' },
    { label: 'Clientes',    icon: 'group',             route: '/app/clients' },
    { label: 'Citas',       icon: 'calendar_today',    route: '/app/appointments' },
    { label: 'Facturación', icon: 'payments',          route: '/app/invoices' },
    { label: 'Activos',     icon: 'collections',       route: '/app/assets' },
    { label: 'Reportes',    icon: 'bar_chart',         route: '/app/reports',  roles: ['Administrador'] },
    { label: 'Usuarios',    icon: 'manage_accounts',   route: '/app/users',    roles: ['Administrador'] },
  ];

  readonly userName = computed(() => this.authService.userName());
  readonly userRol = computed(() => this.authService.userRol());

  constructor(private authService: AuthService, readonly themeService: ThemeService) { }

  logout() {
    this.authService.logout();
  }

  visibleItems() {
    const rol = this.userRol();
    return this.navItems.filter(item =>
      !item.roles || !rol || item.roles.includes(rol)
    );
  }
}
