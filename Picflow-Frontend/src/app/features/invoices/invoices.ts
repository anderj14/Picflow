import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Factura, EstadoFactura, MetodoPago, Pago } from '../../core/models/factura.model';
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
  showDetailModal = signal(false);
  saving = signal(false);
  detailLoading = signal(false);
  errorMsg = signal('');
  selectedFactura = signal<Factura | null>(null);
  detailFactura = signal<Factura | null>(null);
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

  get subtotal(): number {
    return this.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  }

  get total(): number {
    return this.subtotal + (this.subtotal * this.form.impuesto / 100);
  }

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

  registrarPagoDetalle() {
    const factura = this.detailFactura();
    if (!factura || this.pagoForm.monto <= 0) return;

    this.saving.set(true);
    this.api.registrarPago(factura.id, this.pagoForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadAll();
        this.api.getFacturaById(factura.id).subscribe({
          next: (f) => {
            this.detailFactura.set(f);
            this.pagoForm = { monto: f.saldoPendiente, metodo: 'Efectivo', referencia: '', notas: '' };
          },
        });
      },
      error: (err) => {
        alert(err.error?.message ?? 'Error al registrar pago.');
        this.saving.set(false);
      },
    });
  }

  openDetail(factura: Factura) {
    this.detailFactura.set(factura);
    this.pagoForm = { monto: factura.saldoPendiente, metodo: 'Efectivo', referencia: '', notas: '' };
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.api.getFacturaById(factura.id).subscribe({
      next: (f) => {
        this.detailFactura.set(f);
        this.pagoForm = { monto: f.saldoPendiente, metodo: 'Efectivo', referencia: '', notas: '' };
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
  }

  closeDetail() {
    this.showDetailModal.set(false);
    this.detailFactura.set(null);
  }

  printFactura(factura: Factura) {
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(this.buildFacturaHtml(factura));
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  printRecibo(pago: Pago, factura: Factura) {
    const win = window.open('', '_blank', 'width=600,height=700');
    if (!win) return;
    win.document.write(this.buildReciboHtml(pago, factura));
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  private buildFacturaHtml(f: Factura): string {
    const itemsHtml = f.items.map(i => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${i.descripcion}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center">${i.cantidad}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${this.formatCurrency(i.precioUnitario)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${this.formatCurrency(i.subtotal)}</td>
      </tr>`).join('');

    const pagosHtml = f.pagos?.length ? `
      <div style="margin-top:32px">
        <h3 style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">Historial de Pagos</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px;text-align:left;font-weight:600;color:#64748b">Fecha</th>
              <th style="padding:8px;text-align:left;font-weight:600;color:#64748b">Método</th>
              <th style="padding:8px;text-align:left;font-weight:600;color:#64748b">Referencia</th>
              <th style="padding:8px;text-align:right;font-weight:600;color:#64748b">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${f.pagos.map(p => `
              <tr>
                <td style="padding:8px">${this.formatDate(p.fecha)}</td>
                <td style="padding:8px">${p.metodo}</td>
                <td style="padding:8px">${p.referencia || '—'}</td>
                <td style="padding:8px;text-align:right;font-weight:600;color:#16a34a">${this.formatCurrency(p.monto)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Factura ${f.numeroFactura}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;color:#1e293b;padding:40px;max-width:760px;margin:0 auto}@media print{body{padding:20px}}</style>
    </head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e2e8f0">
        <div>
          <h1 style="font-size:28px;font-weight:900;color:#186adc;letter-spacing:-.02em">Picflow</h1>
          <p style="color:#64748b;font-size:13px;margin-top:4px">Estudio de Fotografía</p>
        </div>
        <div style="text-align:right">
          <h2 style="font-size:20px;font-weight:800;color:#1e293b">${f.numeroFactura}</h2>
          <p style="color:#64748b;font-size:13px;margin-top:4px">${this.formatDate(f.fecha)}</p>
          <span style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;background:${f.estado === 'Pagada' ? '#dcfce7' : '#fef9c3'};color:${f.estado === 'Pagada' ? '#16a34a' : '#ca8a04'}">${f.estado}</span>
        </div>
      </div>
      <div style="margin-bottom:28px">
        <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Facturar a</p>
        <p style="font-size:16px;font-weight:700">${f.nombreCliente}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 8px;text-align:left;font-weight:600;color:#64748b;font-size:12px;text-transform:uppercase">Descripción</th>
            <th style="padding:10px 8px;text-align:center;font-weight:600;color:#64748b;font-size:12px;text-transform:uppercase">Cant.</th>
            <th style="padding:10px 8px;text-align:right;font-weight:600;color:#64748b;font-size:12px;text-transform:uppercase">P. Unit.</th>
            <th style="padding:10px 8px;text-align:right;font-weight:600;color:#64748b;font-size:12px;text-transform:uppercase">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div style="width:240px">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b">
            <span>Subtotal</span><span>${this.formatCurrency(f.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b">
            <span>ITBIS (${f.impuesto}%)</span><span>${this.formatCurrency(f.subtotal * f.impuesto / 100)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:800;border-top:2px solid #e2e8f0;margin-top:4px">
            <span>Total</span><span style="color:#186adc">${this.formatCurrency(f.total)}</span>
          </div>
          ${f.totalPagado > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#16a34a">
            <span>Pagado</span><span>${this.formatCurrency(f.totalPagado)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;font-weight:700;color:#ef4444">
            <span>Saldo Pendiente</span><span>${this.formatCurrency(f.saldoPendiente)}</span>
          </div>` : ''}
        </div>
      </div>
      ${f.notas ? `<div style="margin-top:24px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b"><strong>Notas:</strong> ${f.notas}</div>` : ''}
      ${pagosHtml}
      <div style="margin-top:48px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px">Generado por Picflow · ${new Date().toLocaleDateString('es-DO')}</div>
    </body></html>`;
  }

  private buildReciboHtml(p: Pago, f: Factura): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Recibo de Pago</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;color:#1e293b;padding:40px;max-width:480px;margin:0 auto}@media print{body{padding:20px}}</style>
    </head><body>
      <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0">
        <h1 style="font-size:26px;font-weight:900;color:#186adc">Picflow</h1>
        <p style="color:#64748b;font-size:12px;margin-top:4px">Estudio de Fotografía</p>
        <h2 style="font-size:16px;font-weight:700;margin-top:16px">Recibo de Pago</h2>
      </div>
      <div style="space-y:12px">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
          <span style="color:#64748b">Factura</span><span style="font-weight:700">${f.numeroFactura}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
          <span style="color:#64748b">Cliente</span><span style="font-weight:700">${f.nombreCliente}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
          <span style="color:#64748b">Fecha</span><span>${this.formatDate(p.fecha)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px">
          <span style="color:#64748b">Método</span><span>${p.metodo}</span>
        </div>
        ${p.referencia ? `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px"><span style="color:#64748b">Referencia</span><span>${p.referencia}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding:16px 0;margin-top:8px;font-size:20px;font-weight:800;border-top:2px solid #e2e8f0">
          <span>Monto Pagado</span><span style="color:#16a34a">${this.formatCurrency(p.monto)}</span>
        </div>
      </div>
      <div style="margin-top:24px;text-align:center;font-size:11px;color:#94a3b8">Generado por Picflow · ${new Date().toLocaleDateString('es-DO')}</div>
    </body></html>`;
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