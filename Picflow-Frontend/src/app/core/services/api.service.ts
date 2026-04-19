import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, CreateClienteRequest } from '../models/cliente.model';
import { Usuario, RolUsuario } from '../models/usuario.model';
import { Cita, CreateCitaRequest } from '../models/cita.model';
import { Factura, HistorialPagos } from '../models/factura.model';
import { Fotografia } from '../models/fotografia.model';
import { Categoria, Servicio, CreateCategoriaRequest, CreateServicioRequest, SubCategoria } from '../models/catalogo.model';
import { PreOrden } from '../models/preorden.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // ── Clientes ──────────────────────────────────────────────────────────────
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/clientes`);
  }

  getClienteById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/clientes/${id}`);
  }

  searchClientes(q: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/clientes/search`, {
      params: new HttpParams().set('q', q)
    });
  }

  createCliente(data: CreateClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.base}/clientes`, data);
  }

  updateCliente(id: string, data: Partial<CreateClienteRequest>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base}/clientes/${id}`, data);
  }

  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/clientes/${id}`);
  }

  // ── Citas ─────────────────────────────────────────────────────────────────
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.base}/citas`);
  }

  getCitasByCliente(clienteId: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.base}/citas/cliente/${clienteId}`);
  }

  getCitasByFecha(desde: string, hasta: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.base}/citas/rango`, {
      params: new HttpParams().set('desde', desde).set('hasta', hasta)
    });
  }

  createCita(data: CreateCitaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${this.base}/citas`, data);
  }

  cambiarEstadoCita(id: string, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.base}/citas/${id}/estado`, JSON.stringify(estado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteCita(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/citas/${id}`);
  }

  // ── Facturas ──────────────────────────────────────────────────────────────
  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.base}/facturas/pendientes`);
  }

  getFacturasByCliente(clienteId: string): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.base}/facturas/cliente/${clienteId}`);
  }

  getFacturaById(id: string): Observable<Factura> {
    return this.http.get<Factura>(`${this.base}/facturas/${id}`);
  }

  createFactura(data: any): Observable<Factura> {
    return this.http.post<Factura>(`${this.base}/facturas`, data);
  }

  registrarPago(facturaId: string, data: any): Observable<any> {
    return this.http.post(`${this.base}/facturas/${facturaId}/pagos`, data);
  }

  getHistorialPagos(clienteId: string): Observable<HistorialPagos> {
    return this.http.get<HistorialPagos>(`${this.base}/pagos/cliente/${clienteId}`);
  }

  // ── Fotografías ───────────────────────────────────────────────────────────
  getFotografiasByCliente(clienteId: string): Observable<Fotografia[]> {
    return this.http.get<Fotografia[]>(`${this.base}/fotografias/cliente/${clienteId}`);
  }

  getFotografiasByCita(citaId: string): Observable<Fotografia[]> {
    return this.http.get<Fotografia[]>(`${this.base}/fotografias/cita/${citaId}`);
  }

  uploadFotografia(formData: FormData): Observable<Fotografia> {
    return this.http.post<Fotografia>(`${this.base}/fotografias/upload`, formData);
  }

  marcarEntregadas(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.base}/fotografias/entregar`, ids);
  }

  deleteFotografia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/fotografias/${id}`);
  }

  agregarOpcionImpresion(fotografiaId: string, data: any): Observable<Fotografia> {
    return this.http.post<Fotografia>(`${this.base}/fotografias/${fotografiaId}/opciones-impresion`, data);
  }

  eliminarOpcionImpresion(fotografiaId: string, subCategoriaId: string): Observable<Fotografia> {
    return this.http.delete<Fotografia>(`${this.base}/fotografias/${fotografiaId}/opciones-impresion/${subCategoriaId}`);
  }

  // ── Usuarios ───────────────────────────────────────────────────────────────
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/usuarios`);
  }

  registerUsuario(data: { nombre: string; email: string; password: string; rol: RolUsuario }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/auth/register`, data);
  }

  updateRolUsuario(id: string, rol: RolUsuario): Observable<{ id: string; rol: string }> {
    return this.http.patch<{ id: string; rol: string }>(`${this.base}/usuarios/${id}/rol`, { rol });
  }

  getFotografos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/usuarios/fotografos`);
  }

  // ── Categorías ────────────────────────────────────────────────────────────
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/categorias`);
  }

  getCategoriaById(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/categorias/${id}`);
  }

  createCategoria(data: CreateCategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.base}/categorias`, data);
  }

  updateCategoria(id: string, data: { nombre: string; descripcion: string }): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/categorias/${id}`, data);
  }

  agregarSubCategoria(categoriaId: string, data: { nombre: string; tipo: string }): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.base}/categorias/${categoriaId}/subcategorias`, data);
  }

  deleteCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/categorias/${id}`);
  }

  // ── Servicios ─────────────────────────────────────────────────────────────
  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.base}/servicios`);
  }

  getServiciosByCategoria(categoriaId: string): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.base}/servicios/categoria/${categoriaId}`);
  }

  getServicioByBarcode(codigo: string): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.base}/servicios/barcode/${codigo}`);
  }

  createServicio(data: CreateServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.base}/servicios`, data);
  }

  updateServicio(id: string, data: CreateServicioRequest): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.base}/servicios/${id}`, data);
  }

  deleteServicio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/servicios/${id}`);
  }

  // ── Pre-Órdenes ───────────────────────────────────────────────────────────
  getPreOrdenes(): Observable<PreOrden[]> {
    return this.http.get<PreOrden[]>(`${this.base}/preordenes/pendientes`);
  }

  getPreOrdenesByCliente(clienteId: string): Observable<PreOrden[]> {
    return this.http.get<PreOrden[]>(`${this.base}/preordenes/cliente/${clienteId}`);
  }

  getPreOrdenById(id: string): Observable<PreOrden> {
    return this.http.get<PreOrden>(`${this.base}/preordenes/${id}`);
  }

  createPreOrden(data: any): Observable<PreOrden> {
    return this.http.post<PreOrden>(`${this.base}/preordenes`, data);
  }

  confirmarPreOrden(id: string): Observable<PreOrden> {
    return this.http.patch<PreOrden>(`${this.base}/preordenes/${id}/confirmar`, {});
  }

  convertirPreOrdenAFactura(id: string, data: any): Observable<any> {
    return this.http.post(`${this.base}/preordenes/${id}/convertir`, data);
  }

  cancelarPreOrden(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/preordenes/${id}/cancelar`, {});
  }
}
