import { RolUsuario } from "./usuario.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  expira: string;
}