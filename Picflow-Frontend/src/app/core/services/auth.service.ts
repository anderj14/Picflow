import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { RolUsuario } from '../models/usuario.model';

const TOKEN_KEY = 'picflow_token';
const USER_KEY = 'picflow_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api';

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user = signal<AuthResponse | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  );

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly userRol = computed(() => this._user()?.rol ?? null);
  readonly userName = computed(() => this._user()?.nombre ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response));
        this._token.set(response.token);
        this._user.set(response);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(rol: RolUsuario): boolean {
    return this._user()?.rol === rol;
  }
}