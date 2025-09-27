import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, AuthService } from '../../../service';

export interface Store {
  id?: string;
  name: string;
  description: string;
  phone: string;
  identifier: string;
  image?: {
    id: string;
    url: string;
    fileName: string;
  };
}

@Component({
  selector: 'app-stores',
  standalone: true,
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  filteredStores: Store[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  currentStore: Store = {
    name: '',
    description: '',
    phone: '',
    identifier: ''
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
    this.loadStores();
  }

  loadStores(): void {
    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.get<Store[]>(this.configService.getApiUrl('/stores'), { headers })
      .subscribe({
        next: (stores) => {
          this.stores = stores;
          this.filteredStores = stores;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar lojas:', error);
          this.isLoading = false;
        }
      });
  }

  searchStores(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStores = this.stores;
      return;
    }

    this.filteredStores = this.stores.filter(store =>
      store.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      store.identifier.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentStore = {
      name: '',
      description: '',
      phone: '',
      identifier: ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(store: Store): void {
    this.isEditing = true;
    this.currentStore = { ...store };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.currentStore = {
      name: '',
      description: '',
      phone: '',
      identifier: ''
    };
    this.errorMessage = '';
  }

  saveStore(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditing && !this.authService.isAdmin()) {
      this.errorMessage = 'Apenas administradores podem editar lojas';
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    const storeData = {
      name: this.currentStore.name,
      description: this.currentStore.description,
      phone: this.currentStore.phone,
      identifier: this.currentStore.identifier
    };
    
    const request = this.isEditing
      ? this.http.put<Store>(this.configService.getApiUrl(`/stores/${this.currentStore.id}`), storeData, { headers })
      : this.http.post<Store>(this.configService.getApiUrl('/stores'), storeData, { headers });

    request.subscribe({
      next: (store) => {
        if (this.isEditing) {
          const index = this.stores.findIndex(s => s.id === store.id);
          if (index !== -1) {
            this.stores[index] = store;
          }
        } else {
          this.stores.push(store);
        }
        this.filteredStores = [...this.stores];
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao salvar loja:', error);
        this.errorMessage = 'Erro ao salvar loja';
        this.isLoading = false;
      }
    });
  }

  deleteStore(store: Store): void {
    if (!confirm(`Tem certeza que deseja excluir a loja "${store.name}"?`)) {
      return;
    }

    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Apenas administradores podem excluir lojas';
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.delete(this.configService.getApiUrl(`/stores/${store.id}`), { headers })
      .subscribe({
        next: () => {
          this.stores = this.stores.filter(s => s.id !== store.id);
          this.filteredStores = [...this.stores];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir loja:', error);
          this.errorMessage = 'Erro ao excluir loja';
          this.isLoading = false;
        }
      });
  }

  private validateForm(): boolean {
    if (!this.currentStore.name.trim()) {
      this.errorMessage = 'Nome é obrigatório';
      return false;
    }
    if (!this.currentStore.identifier.trim()) {
      this.errorMessage = 'Identificador é obrigatório';
      return false;
    }
    if (!this.currentStore.description.trim()) {
      this.errorMessage = 'Descrição é obrigatória';
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
