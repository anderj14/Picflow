import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PreOrden, EstadoPreOrden, ItemPreOrden } from '../../core/models/preorden.model';
import { Cliente } from '../../core/models/cliente.model';
import { Servicio } from '../../core/models/catalogo.model';

interface ItemForm {
  servicioId: string;
  descripcion: string;
  codigoBarras: string;
  cantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-pre-orders',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pre-orders.html',
})
export class PreOrders implements OnInit {
  preOrdenes = signal<PreOrden[]>([]);
  clientes = signal<Cliente[]>([]);
  servicios = signal<Servicio[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal('');

  showModal = signal(false);
  showConvertirModal = signal(false);
  selectedPreOrden = signal<PreOrden | null>(null);
  filterEstado = signal<EstadoPreOrden | 'Todas'>('Todas');
  searchQuery = signal('');

  form = this.emptyForm();
  items: ItemForm[] = [this.emptyItem()];
  convertirForm = { impuesto: 18, notas: '', aplicarSaldoFavor: false };

  readonly filtered = computed(() => {
    let result = this.preOrdenes();
    const q = this.searchQuery().toLowerCase();
    const estado = this.filterEstado();

    if (estado !== 'Todas') result = result.filter(p => p.estado === estado);
    if (q) result = result.filter(p =>
      p.nombreCliente.toLowerCase().includes(q) ||
      p.numeroPreOrden.toLowerCase().includes(q)
    );
    return result;
  });

  readonly subtotal = computed(() =>
    this.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
  );

  readonly total = computed(() =>
    this.subtotal() + (this.subtotal() * this.form.impuesto / 100)
  );

  readonly estadoOptions: (EstadoPreOrden | 'Todas')[] = [
    'Todas', 'Borrador', 'Confirmada', 'Convertida', 'Cancelada'
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.api.getClientes().subscribe({ next: d => this.clientes.set(d) });
    this.api.getServicios().subscribe({ next: d => this.servicios.set(d) });
    this.api.getPreOrdenes().subscribe({
      next: d => { this.preOrdenes.set(d); this.loading.set(false); },
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

  onServicioChange(item: ItemForm) {
    const servicio = this.servicios().find(s => s.id === item.servicioId);
    if (servicio) {
      item.descripcion = servicio.nombre;
      item.codigoBarras = servicio.codigoBarras;
      item.precioUnitario = servicio.precioBase;
    }
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

    this.api.createPreOrden({
      clienteId: this.form.clienteId,
      citaId: this.form.citaId,
      impuesto: this.form.impuesto,
      notas: this.form.notas,
      items: this.items.map(i => ({
        servicioId: i.servicioId,
        descripcion: i.descripcion,
        codigoBarras: i.codigoBarras,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
    }).subscribe({
      next: () => { this.closeModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al crear la pre-orden.');
        this.saving.set(false);
      },
    });
  }

  confirmar(id: string) {
    this.api.confirmarPreOrden(id).subscribe({ next: () => this.loadAll() });
  }

  openConvertir(preOrden: PreOrden) {
    this.selectedPreOrden.set(preOrden);
    this.convertirForm = { impuesto: preOrden.impuesto, notas: '', aplicarSaldoFavor: false };
    this.showConvertirModal.set(true);
  }

  closeConvertirModal() {
    this.showConvertirModal.set(false);
    this.selectedPreOrden.set(null);
  }

  convertirAFactura() {
    const po = this.selectedPreOrden();
    if (!po) return;
    this.saving.set(true);

    this.api.convertirPreOrdenAFactura(po.id, {
      impuesto: this.convertirForm.impuesto,
      notas: this.convertirForm.notas,
      aplicarSaldoFavor: this.convertirForm.aplicarSaldoFavor,
    }).subscribe({
      next: () => { this.closeConvertirModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        alert(err.error?.message ?? 'Error al convertir la pre-orden.');
        this.saving.set(false);
      },
    });
  }

  cancelar(id: string) {
    if (!confirm('¿Cancelar esta pre-orden?')) return;
    this.api.cancelarPreOrden(id).subscribe({ next: () => this.loadAll() });
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

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      Borrador: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      Confirmada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Convertida: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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
    return { servicioId: '', descripcion: '', codigoBarras: '', cantidad: 1, precioUnitario: 0 };
  }
}
