import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { StoreService } from '../../service/store.service';
import { Category } from '../../model/category.model';
import { Store } from '../../model/store.model';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  currentRoute = '';
  storeIdentifier = '';
  currentStoreId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private storeService: StoreService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        
        if (event.url.startsWith('/store/')) {
          this.storeIdentifier = event.url.split('/')[2];
          this.loadStoreAndCart();
        } else {
          this.cartCount = 0;
          this.currentStoreId = null;
          this.cdr.detectChanges();
        }
      });
    
    // Inicializa o carrinho se já estivermos em uma rota de loja
    if (this.storeIdentifier) {
      this.loadStoreAndCart();
    }
  }

  setStoreIdentifier(identifier: string) {
    this.storeIdentifier = identifier;
    this.loadStoreAndCart();
  }

  private loadStoreAndCart() {
    if (!this.storeIdentifier) return;
    
    // Carrega a loja para obter o ID
    this.storeService.getStoreByIdentifier(this.storeIdentifier)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (store) => {
          this.currentStoreId = store.id;
          // Define a loja atual no CartService
          this.cartService.setCurrentStore(store.id);
          // Carrega o carrinho da loja específica
          this.setCartCount();
        },
        error: (error) => {
          console.error('HeaderComponent - Erro ao carregar loja:', error);
          this.cartCount = 0;
          this.cdr.detectChanges();
        }
      });
  }

  private setCartCount() {
    this.cartService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartCount = items.reduce((s, i) => s + i.quantity, 0);
        this.cdr.detectChanges();
      });
  }

  goToCart() {
    if (this.storeIdentifier) {
      this.router.navigate(['/store', this.storeIdentifier, 'cart']);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
