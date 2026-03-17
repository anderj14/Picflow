import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="h-16 border-b border-slate-200 dark:border-slate-800
              bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
              sticky top-0 z-10 px-8 flex items-center justify-between flex-shrink-0">

      <!-- Search -->
      <div class="flex items-center gap-4 flex-1 max-w-xl">
        <div class="relative w-full">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2
                      text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar clientes, citas, facturas..."
            class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg
                  pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20
                  focus:outline-none text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400"
          />
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-4">

        <!-- Notifications -->
        <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800
                      rounded-lg relative transition-colors">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full
                      border-2 border-white dark:border-slate-900"></span>
        </button>

        <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        <!-- User info -->
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold leading-none text-slate-900 dark:text-white">
              {{ userName() }}
            </p>
            <p class="text-xs text-slate-500 mt-1">{{ userRol() }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/20 border border-primary/10
                      flex items-center justify-center text-primary font-bold text-sm uppercase">
            {{ userName().charAt(0) }}
          </div>
        </div>

      </div>
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  searchQuery = signal('');
  readonly userName = computed(() => this.authService.userName());
  readonly userRol = computed(() => this.authService.userRol());

  constructor(private authService: AuthService) { }
}
