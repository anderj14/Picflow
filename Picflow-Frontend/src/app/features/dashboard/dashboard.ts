import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Cliente } from '../../core/models/cliente.model';
import { Cita } from '../../core/models/cita.model';
import { Factura } from '../../core/models/factura.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  readonly quickActions = [
    { label: 'Nueva Cita', icon: 'add_a_photo', route: '/appointments' },
    { label: 'Nueva Factura', icon: 'description', route: '/invoices' },
    { label: 'Nuevo Cliente', icon: 'person_add', route: '/clients' },
    { label: 'Subir Fotos', icon: 'cloud_upload', route: '/assets' },
  ];

  readonly userName = signal('');

  // Stats
  totalClientes = signal(0);
  citasPendientes = signal(0);
  pagosPendientes = signal(0);

  // Lists
  citasProximas = signal<Cita[]>([]);
  facturasPendientes = signal<Factura[]>([]);

  loading = signal(true);

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userName.set(this.authService.userName());
    this.loadData();
  }

  loadData() {
    // Clientes
    this.api.getClientes().subscribe({
      next: (clientes) => this.totalClientes.set(clientes.length),
      error: () => { }
    });

    // Citas
    this.api.getCitas().subscribe({
      next: (citas) => {
        const pendientes = citas.filter(c =>
          c.estado === 'Pendiente' || c.estado === 'Confirmada'
        );
        this.citasPendientes.set(pendientes.length);

        const proximas = citas
          .filter(c => new Date(c.fechaHora) >= new Date())
          .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
          .slice(0, 3);
        this.citasProximas.set(proximas);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Facturas pendientes
    this.api.getFacturas().subscribe({
      next: (facturas) => {
        this.facturasPendientes.set(facturas.slice(0, 4));
        const total = facturas.reduce((sum, f) => sum + f.saldoPendiente, 0);
        this.pagosPendientes.set(total);
      },
      error: () => { }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'DOP', maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      Pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Confirmada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Completada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      EnProceso: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600';
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}