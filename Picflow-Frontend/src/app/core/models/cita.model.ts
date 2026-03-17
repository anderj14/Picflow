export type EstadoCita = 'Pendiente' | 'Confirmada' | 'EnProceso' | 'Completada' | 'Cancelada';

export interface Cita {
  id: string;
  clienteId: string;
  nombreCliente: string;
  fotografoId: string;
  nombreFotografo: string;
  fechaHora: string;
  duracionMinutos: number;
  servicio: string;
  estado: EstadoCita;
  notas: string;
  ubicacion: string;
  creadoEn: string;
}

export interface CreateCitaRequest {
  clienteId: string;
  fotografoId: string;
  fechaHora: string;
  duracionMinutos: number;
  servicio: string;
  notas: string;
  ubicacion: string;
}