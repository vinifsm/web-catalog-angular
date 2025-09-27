import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-homepage-header',
  standalone: true,
  templateUrl: './homepage-header.component.html',
  styleUrls: ['./homepage-header.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule,
    LoginModalComponent
  ]
})
export class HomepageHeaderComponent {
  showLoginModal = false;

  openLoginModal(): void {
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  onLoginSuccess(): void {
    window.location.href = '/admin';
  }
}
