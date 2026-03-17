import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Cita, CreateCitaRequest, EstadoCita } from '../../core/models/cita.model';
import { Cliente } from '../../core/models/cliente.model';

type ViewMode = 'calendar' | 'list';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appointments.html',
})
export class Appointments implements OnInit {
  citas = signal<Cita[]>([]);
  clientes = signal<Cliente[]>([]);
  fotografos = signal<any[]>([]);
  loading = signal(true);
  viewMode = signal<ViewMode>('calendar');
  showModal = signal(false);
  saving = signal(false);
  errorMsg = signal('');

  // Calendar
  currentDate = signal(new Date());

  form: CreateCitaRequest = this.emptyForm();

  readonly currentMonthLabel = computed(() => {
    return this.currentDate().toLocaleDateString('es-DO', {
      month: 'long', year: 'numeric'
    });
  });

  readonly calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const prev = new Date(year, month, 0).getDate();
    const cells: { day: number; currentMonth: boolean; date: Date }[] = [];

    for (let i = first - 1; i >= 0; i--) {
      cells.push({
        day: prev - i,
        currentMonth: false,
        date: new Date(year, month - 1, prev - i)
      });
    }
    for (let d = 1; d <= days; d++) {
      cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
    }
    return cells;
  });

  readonly citasDelMes = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    return this.citas().filter(c => {
      const d = new Date(c.fechaHora);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  });

  readonly citasHoy = computed(() => {
    const today = new Date().toDateString();
    return this.citas().filter(c =>
      new Date(c.fechaHora).toDateString() === today
    );
  });

  readonly estadisticas = computed(() => {
    const all = this.citas();
    return {
      confirmadas: all.filter(c => c.estado === 'Confirmada').length,
      pendientes: all.filter(c => c.estado === 'Pendiente').length,
      completadas: all.filter(c => c.estado === 'Completada').length,
      canceladas: all.filter(c => c.estado === 'Cancelada').length,
    };
  });

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadAll();
    this.api.getFotografos().subscribe({
      next: (data) => this.fotografos.set(data),
    });
  }

  loadAll() {
    this.loading.set(true);
    this.api.getCitas().subscribe({
      next: (data) => { this.citas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.getClientes().subscribe({
      next: (data) => this.clientes.set(data),
    });
  }

  getCitasForDay(date: Date): Cita[] {
    return this.citasDelMes().filter(c =>
      new Date(c.fechaHora).toDateString() === date.toDateString()
    );
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  goToday() {
    this.currentDate.set(new Date());
  }

  openCreate() {
    this.form = this.emptyForm();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  save() {
    if (!this.form.clienteId || !this.form.fotografoId || !this.form.fechaHora || !this.form.servicio) {
      this.errorMsg.set('Cliente, fotógrafo, fecha y servicio son obligatorios.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');
    this.api.createCita(this.form).subscribe({
      next: () => { this.closeModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al guardar.');
        this.saving.set(false);
      },
    });
  }

  cambiarEstado(cita: Cita, estado: EstadoCita) {
    this.api.cambiarEstadoCita(cita.id, estado).subscribe({
      next: () => this.loadAll(),
    });
  }

  formatHora(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-DO', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatFecha(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
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

  getEstadoCalendarClass(estado: string): string {
    const map: Record<string, string> = {
      Pendiente: 'bg-yellow-100 text-yellow-800 border-l-2 border-yellow-400',
      Confirmada: 'bg-primary/15 text-primary border-l-2 border-primary',
      Cancelada: 'bg-red-100 text-red-700 border-l-2 border-red-400',
      Completada: 'bg-green-100 text-green-700 border-l-2 border-green-400',
      EnProceso: 'bg-purple-100 text-purple-700 border-l-2 border-purple-400',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600';
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private emptyForm(): CreateCitaRequest {
    return {
      clienteId: '', fotografoId: '', fechaHora: '',
      duracionMinutos: 60, servicio: '', notas: '', ubicacion: '',
    };
  }
}