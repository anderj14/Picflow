export type TipoSubCategoria = 'Tamanio' | 'TipoAcabado';

export interface SubCategoria {
  id: string;
  nombre: string;
  tipo: TipoSubCategoria;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  subCategorias: SubCategoria[];
  activa: boolean;
  creadoEn: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  nombreCategoria: string;
  subCategoriaId: string;
  nombreSubCategoria: string;
  precioBase: number;
  codigoBarras: string;
  activo: boolean;
  creadoEn: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
  descripcion: string;
  subCategorias: { nombre: string; tipo: TipoSubCategoria }[];
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  subCategoriaId: string;
  precioBase: number;
  codigoBarras: string;
}
