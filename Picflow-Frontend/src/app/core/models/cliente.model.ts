export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  cedula: string;
  direccion: string;
  notas: string;
  fechaRegistro: string;
  saldoFavor: number;
}

export interface CreateClienteRequest {
  nombre: string;
  telefono: string;
  email: string;
  cedula: string;
  direccion: string;
  notas: string;
}