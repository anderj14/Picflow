import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, CreateClienteRequest } from '../models/cliente.model';
import { Cita, CreateCitaRequest } from '../models/cita.model';
import { Factura } from '../models/factura.model';
import { Fotografia } from '../models/fotografia.model';
import { SlotDisponibilidad, ReservaPublicaRequest, ReservaConfirmadaResponse } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = '/api';

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
    return this.http.get<Factura[]>(`${this.base}/facturas`);
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

  // ── Usuarios ───────────────────────────────────────────────────────────────
  getFotografos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/usuarios/fotografos`);
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/usuarios`);
  }

  registrarUsuario(data: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, data);
  }

  updateRolUsuario(id: string, rol: string): Observable<any> {
    return this.http.patch(`${this.base}/usuarios/${id}/rol`, JSON.stringify(rol), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  toggleActivoUsuario(id: string): Observable<any> {
    return this.http.patch(`${this.base}/usuarios/${id}/toggle`, {});
  }

  // ── Pública (sin auth) ────────────────────────────────────────────────────
  getDisponibilidad(fecha: string): Observable<SlotDisponibilidad[]> {
    return this.http.get<SlotDisponibilidad[]>(`${this.base}/public/disponibilidad`, {
      params: new HttpParams().set('fecha', fecha)
    });
  }

  reservarCita(data: ReservaPublicaRequest): Observable<ReservaConfirmadaResponse> {
    return this.http.post<ReservaConfirmadaResponse>(`${this.base}/public/reservar`, data);
  }
}