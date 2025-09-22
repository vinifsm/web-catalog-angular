import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  constructor() { }

  /**
   * Retorna a URL base da API
   */
  getApiBaseUrl(): string {
    const isProd = this.isProduction();
    const url = isProd ? environment.apiBaseUrlProduction : environment.apiBaseUrl;
    
    // Debug log para verificar qual URL está sendo usada
    console.log('🔧 ConfigService - Ambiente:', isProd ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
    console.log('🔧 ConfigService - URL da API:', url);
    
    return url;
  }

  /**
   * Retorna o timeout para requisições HTTP
   */
  getApiTimeout(): number {
    return environment.apiTimeout;
  }

  /**
   * Retorna se está em modo de produção
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Retorna a URL completa para um endpoint específico
   * @param endpoint - O endpoint da API (ex: '/categories', '/products')
   */
  getApiUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
}
