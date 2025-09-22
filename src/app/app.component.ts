import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './component/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <app-header></app-header>
<main>
  <router-outlet></router-outlet>
</main>
<footer>
  <p>© 2025 Vinicius Moreira</p>
</footer>
  `,
  imports: [
    CommonModule,   // *ngIf, *ngFor e pipes
    HeaderComponent,
    RouterModule    // necessário para <router-outlet>
  ]
})
export class AppComponent {}
