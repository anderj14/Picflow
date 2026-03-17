export type RolUsuario = 'Administrador' | 'Fotografo' | 'Recepcionista';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}