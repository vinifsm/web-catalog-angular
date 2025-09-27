import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  constructor() { }

  getApiBaseUrl(): string {
    const isProd = this.isProduction();
    const url = isProd ? environment.apiBaseUrlProduction : environment.apiBaseUrl;
    return url;
  }

  getApiTimeout(): number {
    return environment.apiTimeout;
  }

  isProduction(): boolean {
    return environment.production;
  }

  getApiUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
}
