import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, AuthService } from '../../../service';

export interface Category {
  id?: string;
  name: string;
  storeId?: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  currentCategory: Category = {
    name: '',
    storeId: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    const currentStoreId = this.authService.getCurrentStoreId();
    const url = currentStoreId 
      ? this.configService.getApiUrl(`/categories?storeId=${currentStoreId}`)
      : this.configService.getApiUrl('/categories');
    
    this.http.get<Category[]>(url, { headers })
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.filteredCategories = categories;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
          this.isLoading = false;
        }
      });
  }

  searchCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.categories;
      return;
    }

    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.isEditing = false;
    const currentStoreId = this.authService.getCurrentStoreId();
    this.currentCategory = {
      name: '',
      storeId: currentStoreId || ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(category: Category): void {
    this.isEditing = true;
    this.currentCategory = { ...category };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCategory = {
      name: '',
      storeId: ''
    };
    this.errorMessage = '';
  }

  saveCategory(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    let request;
    
    if (this.isEditing) {
      const url = `${this.configService.getApiUrl(`/categories/${this.currentCategory.id}`)}?name=${encodeURIComponent(this.currentCategory.name)}`;
      request = this.http.put<Category>(url, {}, { headers });
    } else {
      request = this.http.post<Category>(this.configService.getApiUrl('/categories'), this.currentCategory, { headers });
    }

    request.subscribe({
      next: (category) => {
        if (this.isEditing) {
          const index = this.categories.findIndex(c => c.id === category.id);
          if (index !== -1) {
            this.categories[index] = category;
          }
        } else {
          this.categories.push(category);
        }
        this.filteredCategories = [...this.categories];
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao salvar categoria:', error);
        this.errorMessage = 'Erro ao salvar categoria';
        this.isLoading = false;
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.delete(this.configService.getApiUrl(`/categories/${category.id}`), { headers })
      .subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== category.id);
          this.filteredCategories = [...this.categories];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir categoria:', error);
          this.errorMessage = 'Erro ao excluir categoria';
          this.isLoading = false;
        }
      });
  }

  private validateForm(): boolean {
    if (!this.currentCategory.name.trim()) {
      this.errorMessage = 'Nome da categoria é obrigatório';
      return false;
    }
    return true;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
