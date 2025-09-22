import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryService } from '../../service/category.service';
import { CartService } from '../../service/cart.service';
import { Category } from '../../model/category.model';

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
export class HeaderComponent implements OnInit {
  categories: Category[] = [];
  cartCount = 0;

  constructor(
    private categoryService: CategoryService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);

    this.cartService.items$.subscribe(items => 
      this.cartCount = items.reduce((s, i) => s + i.quantity, 0)
    );
  }

  goToCategory(id: string) {
    this.router.navigate(['/category', id]);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  onCategoryChange(event: any) {
    const categoryId = event.target.value;
    if (categoryId) {
      this.router.navigate(['/category', categoryId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
