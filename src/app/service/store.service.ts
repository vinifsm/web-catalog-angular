import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '../model/store.model';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getStoreByIdentifier(identifier: string): Observable<Store> {
    const url = this.configService.getApiUrl(`/stores/identity/${identifier}`);
    return this.http.get<Store>(url);
  }

  getAllStores(): Observable<Store[]> {
    const url = this.configService.getApiUrl('/stores');
    return this.http.get<Store[]>(url);
  }

  getStoreById(id: string): Observable<Store> {
    const url = this.configService.getApiUrl(`/stores/${id}`);
    return this.http.get<Store>(url);
  }
}
