import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest, RegisterRequest } from '../../service/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class LoginModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  loginForm = {
    username: '',
    password: ''
  };

  registerForm = {
    username: '',
    password: '',
    role: 'STORE_OWNER'
  };

  constructor(private authService: AuthService) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin(): void {
    if (!this.loginForm.username || !this.loginForm.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      username: this.loginForm.username,
      password: this.loginForm.password
    };

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSuccess.emit();
        this.closeModal.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciais inválidas';
        console.error('Erro no login:', error);
      }
    });
  }

  onRegister(): void {
    if (!this.registerForm.username || !this.registerForm.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerRequest: RegisterRequest = {
      username: this.registerForm.username,
      password: this.registerForm.password,
      role: this.registerForm.role
    };

    this.authService.register(registerRequest).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginSuccess.emit();
        this.closeModal.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao criar conta';
        console.error('Erro no registro:', error);
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
