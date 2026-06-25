export interface SlotDisponibilidad {
  hora: string;
  fechaHora: string;
  disponible: boolean;
}

export interface ReservaPublicaRequest {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string;
  servicio: string;
  fechaHora: string;
  duracionMinutos: number;
  notas: string;
  ubicacion: string;
}

export interface ReservaConfirmadaResponse {
  citaId: string;
  nombreCliente: string;
  email: string;
  fechaHora: string;
  servicio: string;
  estado: string;
  mensaje: string;
}
