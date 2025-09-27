import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, AuthService } from '../../../service';
import { User, UserRequest } from '../../../model/user.model';
import { Store } from '../../../model/store.model';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  stores: Store[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  currentUser: User = {
    username: '',
    password: '',
    role: 'STORE_OWNER',
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
    this.loadStores();
    this.loadUsers();
  }

  loadStores(): void {
    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.get<Store[]>(this.configService.getApiUrl('/stores'), { headers })
      .subscribe({
        next: (stores) => {
          this.stores = stores;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar lojas:', error);
          this.isLoading = false;
        }
      });
  }

  loadUsers(): void {
    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.get<User[]>(this.configService.getApiUrl('/users'), { headers })
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = users;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.isLoading = false;
        }
      });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentUser = {
      username: '',
      password: '',
      role: 'STORE_OWNER',
      storeId: ''
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(user: User): void {
    this.isEditing = true;
    this.currentUser = { ...user };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = {
      username: '',
      password: '',
      role: 'STORE_OWNER',
      storeId: ''
    };
    this.errorMessage = '';
  }

  saveUser(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    const userRequest: UserRequest = {
      username: this.currentUser.username,
      password: this.currentUser.password || '',
      role: this.currentUser.role,
      storeId: this.currentUser.storeId || ''
    };
    
    const request = this.isEditing
      ? this.http.put<User>(this.configService.getApiUrl(`/users/${this.currentUser.id}`), userRequest, { headers })
      : this.http.post<User>(this.configService.getApiUrl('/users'), userRequest, { headers });

    request.subscribe({
      next: (user) => {
        if (this.isEditing) {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = user;
          }
        } else {
          this.users.push(user);
        }
        this.filteredUsers = [...this.users];
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao salvar usuário:', error);
        this.errorMessage = 'Erro ao salvar usuário';
        this.isLoading = false;
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.username}"?`)) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.delete(this.configService.getApiUrl(`/users/${user.id}`), { headers })
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = [...this.users];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
          this.errorMessage = 'Erro ao excluir usuário';
          this.isLoading = false;
        }
      });
  }

  private validateForm(): boolean {
    if (!this.currentUser.username.trim()) {
      this.errorMessage = 'Nome de usuário é obrigatório';
      return false;
    }
    if (!this.currentUser.password?.trim() && !this.isEditing) {
      this.errorMessage = 'Senha é obrigatória';
      return false;
    }
    if (!this.currentUser.role) {
      this.errorMessage = 'Role é obrigatório';
      return false;
    }
    if (!this.currentUser.storeId && this.currentUser.role !== 'ADMIN') {
      this.errorMessage = 'Loja é obrigatória para usuários não-admin';
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
