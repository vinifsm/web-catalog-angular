import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../model/product.model';
import { ImageService } from '../../service/image.service';

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

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    public imageService: ImageService
  ) {}

  viewDetail() {
    const storeIdentifier = this.route.snapshot.paramMap.get('identifier');

    if (storeIdentifier && this.product.id) {
      this.router.navigate(['/store', storeIdentifier, 'product', this.product.id]);
    } else {
      console.error('ProductCard - Dados inválidos para navegação:', {
        storeIdentifier: storeIdentifier,
        productId: this.product.id
      });
    }
  }
}
