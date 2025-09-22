import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Product } from '../../model/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private router: Router) {}

  viewDetail() {
    this.router.navigate(['/product', this.product.id]);
  }
}
