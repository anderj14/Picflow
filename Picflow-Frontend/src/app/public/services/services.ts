import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Header -->
    <section class="bg-[#1E3A8A] text-white py-20 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
      </div>
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <span class="inline-block text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">Acción Fotovídeo</span>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Nuestros Servicios</h1>
        <p class="text-lg text-white/70 leading-relaxed">
          Más de 21 años ofreciendo soluciones fotográficas y audiovisuales de calidad en Santiago de los Caballeros.
        </p>
      </div>
    </section>

    <!-- Services grid -->
    <section class="max-w-6xl mx-auto px-6 py-20">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        @for (s of servicios; track s.titulo) {
          <div class="flex gap-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center"
                 [style.background]="s.bg">
              <span class="material-symbols-outlined text-[28px]" [style.color]="s.color"
                    style="font-variation-settings:'FILL' 1">{{ s.icon }}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">{{ s.titulo }}</h3>
              <p class="text-slate-500 text-sm leading-relaxed mb-4">{{ s.descripcion }}</p>
              <ul class="space-y-1.5">
                @for (f of s.features; track f) {
                  <li class="flex items-center gap-2 text-sm text-slate-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    {{ f }}
                  </li>
                }
              </ul>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-[#1E3A8A] py-20 text-center">
      <div class="max-w-2xl mx-auto px-6">
        <h2 class="text-3xl font-bold text-white mb-4">¿Listo para tu sesión?</h2>
        <p class="text-white/60 mb-8 text-lg">Agenda tu cita hoy mismo. Confirmación inmediata por correo electrónico.</p>
        <a routerLink="/agendar"
           class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all">
          <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1">calendar_add_on</span>
          Agendar mi cita
        </a>
      </div>
    </section>
  `,
})
export class Services {
  readonly servicios = [
    {
      titulo: 'Fotografía de Eventos Sociales',
      icon: 'celebration', bg: '#FFFBEB', color: '#D97706',
      descripcion: 'Cobertura fotográfica profesional de los momentos más significativos de tu vida. Bodas, quinceañeras, graduaciones y todas las celebraciones especiales.',
      features: ['Bodas y compromisos', 'Quinceañeras y sweet sixteen', 'Graduaciones universitarias y colegiales', 'Cumpleaños y celebraciones familiares'],
    },
    {
      titulo: 'Producción Audiovisual y Video',
      icon: 'videocam', bg: '#EFF6FF', color: '#1E40AF',
      descripcion: 'Producción y edición de video de alta calidad para eventos, publicidad y redes sociales. Contamos con equipos 4K y un equipo de edición especializado.',
      features: ['Video de bodas y eventos sociales', 'Spots publicitarios y comerciales', 'Videos corporativos y empresariales', 'Edición y postproducción profesional'],
    },
    {
      titulo: 'Enmarcado e Impresión Profesional',
      icon: 'image', bg: '#F0FDF4', color: '#15803D',
      descripcion: 'Damos vida a tus recuerdos con impresiones de alta resolución y marcos artesanales. Desde canvas hasta álbumes de lujo, preservamos tu historia.',
      features: ['Marcos decorativos a medida', 'Impresión en alta resolución y gran formato', 'Canvas, acrílicos y chromaluxe', 'Álbumes fotográficos de lujo'],
    },
    {
      titulo: 'Sesiones de Estudio Profesional',
      icon: 'photo_camera', bg: '#F5F3FF', color: '#7C3AED',
      descripcion: 'Nuestro estudio cuenta con iluminación profesional, fondos variados y todo el equipo necesario para capturar la sesión perfecta en un ambiente controlado.',
      features: ['Retratos familiares e individuales', 'Fotografía de maternidad y newborn', 'Moda, belleza y publicidad', 'Headshots corporativos'],
    },
    {
      titulo: 'Alquiler de Togas y Accesorios',
      icon: 'school', bg: '#FFF1F2', color: '#E11D48',
      descripcion: 'Servicio completo de alquiler de togas académicas para graduaciones de todos los niveles educativos, con paquetes combinados de fotografía profesional.',
      features: ['Togas universitarias y colegiales', 'Birretes, medallas y accesorios', 'Disponible en varios colores', 'Paquetes combinados con sesión fotográfica'],
    },
    {
      titulo: 'Fotografía Corporativa y Empresarial',
      icon: 'business_center', bg: '#FFFBEB', color: '#B45309',
      descripcion: 'Proyecta una imagen profesional y confiable para tu empresa. Desde headshots ejecutivos hasta la cobertura de eventos corporativos y fotografía de producto.',
      features: ['Headshots ejecutivos individuales y grupales', 'Cobertura de eventos y conferencias', 'Fotografía de producto para e-commerce', 'Contenido para redes sociales empresariales'],
    },
  ];
}
