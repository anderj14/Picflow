export interface Fotografia {
  id: string;
  citaId: string;
  clienteId: string;
  urlCloudinary: string;
  publicId: string;
  titulo: string;
  descripcion: string;
  entregada: boolean;
  tamanioBytes: number;
  formato: string;
  fechaSubida: string;
}