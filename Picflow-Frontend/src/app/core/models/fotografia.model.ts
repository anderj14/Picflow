export interface OpcionImpresion {
  categoriaId: string;
  nombreCategoria: string;
  subCategoriaId: string;
  nombreSubCategoria: string;
  servicioId: string;
  tamanio: string;
  tipoAcabado: string;
  cantidad: number;
  precioUnitario: number;
}

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
  opcionesImpresion: OpcionImpresion[];
}
