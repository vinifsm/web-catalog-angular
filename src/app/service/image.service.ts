import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Image } from '../model/image.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getAllImages(): Observable<Image[]> {
    const url = this.configService.getApiUrl('/images');
    return this.http.get<Image[]>(url);
  }

  getImageById(id: string): Observable<Image> {
    const url = this.configService.getApiUrl(`/images/${id}`);
    return this.http.get<Image>(url);
  }

  uploadImage(file: File, type: string): Observable<Image> {
    const url = this.configService.getApiUrl('/images/upload');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.http.post<Image>(url, formData);
  }

  updateImage(id: string, file: File): Observable<Image> {
    const url = this.configService.getApiUrl(`/images/upload/${id}`);
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.put<Image>(url, formData);
  }

  deleteImage(id: string): Observable<void> {
    const url = this.configService.getApiUrl(`/images/${id}`);
    return this.http.delete<void>(url);
  }

  getImageUrl(filename: string): string {
    return this.configService.getApiUrl(`/images/file/${filename}`);
  }
}
