import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
  })
export class ProductService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getProducts(page = 0, limit = 20, categoryId?: string): Observable<Product[]> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
  
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    const url = this.configService.getApiUrl('/products');
    console.log('🛒 ProductService - Fazendo requisição para:', url);
    console.log('🛒 ProductService - Parâmetros:', { page, limit, categoryId });
  
    return this.http
      .get<{ content: Product[] }>(url, { params })
      .pipe(
        map(res => {
          console.log('🛒 ProductService - Resposta recebida:', res);
          return res.content;
        })
      );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(this.configService.getApiUrl(`/products/${id}`));
  }
}
