import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    CommonModule,         // *ngFor, *ngIf
    InfiniteScrollModule, // [infiniteScroll]
    ProductCardComponent
  ]
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  page = 0;
  limit = 12;
  loading = false;
  finished = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || this.finished) return;
    this.loading = true;

    this.productService.getProducts(this.page, this.limit)
      .subscribe({
        next: res => {
          if (res.length < this.limit) this.finished = true;
          this.products.push(...res);
          this.page++;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onScroll() {
    this.loadMore();
  }
}
