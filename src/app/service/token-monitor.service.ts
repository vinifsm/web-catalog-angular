import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenMonitorService implements OnDestroy {
  private tokenCheckInterval: Subscription | null = null;
  private readonly CHECK_INTERVAL = 60000;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.startTokenMonitoring();
  }

  ngOnDestroy(): void {
    this.stopTokenMonitoring();
  }

  private startTokenMonitoring(): void {
    if (this.authService.isAuthenticated()) {
      this.tokenCheckInterval = interval(this.CHECK_INTERVAL).subscribe(() => {
        this.checkTokenValidity();
      });
    }
  }

  private stopTokenMonitoring(): void {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
      this.tokenCheckInterval = null;
    }
  }

  private checkTokenValidity(): void {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isTokenExpired()) {
        console.warn('Token expirado detectado durante monitoramento. Fazendo logout...');
        this.authService.forceLogout();
      }
    } else {
      this.stopTokenMonitoring();
    }
  }

  public restartMonitoring(): void {
    this.stopTokenMonitoring();
    this.startTokenMonitoring();
  }

  public stopMonitoring(): void {
    this.stopTokenMonitoring();
  }
}
