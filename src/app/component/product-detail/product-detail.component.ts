import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Product } from '../../model/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  imports: [
    CommonModule
  ]
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  showAddToCartModal = false;
  quantity = 1;
  showSuccessMessage = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(id).subscribe(p => this.product = p);
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
