import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Cliente, CreateClienteRequest } from '../../core/models/cliente.model';
import { Cita } from '../../core/models/cita.model';
import { Factura } from '../../core/models/factura.model';
import { Fotografia } from '../../core/models/fotografia.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clients.html',
})
export class Clients implements OnInit {
  clientes      = signal<Cliente[]>([]);
  loading       = signal(true);
  searchQuery   = signal('');
  showModal     = signal(false);
  saving        = signal(false);
  editingId     = signal<string | null>(null);
  errorMsg      = signal('');

  // Pagination
  currentPage   = signal(1);
  pageSize      = 8;

  // Transaction history
  showHistory      = signal(false);
  selectedCliente  = signal<Cliente | null>(null);
  historyLoading   = signal(false);
  historyTab       = signal<'citas' | 'fotografias' | 'facturas'>('citas');
  citas            = signal<Cita[]>([]);
  facturas         = signal<Factura[]>([]);
  fotografias      = signal<Fotografia[]>([]);

  readonly totalCobrado = computed(() =>
    this.facturas().reduce((sum, f) => sum + f.totalPagado, 0)
  );

  form: CreateClienteRequest = this.emptyForm();

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.cedula.includes(q)
    );
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filtered().length / this.pageSize)
  );

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading.set(true);
    this.api.getClientes().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  openHistory(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.historyTab.set('citas');
    this.historyLoading.set(true);
    this.citas.set([]);
    this.facturas.set([]);
    this.fotografias.set([]);
    this.showHistory.set(true);

    forkJoin({
      citas:       this.api.getCitasByCliente(cliente.id),
      facturas:    this.api.getFacturasByCliente(cliente.id),
      fotografias: this.api.getFotografiasByCliente(cliente.id),
    }).subscribe({
      next: ({ citas, facturas, fotografias }) => {
        this.citas.set(citas);
        this.facturas.set(facturas);
        this.fotografias.set(fotografias);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false),
    });
  }

  closeHistory() {
    this.showHistory.set(false);
    this.selectedCliente.set(null);
  }

  setHistoryTab(tab: 'citas' | 'fotografias' | 'facturas') {
    this.historyTab.set(tab);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(cliente: Cliente) {
    this.form = {
      nombre:    cliente.nombre,
      telefono:  cliente.telefono,
      email:     cliente.email,
      cedula:    cliente.cedula,
      direccion: cliente.direccion,
      notas:     cliente.notas,
    };
    this.editingId.set(cliente.id);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
    if (!this.form.nombre.trim() || !this.form.email.trim()) {
      this.errorMsg.set('Nombre y correo son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const id = this.editingId();
    const request$ = id
      ? this.api.updateCliente(id, this.form)
      : this.api.createCliente(this.form);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadClientes(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al guardar.');
        this.saving.set(false);
      },
    });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return;
    this.api.deleteCliente(id).subscribe({
      next: () => this.loadClientes(),
      error: ()  => alert('No se pudo eliminar el cliente.'),
    });
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  }

  estadoCitaBadgeClass(estado: string): string {
    const colors: Record<string, string> = {
      Pendiente:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      Confirmada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      EnProceso:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Completada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Cancelada:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return `text-xs font-semibold px-2.5 py-1 rounded-full ${colors[estado] ?? 'bg-slate-100 text-slate-600'}`;
  }

  estadoFacturaBadgeClass(estado: string): string {
    const colors: Record<string, string> = {
      Pendiente:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      PagoParcial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Pagada:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Anulada:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return `text-xs font-semibold px-2.5 py-1 rounded-full ${colors[estado] ?? 'bg-slate-100 text-slate-600'}`;
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  private emptyForm(): CreateClienteRequest {
    return { nombre: '', telefono: '', email: '', cedula: '', direccion: '', notas: '' };
  }
}
