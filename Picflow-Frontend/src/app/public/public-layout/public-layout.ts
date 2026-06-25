import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-white">

      <!-- ── Navbar ────────────────────────────────────────────────────────── -->
      <header class="sticky top-0 z-50 transition-all duration-300"
              [class]="scrolled() ? 'bg-[#1E3A8A] shadow-lg shadow-blue-900/30' : 'bg-[#1E3A8A]/95 backdrop-blur'">
        <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between py-3">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 select-none group">
            <div class="relative">
              <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/40 group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[22px] text-white" style="font-variation-settings:'FILL' 1">photo_camera</span>
              </div>
            </div>
            <div class="leading-tight">
              <span class="block font-extrabold text-white text-base tracking-tight">Acción Fotovídeo</span>
              <span class="block text-amber-400 text-[10px] font-medium tracking-widest uppercase">Estudio Profesional</span>
            </div>
          </a>

          <!-- Nav links (desktop) -->
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="!text-amber-400 font-semibold"
               class="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Inicio
            </a>
            <a routerLink="/servicios" routerLinkActive="!text-amber-400 font-semibold"
               class="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Servicios
            </a>
            <a routerLink="/agendar" routerLinkActive="!text-amber-400 font-semibold"
               class="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Agendar Cita
            </a>
          </nav>

          <div class="flex items-center gap-3">
            <!-- Mobile menu toggle -->
            <button (click)="mobileOpen.set(!mobileOpen())"
                    class="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined">{{ mobileOpen() ? 'close' : 'menu' }}</span>
            </button>
            <!-- Admin login -->
            <a routerLink="/login"
               class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow-sm shadow-amber-500/40">
              <span class="material-symbols-outlined text-[16px]">login</span>
              Administrar
            </a>
          </div>
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="md:hidden border-t border-white/10 bg-[#1E3A8A] px-6 pb-4 space-y-1">
            <a routerLink="/" (click)="mobileOpen.set(false)" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="bg-white/10 !text-amber-400"
               class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">home</span> Inicio
            </a>
            <a routerLink="/servicios" (click)="mobileOpen.set(false)" routerLinkActive="bg-white/10 !text-amber-400"
               class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">collections</span> Servicios
            </a>
            <a routerLink="/agendar" (click)="mobileOpen.set(false)" routerLinkActive="bg-white/10 !text-amber-400"
               class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span class="material-symbols-outlined text-[18px]">calendar_add_on</span> Agendar Cita
            </a>
            <a routerLink="/login" (click)="mobileOpen.set(false)"
               class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-amber-400 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-[18px]">login</span> Administrar
            </a>
          </div>
        }
      </header>

      <!-- Page content -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- ── Footer ─────────────────────────────────────────────────────────── -->
      <footer class="bg-[#1E3A8A] text-white">
        <div class="max-w-6xl mx-auto px-6 py-14">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">

            <!-- Brand -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px] text-white" style="font-variation-settings:'FILL' 1">photo_camera</span>
                </div>
                <div>
                  <span class="block font-extrabold text-white text-sm">Acción Fotovídeo</span>
                  <span class="block text-amber-400 text-[10px] tracking-widest uppercase">Estudio Profesional</span>
                </div>
              </div>
              <p class="text-white/60 text-sm leading-relaxed">
                Capturando y preservando los momentos más significativos de tu vida con atención personalizada y excelencia profesional.
              </p>
              <div class="flex items-center gap-3 mt-5">
                @for (s of socials; track s.label) {
                  <a [href]="s.href" target="_blank" rel="noopener"
                     class="w-9 h-9 rounded-lg bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-colors" [title]="s.label">
                    <span class="material-symbols-outlined text-[18px]">{{ s.icon }}</span>
                  </a>
                }
              </div>
            </div>

            <!-- Links -->
            <div>
              <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">Navegación</h4>
              <ul class="space-y-2.5">
                @for (l of footerLinks; track l.label) {
                  <li>
                    <a [routerLink]="l.route" class="text-white/60 hover:text-amber-400 text-sm transition-colors flex items-center gap-2">
                      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                      {{ l.label }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">Contacto</h4>
              <ul class="space-y-3">
                <li class="flex items-start gap-3 text-sm text-white/60">
                  <span class="material-symbols-outlined text-amber-400 text-[18px] mt-0.5 flex-shrink-0">location_on</span>
                  <span>Ensanche Libertad, Santiago de los Caballeros, República Dominicana</span>
                </li>
                <li class="flex items-center gap-3 text-sm text-white/60">
                  <span class="material-symbols-outlined text-amber-400 text-[18px] flex-shrink-0">phone</span>
                  <span>(809) 000-0000</span>
                </li>
                <li class="flex items-center gap-3 text-sm text-white/60">
                  <span class="material-symbols-outlined text-amber-400 text-[18px] flex-shrink-0">mail</span>
                  <span>info&#64;accionfotovideo.com</span>
                </li>
                <li class="flex items-center gap-3 text-sm text-white/60">
                  <span class="material-symbols-outlined text-amber-400 text-[18px] flex-shrink-0">schedule</span>
                  <span>Lun – Sáb: 9:00 AM – 6:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-white/10 py-5">
          <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <span>© 2025 Acción Fotovídeo. Todos los derechos reservados.</span>
            <span>Ensanche Libertad, Santiago de los Caballeros, RD</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class PublicLayout {
  scrolled  = signal(false);
  mobileOpen = signal(false);

  readonly socials = [
    { label: 'Facebook',  icon: 'thumb_up',  href: '#' },
    { label: 'Instagram', icon: 'photo_camera', href: '#' },
    { label: 'WhatsApp',  icon: 'chat',      href: '#' },
  ];

  readonly footerLinks = [
    { label: 'Inicio',       route: '/' },
    { label: 'Servicios',    route: '/servicios' },
    { label: 'Agendar Cita', route: '/agendar' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }
}
