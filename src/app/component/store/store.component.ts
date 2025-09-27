import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ProductCardComponent } from '../product-card/product-card.component';
import { StoreService } from '../../service/store.service';
import { CategoryService } from '../../service/category.service';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Store } from '../../model/store.model';
import { Category } from '../../model/category.model';
import { Product } from '../../model/product.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule,
    InfiniteScrollModule,
    ProductCardComponent,
    HeaderComponent
  ]
})
export class StoreComponent implements OnInit, AfterViewInit {
  @ViewChild('categoriesList') categoriesList!: ElementRef<HTMLDivElement>;
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  
  store: Store | null = null;
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategory: Category | null = null;
  page = 0;
  limit = 12;
  loading = false;
  finished = false;
  storeIdentifier: string = '';
  
  isDragging = false;
  startX = 0;
  translateX = 0;
  maxTranslateX = 0;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.storeIdentifier = params['identifier'];
      // Define o storeIdentifier no HeaderComponent se já estiver disponível
      if (this.headerComponent) {
        this.headerComponent.setStoreIdentifier(this.storeIdentifier);
      }
      this.loadStore();
    });
  }

  ngAfterViewInit(): void {
    this.calculateMaxTranslate();
    // Define o storeIdentifier no HeaderComponent após a view ser inicializada
    if (this.headerComponent && this.storeIdentifier) {
      this.headerComponent.setStoreIdentifier(this.storeIdentifier);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateMaxTranslate();
  }

  loadStore(): void {
    this.storeService.getStoreByIdentifier(this.storeIdentifier)
      .subscribe({
        next: (store) => {
          this.store = store;
          this.cartService.setCurrentStore(store.id);
          this.loadCategories();
        },
        error: (error) => {
          console.error('StoreComponent - Erro ao carregar loja:', error);
        }
      });
  }

  loadCategories(): void {
    if (!this.store) return;
    
    this.categoryService.getCategoriesByStore(this.store.id)
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          if (categories.length > 0) {
            this.selectAllCategory();
          }
          setTimeout(() => this.calculateMaxTranslate(), 100);
        },
        error: (error) => {
          console.error('StoreComponent - Erro ao carregar categorias:', error);
        }
      });
  }

  selectCategory(category: Category): void {
    this.loading = false;
    this.selectedCategory = category;
    this.products = [];
    this.page = 0;
    this.finished = false;
    this.loadProducts();
  }

  selectAllCategory(): void {
    let category : Category = {
      id: 'all',
      name: 'Todas',
      store: this.store ?? undefined
    }
    this.selectCategory(category);
  }

  loadProducts(): void {
    if (this.loading || this.finished || !this.selectedCategory) {
      return;
    }
    
    this.loading = true;
    (this.selectedCategory.id === 'all' ? this.productService.getProductsByStore(this.page, this.limit, this.store?.id) 
    : this.productService.getProducts(this.page, this.limit, this.selectedCategory.id))
      .subscribe({
        next: (res) => {

          if (res && res.length < this.limit) {
            this.finished = true;
          }

          if (res && res.length > 0) {
            this.products.push(...res);
          }

          this.page++;
          this.loading = false;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('StoreComponent - Erro ao carregar produtos:', error);
          this.loading = false;
        }
      });
      this.loading = false;
  }

  onScroll(): void {
    this.loadProducts();
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  calculateMaxTranslate(): void {
    if (!this.categoriesList) return;
    
    const container = this.categoriesList.nativeElement;
    const containerWidth = container.clientWidth;
    const contentWidth = container.scrollWidth;
    
    this.maxTranslateX = Math.max(0, contentWidth - containerWidth);
  }

  updateTransform(): void {
    if (!this.categoriesList) return;
    
    // Limitar o translateX dentro dos limites
    this.translateX = Math.max(-this.maxTranslateX, Math.min(0, this.translateX));
    
    this.categoriesList.nativeElement.style.transform = `translateX(${this.translateX}px)`;
  }

  // Métodos para drag/scroll com mouse
  onMouseDown(e: MouseEvent): void {
    if (!this.categoriesList) return;
    
    this.isDragging = true;
    this.startX = e.pageX;
    this.categoriesList.nativeElement.style.cursor = 'grabbing';
    this.categoriesList.nativeElement.style.userSelect = 'none';
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.categoriesList) return;
    
    e.preventDefault();
    const deltaX = e.pageX - this.startX;
    this.translateX += deltaX;
    this.startX = e.pageX;
    this.updateTransform();
  }

  onMouseUp(): void {
    if (!this.categoriesList) return;
    
    this.isDragging = false;
    this.categoriesList.nativeElement.style.cursor = 'grab';
    this.categoriesList.nativeElement.style.userSelect = 'auto';
  }

  // Métodos para touch/scroll em dispositivos móveis
  onTouchStart(e: TouchEvent): void {
    if (!this.categoriesList) return;
    
    this.isDragging = true;
    this.startX = e.touches[0].pageX;
  }

  onTouchMove(e: TouchEvent): void {
    if (!this.isDragging || !this.categoriesList) return;
    
    e.preventDefault();
    const deltaX = e.touches[0].pageX - this.startX;
    this.translateX += deltaX;
    this.startX = e.touches[0].pageX;
    this.updateTransform();
  }

  onTouchEnd(): void {
    this.isDragging = false;
  }

  onCategoriesScroll(): void {
    // Método mantido para compatibilidade, mas não faz mais nada
  }
}
