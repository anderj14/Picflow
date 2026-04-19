export type EstadoFactura = 'Pendiente' | 'PagoParcial' | 'Pagada' | 'Anulada';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Otro';

export interface ItemFactura {
  servicioId: string;
  descripcion: string;
  codigoBarras: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pago {
  id: string;
  facturaId: string;
  fecha: string;
  monto: number;
  metodo: MetodoPago;
  referencia: string;
  notas: string;
}

export interface PagoDetalle extends Pago {
  numeroFactura: string;
}

export interface HistorialPagos {
  clienteId: string;
  nombreCliente: string;
  saldoFavor: number;
  pagos: PagoDetalle[];
}

export interface Factura {
  id: string;
  numeroFactura: string;
  clienteId: string;
  nombreCliente: string;
  citaId: string;
  fecha: string;
  items: ItemFactura[];
  subtotal: number;
  impuesto: number;
  total: number;
  totalPagado: number;
  saldoPendiente: number;
  saldoFavorAplicado: number;
  estado: EstadoFactura;
  preOrdenId?: string;
  notas: string;
  pagos: Pago[];
}
