import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class AdminComponent implements OnInit {
  currentUser: any = null;
  sidebarOpen = true;
  isMobile = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkScreenSize();
    
    // Em mobile, sidebar inicia fechada
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
    
    // Se mudou para desktop e sidebar estava fechada, abre
    if (!this.isMobile && !this.sidebarOpen) {
      this.sidebarOpen = true;
    }
    // Se mudou para mobile e sidebar estava aberta, fecha
    else if (this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  onNavLinkClick(): void {
    // Em mobile, fecha a sidebar quando um link é clicado
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isStoreOwner(): boolean {
    return this.authService.isStoreOwner();
  }
}
