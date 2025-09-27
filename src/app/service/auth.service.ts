import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { TokenMonitorService } from './token-monitor.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  store?: {
    id: string;
    name: string;
    description: string;
    phone: string;
    identifier: string;
  };
}

export interface User {
  username: string;
  role: string;
  store?: {
    id: string;
    name: string;
    description: string;
    phone: string;
    identifier: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenMonitor: TokenMonitorService | null = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private injector: Injector
  ) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      if (this.isTokenExpired()) {
        console.warn('Token expirado encontrado na inicialização. Limpando dados...');
        this.logout();
      } else {
        this.currentUserSubject.next(JSON.parse(user));
        this.getTokenMonitor()?.restartMonitoring();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = this.configService.getApiUrl('/auth/login');
    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.username,
          role: response.role,
          store: response.store
        }));
        this.currentUserSubject.next({
          username: response.username,
          role: response.role,
          store: response.store
        });
        this.getTokenMonitor()?.restartMonitoring();
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const url = this.configService.getApiUrl('/auth/register');
    return this.http.post<AuthResponse>(url, userData).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.username,
          role: response.role,
          store: response.store
        }));
        this.currentUserSubject.next({
          username: response.username,
          role: response.role,
          store: response.store
        });
        this.getTokenMonitor()?.restartMonitoring();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.getTokenMonitor()?.stopMonitoring();
    console.log('Usuário deslogado com sucesso');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  isStoreOwner(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'STORE_OWNER';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentStoreId(): string | null {
    const user = this.currentUserSubject.value;
    return user?.store?.id || null;
  }

  getCurrentStore(): User['store'] | null {
    const user = this.currentUserSubject.value;
    return user?.store || null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token expirado detectado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  forceLogout(): void {
    console.warn('Forçando logout devido a token inválido/expirado');
    this.logout();
    window.location.href = '/';
  }

  isAuthenticatedAndValid(): boolean {
    return this.isAuthenticated() && !this.isTokenExpired();
  }

  private getTokenMonitor(): TokenMonitorService | null {
    if (!this.tokenMonitor) {
      try {
        this.tokenMonitor = this.injector.get(TokenMonitorService);
      } catch (error) {
        console.warn('TokenMonitorService não disponível:', error);
        return null;
      }
    }
    return this.tokenMonitor;
  }
}
