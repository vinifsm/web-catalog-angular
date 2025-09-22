import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../service/product.service';
import { CategoryService } from '../../service/category.service';
import { Product } from '../../model/product.model';
import { Category } from '../../model/category.model';

@Component({
  selector: 'app-category',
  standalone: true,
  templateUrl: './category.component.html',
  
  imports: [
    CommonModule,          // *ngIf, *ngFor e pipes
    InfiniteScrollModule,  // [infiniteScroll] e atributos relacionados
    ProductCardComponent
  ]
})
export class CategoryComponent implements OnInit {
  products: Product[] = [];
  page = 0;
  limit = 12;
  categoryId!: string;
  category?: Category;
  loading = false;
  finished = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      this.categoryId = pm.get('id')!;
      this.products = [];
      this.page = 0;
      this.finished = false;
      this.loadMore();

      this.categoryService.getCategoryById(this.categoryId)
        .subscribe(c => this.category = c);
    });
  }

  loadMore() {
    if (this.loading || this.finished) return;
    this.loading = true;

    this.productService.getProducts(this.page, this.limit, this.categoryId)
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
