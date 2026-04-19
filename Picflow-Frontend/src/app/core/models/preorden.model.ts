import { OpcionImpresion } from './fotografia.model';

export type EstadoPreOrden = 'Borrador' | 'Confirmada' | 'Convertida' | 'Cancelada';

export interface ItemPreOrden {
  servicioId: string;
  descripcion: string;
  codigoBarras: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  opcionImpresion?: OpcionImpresion;
}

export interface PreOrden {
  id: string;
  numeroPreOrden: string;
  clienteId: string;
  nombreCliente: string;
  citaId: string;
  items: ItemPreOrden[];
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoPreOrden;
  facturaId?: string;
  notas: string;
  creadoEn: string;
}
