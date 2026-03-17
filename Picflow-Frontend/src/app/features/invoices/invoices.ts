import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Factura, EstadoFactura, MetodoPago } from '../../core/models/factura.model';
import { Cliente } from '../../core/models/cliente.model';

interface ItemForm {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './invoices.html',
})
export class Invoices implements OnInit {
  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showPagoModal = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  selectedFactura = signal<Factura | null>(null);
  filterEstado = signal<EstadoFactura | 'Todas'>('Todas');
  searchQuery = signal('');

  // New invoice form
  form = this.emptyForm();
  items: ItemForm[] = [this.emptyItem()];

  // Payment form
  pagoForm = { monto: 0, metodo: 'Efectivo' as MetodoPago, referencia: '', notas: '' };

  readonly filtered = computed(() => {
    let result = this.facturas();
    const q = this.searchQuery().toLowerCase();
    const estado = this.filterEstado();

    if (estado !== 'Todas') {
      result = result.filter(f => f.estado === estado);
    }
    if (q) {
      result = result.filter(f =>
        f.nombreCliente.toLowerCase().includes(q) ||
        f.numeroFactura.toLowerCase().includes(q)
      );
    }
    return result;
  });

  readonly stats = computed(() => {
    const all = this.facturas();
    return {
      totalIngresos: all.filter(f => f.estado === 'Pagada').reduce((s, f) => s + f.total, 0),
      pendientes: all.filter(f => f.estado === 'Pendiente' || f.estado === 'PagoParcial').length,
      vencidas: all.filter(f => f.estado === 'Pendiente').length,
    };
  });

  readonly subtotal = computed(() =>
    this.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
  );

  readonly total = computed(() =>
    this.subtotal() + (this.subtotal() * this.form.impuesto / 100)
  );

  readonly estadoOptions: (EstadoFactura | 'Todas')[] = [
    'Todas', 'Pendiente', 'PagoParcial', 'Pagada', 'Anulada'
  ];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.api.getClientes().subscribe({ next: d => this.clientes.set(d) });

    // Load all client invoices — since we don't have a global endpoint
    // we load pending ones as a starting point
    this.api.getFacturas().subscribe({
      next: (data) => { this.facturas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.items = [this.emptyItem()];
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addItem() {
    this.items.push(this.emptyItem());
  }

  removeItem(index: number) {
    if (this.items.length > 1) this.items.splice(index, 1);
  }

  save() {
    if (!this.form.clienteId) {
      this.errorMsg.set('Selecciona un cliente.');
      return;
    }
    if (this.items.some(i => !i.descripcion || i.precioUnitario <= 0)) {
      this.errorMsg.set('Todos los ítems deben tener descripción y precio.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const request = {
      clienteId: this.form.clienteId,
      citaId: this.form.citaId,
      impuesto: this.form.impuesto,
      notas: this.form.notas,
      items: this.items.map(i => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
    };

    this.api.createFactura(request).subscribe({
      next: () => { this.closeModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al crear la factura.');
        this.saving.set(false);
      },
    });
  }

  openPago(factura: Factura) {
    this.selectedFactura.set(factura);
    this.pagoForm = {
      monto: factura.saldoPendiente,
      metodo: 'Efectivo',
      referencia: '',
      notas: '',
    };
    this.showPagoModal.set(true);
  }

  closePagoModal() {
    this.showPagoModal.set(false);
    this.selectedFactura.set(null);
  }

  registrarPago() {
    const factura = this.selectedFactura();
    if (!factura || this.pagoForm.monto <= 0) return;

    this.saving.set(true);
    this.api.registrarPago(factura.id, this.pagoForm).subscribe({
      next: () => { this.closePagoModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        alert(err.error?.message ?? 'Error al registrar pago.');
        this.saving.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'DOP', maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
  
  setMetodo(metodo: string) {
    this.pagoForm.metodo = metodo as MetodoPago;
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      Pagada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PagoParcial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Anulada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600';
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private emptyForm() {
    return { clienteId: '', citaId: '', impuesto: 18, notas: '' };
  }

  private emptyItem(): ItemForm {
    return { descripcion: '', cantidad: 1, precioUnitario: 0 };
  }
}