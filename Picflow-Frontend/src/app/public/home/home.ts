import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `

    <!-- ══════════════════════════════════════════════════════════════════════
         1. HERO
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-[#1E3A8A] text-white min-h-[92vh] flex items-center">
      <!-- Decorative background shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
             style="background: radial-gradient(circle, #F59E0B 0%, transparent 70%)"></div>
        <div class="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-10"
             style="background: radial-gradient(circle, #F59E0B 0%, transparent 70%)"></div>
        <!-- Grid pattern -->
        <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <!-- Decorative frame lines -->
        <div class="absolute top-12 left-12 w-24 h-24 border-2 border-amber-400/30 rounded-sm rotate-12"></div>
        <div class="absolute bottom-20 right-16 w-16 h-16 border-2 border-amber-400/20 rounded-sm -rotate-6"></div>
        <div class="absolute top-1/2 right-24 w-8 h-8 bg-amber-500/20 rounded-full"></div>
        <div class="absolute top-1/3 left-1/4 w-4 h-4 bg-amber-500/30 rounded-full"></div>
      </div>

      <div class="relative max-w-6xl mx-auto px-6 py-24 md:py-32 w-full">
        <div class="max-w-3xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-8">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-amber-300 text-sm font-medium">Estudio fotográfico — Ensanche Libertad, Santiago</span>
          </div>

          <!-- Headline -->
          <h1 class="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Capturamos los<br/>
            <span class="text-amber-400">momentos</span><br/>
            que definen tu historia
          </h1>

          <p class="text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
            Más de <strong class="text-white">21 años</strong> preservando sonrisas, emociones y celebraciones
            con la atención personalizada que tu historia merece.
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4">
            <a routerLink="/agendar"
               class="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5 text-base">
              <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1">calendar_add_on</span>
              Agendar sesión ahora
            </a>
            <a routerLink="/servicios"
               class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all text-base">
              <span class="material-symbols-outlined text-[22px]">collections</span>
              Ver servicios
            </a>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 md:mt-20">
          @for (stat of stats; track stat.label) {
            <div class="bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-5 py-4 hover:border-amber-500/40 transition-colors">
              <div class="text-3xl font-black text-amber-400 mb-0.5">{{ stat.value }}</div>
              <div class="text-white/60 text-xs font-medium leading-tight">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════════════
         2. SOBRE NOSOTROS — Misión & Visión
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="py-24 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <!-- Left: Brand story -->
          <div>
            <span class="inline-block text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Quiénes somos</span>
            <h2 class="text-4xl md:text-5xl font-black text-[#1E3A8A] leading-tight mb-6">
              Acción Fotovídeo
            </h2>
            <p class="text-slate-600 text-lg leading-relaxed mb-8">
              Somos un estudio fotográfico con más de <strong>21 años de trayectoria</strong> en Santiago de los
              Caballeros. Nuestra misión es capturar y preservar los momentos más significativos de tu vida
              con atención personalizada, tecnología de punta y un equipo apasionado por el arte visual.
            </p>

            <!-- Mission & Vision cards -->
            <div class="space-y-4">
              <div class="flex gap-4 p-5 bg-[#1E3A8A]/5 rounded-2xl border border-[#1E3A8A]/10">
                <div class="w-10 h-10 rounded-xl bg-[#1E3A8A] flex-shrink-0 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px] text-white" style="font-variation-settings:'FILL' 1">flag</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[#1E3A8A] mb-1">Nuestra Misión</h4>
                  <p class="text-slate-600 text-sm leading-relaxed">
                    Capturar y preservar momentos significativos con atención personalizada,
                    creatividad y los más altos estándares de calidad.
                  </p>
                </div>
              </div>
              <div class="flex gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex-shrink-0 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px] text-white" style="font-variation-settings:'FILL' 1">visibility</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-amber-700 mb-1">Nuestra Visión</h4>
                  <p class="text-slate-600 text-sm leading-relaxed">
                    Ser la referencia en excelencia, innovación tecnológica y satisfacción del cliente
                    en el sector fotográfico de la región norte del país.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Values -->
          <div>
            <span class="inline-block text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Nuestros valores</span>
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Los principios que guían nuestro trabajo</h3>
            <div class="grid grid-cols-1 gap-3">
              @for (v of valores; track v.label) {
                <div class="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                  <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                       [style.background]="v.bg">
                    <span class="material-symbols-outlined text-[18px]" [style.color]="v.color"
                          style="font-variation-settings:'FILL' 1">{{ v.icon }}</span>
                  </div>
                  <div>
                    <span class="block font-bold text-slate-900 text-sm">{{ v.label }}</span>
                    <span class="block text-slate-500 text-xs leading-relaxed">{{ v.desc }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════════════
         3. SERVICIOS
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="py-24 bg-slate-50">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="inline-block text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Lo que ofrecemos</span>
          <h2 class="text-4xl md:text-5xl font-black text-[#1E3A8A] mb-4">Nuestros Servicios</h2>
          <p class="text-slate-500 text-lg max-w-2xl mx-auto">
            Desde bodas hasta videos corporativos — cubrimos cada momento especial con el mismo nivel de dedicación y excelencia.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of servicios; track s.titulo) {
            <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <!-- Card header -->
              <div class="h-2" [style.background]="s.accent"></div>
              <div class="p-6">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors"
                     [style.background]="s.iconBg">
                  <span class="material-symbols-outlined text-[28px]" [style.color]="s.iconColor"
                        style="font-variation-settings:'FILL' 1">{{ s.icon }}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">{{ s.titulo }}</h3>
                <p class="text-slate-500 text-sm leading-relaxed mb-4">{{ s.descripcion }}</p>
                <ul class="space-y-1.5">
                  @for (item of s.items; track item) {
                    <li class="flex items-center gap-2 text-xs text-slate-600">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>

        <div class="text-center mt-10">
          <a routerLink="/servicios"
             class="inline-flex items-center gap-2 text-[#1E3A8A] font-bold hover:text-amber-600 text-sm transition-colors">
            Explorar todos los servicios
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════════════
         4. POR QUÉ ELEGIRNOS
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="py-24 bg-[#1E3A8A] text-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="inline-block text-amber-400 text-sm font-bold uppercase tracking-widest mb-3">Nuestra diferencia</span>
          <h2 class="text-4xl md:text-5xl font-black mb-4">¿Por qué elegir<br/>Acción Fotovídeo?</h2>
          <p class="text-white/60 text-lg max-w-2xl mx-auto">
            Más de dos décadas perfeccionando el arte de capturar emociones con tecnología y corazón.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (d of diferenciadores; track d.titulo) {
            <div class="bg-white/8 border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-white/12 transition-all text-center">
              <div class="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                <span class="material-symbols-outlined text-amber-400 text-[28px]"
                      style="font-variation-settings:'FILL' 1">{{ d.icon }}</span>
              </div>
              <div class="text-4xl font-black text-amber-400 mb-1">{{ d.valor }}</div>
              <div class="text-white font-bold text-sm mb-2">{{ d.titulo }}</div>
              <div class="text-white/50 text-xs leading-relaxed">{{ d.desc }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════════════
         5. GALERÍA VISUAL
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="py-24 bg-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="inline-block text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Nuestra galería</span>
          <h2 class="text-4xl md:text-5xl font-black text-[#1E3A8A] mb-4">Momentos que capturamos</h2>
          <p class="text-slate-500 text-lg max-w-2xl mx-auto">
            Cada imagen cuenta una historia única. Así es como inmortalizamos los momentos más especiales de nuestros clientes.
          </p>
        </div>

        <!-- Masonry-style gallery grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 auto-rows-[12rem] gap-3">
          @for (g of galeria; track g.label) {
            <div class="rounded-2xl overflow-hidden group cursor-pointer relative"
                 [class]="g.span">
              <!-- Real photo -->
              <img [src]="g.src" [alt]="g.label"
                   class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

              <!-- Gradient overlay (bottom) -->
              <div class="absolute inset-0"
                   style="background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)"></div>

              <!-- Hover tint -->
              <div class="absolute inset-0 bg-[#1E3A8A]/0 group-hover:bg-[#1E3A8A]/30 transition-colors duration-300"></div>

              <!-- Label -->
              <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <span class="text-white font-bold text-sm drop-shadow group-hover:text-amber-300 transition-colors">
                  {{ g.label }}
                </span>
                <div class="w-7 h-7 rounded-lg bg-amber-500/0 group-hover:bg-amber-500 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0">
                  <span class="material-symbols-outlined text-[14px] text-white">open_in_full</span>
                </div>
              </div>

              <!-- Amber accent line top on hover -->
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          }
        </div>

        <div class="text-center mt-10">
          <a routerLink="/agendar"
             class="inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">calendar_add_on</span>
            Agenda tu sesión fotográfica
          </a>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════════════
         6. CÓMO AGENDAR + CTA
    ══════════════════════════════════════════════════════════════════════ -->
    <section class="py-24 bg-slate-50">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="inline-block text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Proceso simple</span>
          <h2 class="text-4xl md:text-5xl font-black text-[#1E3A8A] mb-4">Agenda en 3 pasos</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          @for (paso of pasos; track paso.num) {
            <div class="text-center relative">
              @if (paso.num < 3) {
                <div class="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-0 h-px bg-amber-200"></div>
              }
              <div class="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-lg shadow-amber-500/30 relative z-10">
                {{ paso.num }}
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">{{ paso.titulo }}</h3>
              <p class="text-slate-500 text-sm leading-relaxed">{{ paso.desc }}</p>
            </div>
          }
        </div>

        <!-- CTA Banner -->
        <div class="relative bg-[#1E3A8A] rounded-3xl overflow-hidden px-8 py-14 text-center text-white">
          <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
               style="background: radial-gradient(circle, #F59E0B 0%, transparent 70%)"></div>
          <div class="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10"
               style="background: radial-gradient(circle, #F59E0B 0%, transparent 70%)"></div>
          <div class="relative">
            <h3 class="text-3xl md:text-4xl font-black mb-4">
              ¿Listo para crear recuerdos<br class="hidden md:block"/> que duren toda la vida?
            </h3>
            <p class="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Agenda tu sesión hoy mismo. Recibe confirmación por correo y déjanos hacer el resto.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/agendar"
                 class="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5">
                <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1">calendar_add_on</span>
                Agendar sesión
              </a>
              <a routerLink="/servicios"
                 class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-all">
                <span class="material-symbols-outlined text-[22px]">collections</span>
                Ver todos los servicios
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

  `,
})
export class Home {

  readonly stats = [
    { value: '21+',   label: 'Años de experiencia' },
    { value: '5K+',   label: 'Clientes satisfechos' },
    { value: '100%',  label: 'Atención personalizada' },
    { value: '24h',   label: 'Confirmación de citas' },
  ];

  readonly valores = [
    { label: 'Calidad',             icon: 'verified',      bg: '#EFF6FF', color: '#1E3A8A', desc: 'Estándares de excelencia en cada captura y producción.' },
    { label: 'Compromiso',          icon: 'handshake',     bg: '#FFFBEB', color: '#D97706', desc: 'Dedicación total a cada cliente y proyecto.' },
    { label: 'Creatividad',         icon: 'palette',       bg: '#F5F3FF', color: '#7C3AED', desc: 'Perspectiva artística única en cada trabajo.' },
    { label: 'Responsabilidad',     icon: 'shield',        bg: '#F0FDF4', color: '#16A34A', desc: 'Puntualidad y seriedad en cada compromiso.' },
    { label: 'Servicio al cliente', icon: 'favorite',      bg: '#FFF1F2', color: '#E11D48', desc: 'Calidez y cercanía en cada interacción.' },
  ];

  readonly servicios = [
    {
      titulo: 'Fotografía de Eventos',
      icon: 'celebration', iconBg: '#FFFBEB', iconColor: '#D97706',
      accent: 'linear-gradient(90deg,#F59E0B,#FBBF24)',
      descripcion: 'Capturamos la emoción de tus momentos más especiales con equipos profesionales y artística visión.',
      items: ['Bodas y compromisos', 'Quinceañeras', 'Graduaciones', 'Cumpleaños y fiestas'],
    },
    {
      titulo: 'Audiovisual y Video',
      icon: 'videocam', iconBg: '#EFF6FF', iconColor: '#1E40AF',
      accent: 'linear-gradient(90deg,#1E3A8A,#3B82F6)',
      descripcion: 'Producción y edición de video profesional para eventos, empresas y redes sociales.',
      items: ['Video de bodas y eventos', 'Spots publicitarios', 'Videos corporativos', 'Edición y postproducción'],
    },
    {
      titulo: 'Enmarcado e Impresión',
      icon: 'image', iconBg: '#F0FDF4', iconColor: '#15803D',
      accent: 'linear-gradient(90deg,#16A34A,#4ADE80)',
      descripcion: 'Imprimimos y enmarcamos tus recuerdos con materiales de primera calidad para que duren generaciones.',
      items: ['Marcos decorativos a medida', 'Impresión en alta resolución', 'Canvas y acrílicos', 'Álbumes fotográficos'],
    },
    {
      titulo: 'Sesiones de Estudio',
      icon: 'photo_camera', iconBg: '#F5F3FF', iconColor: '#7C3AED',
      accent: 'linear-gradient(90deg,#7C3AED,#A78BFA)',
      descripcion: 'Nuestro estudio completamente equipado ofrece el ambiente perfecto para cada tipo de sesión.',
      items: ['Retratos familiares', 'Fotografía corporativa', 'Newborn y maternidad', 'Moda y publicidad'],
    },
    {
      titulo: 'Alquiler de Togas',
      icon: 'school', iconBg: '#FFF1F2', iconColor: '#E11D48',
      accent: 'linear-gradient(90deg,#E11D48,#FB7185)',
      descripcion: 'Servicio completo de alquiler de togas y accesorios para graduaciones de todos los niveles.',
      items: ['Universidades y colegios', 'Togas en varios colores', 'Birretes y medallas', 'Paquetes con sesión fotográfica'],
    },
    {
      titulo: 'Fotografía Corporativa',
      icon: 'business_center', iconBg: '#FFFBEB', iconColor: '#B45309',
      accent: 'linear-gradient(90deg,#D97706,#F59E0B)',
      descripcion: 'Imagen profesional para tu empresa: headshots, eventos empresariales y fotografía de producto.',
      items: ['Headshots ejecutivos', 'Eventos y conferencias', 'Fotografía de producto', 'Redes sociales empresariales'],
    },
  ];

  readonly diferenciadores = [
    { icon: 'workspace_premium', valor: '21+', titulo: 'Años de experiencia', desc: 'Más de dos décadas capturando los mejores momentos en Santiago.' },
    { icon: 'group',             valor: '5K+', titulo: 'Clientes satisfechos', desc: 'Miles de familias y empresas han confiado su historia a nosotros.' },
    { icon: 'photo_camera',      valor: '4K',  titulo: 'Equipo profesional',   desc: 'Cámaras, iluminación y equipo de última generación.' },
    { icon: 'verified',          valor: '100%', titulo: 'Garantía de calidad', desc: 'Tu satisfacción es nuestra prioridad absoluta en cada proyecto.' },
  ];

  readonly galeria = [
    { label: 'Bodas',        src: '/married.jpg',     span: 'md:col-span-2 md:row-span-2' },
    { label: 'Graduaciones', src: '/graduate.jpg',    span: '' },
    { label: 'Quinceañeras', src: '/quinceanera.jpg', span: '' },
    { label: 'Retratos',     src: '/portrait.jpg',    span: '' },
    { label: 'Videos',       src: '/video.jpg',       span: 'md:col-span-2' },
    { label: 'Cumpleaños',   src: '/birth.jpg',       span: '' },
    { label: 'Corporativo',  src: '/corporate.jpg',   span: '' },
  ];

  readonly pasos = [
    { num: 1, titulo: 'Elige fecha y hora',        desc: 'Consulta la disponibilidad en nuestro calendario en línea y selecciona el día que te convenga.' },
    { num: 2, titulo: 'Completa tu información',   desc: 'Ingresa tus datos y cuéntanos sobre la sesión que deseas. Es rápido y sencillo.' },
    { num: 3, titulo: 'Confirmamos por correo',    desc: 'Te enviamos una confirmación inmediata. Nuestro equipo se pondrá en contacto contigo.' },
  ];
}
