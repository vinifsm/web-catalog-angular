import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { StoreService } from '../../service/store.service';
import { ImageService } from '../../service/image.service';
import { Product } from '../../model/product.model';
import { Store } from '../../model/store.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  imports: [
    CommonModule,
    HeaderComponent
  ]
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  product?: Product;
  store?: Store;
  showAddToCartModal = false;
  quantity = 1;
  showSuccessMessage = false;
  storeIdentifier: string = '';
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private storeService: StoreService,
    public imageService: ImageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = false;
    
    this.storeIdentifier = this.route.snapshot.paramMap.get('identifier')!;
    const productId = this.route.snapshot.paramMap.get('productId')!;
    
    if (!this.storeIdentifier || !productId) {
      console.error('ProductDetail - Parâmetros da rota inválidos:', {
        storeIdentifier: this.storeIdentifier,
        productId: productId
      });
      this.loading = false;
      this.error = true;
      this.cdr.detectChanges();
      return;
    }
    
    // Define o storeIdentifier no HeaderComponent se já estiver disponível
    if (this.headerComponent) {
      this.headerComponent.setStoreIdentifier(this.storeIdentifier);
    }
    
    this.loadStore();
    this.loadProduct(productId);
  }

  ngAfterViewInit(): void {
    // Define o storeIdentifier no HeaderComponent após a view ser inicializada
    if (this.headerComponent && this.storeIdentifier) {
      this.headerComponent.setStoreIdentifier(this.storeIdentifier);
    }
  }

  loadStore(): void {
    this.storeService.getStoreByIdentifier(this.storeIdentifier)
      .subscribe({
        next: (store) => {
          this.store = store;
          this.cartService.setCurrentStore(store.id);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('ProductDetail - Erro ao carregar loja:', error);
        }
      });
  }

  loadProduct(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.error = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ProductDetail - Erro ao carregar produto:', error);
        this.loading = false;
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/store', this.storeIdentifier]);
  }

  openAddToCartModal() {
    if (!this.product) return;
    this.quantity = 1;
    this.showAddToCartModal = true;
  }

  closeAddToCartModal() {
    this.resetModalState();
  }

  cancelAddToCart() {
    this.resetModalState();
  }

  private resetModalState() {
    this.showAddToCartModal = false;
    this.quantity = 1;
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  async addToCart() {
    if (!this.product || this.quantity <= 0) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      this.cartService.addToCart(this.product, this.quantity);
      
      this.showAddToCartModal = false;
      
      this.cdr.detectChanges();
      
      this.showSuccessMessage = true;
      
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  }

  closeSuccessMessage() {
    this.showSuccessMessage = false;
    this.cdr.detectChanges();
  }
}
