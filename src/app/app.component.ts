import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
<main>
  <router-outlet></router-outlet>
</main>
<footer>
  <p>© 2025 Vinicius Moreira</p>
</footer>
  `,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class AppComponent implements OnInit {
  showHeader = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeader = event.url.startsWith('/store/');
      });
  }
}
