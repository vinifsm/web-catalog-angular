import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../model/category.model';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
  })
export class CategoryService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getAllCategories(): Observable<Category[]> {
    const url = this.configService.getApiUrl('/categories');
    return this.http.get<Category[]>(url);
  }

  getCategoriesByStore(storeId: string): Observable<Category[]> {
    const url = this.configService.getApiUrl(`/categories?storeId=${storeId}`);
    return this.http.get<Category[]>(url);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(this.configService.getApiUrl(`/categories/${id}`));
  }
}
