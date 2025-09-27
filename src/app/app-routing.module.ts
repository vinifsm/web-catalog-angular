import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { StoreComponent } from './component/store/store.component';
import { AdminComponent } from './component/admin/admin.component';
import { ProductDetailComponent } from './component/product-detail/product-detail.component';
import { CartComponent } from './component/cart/cart.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { StoreOwnerGuard } from './guards/store-owner.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'store/:identifier', component: StoreComponent },
  { path: 'store/:identifier/product/:productId', component: ProductDetailComponent },
  { path: 'store/:identifier/cart', component: CartComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'categories', pathMatch: 'full' },
      { path: 'stores', loadComponent: () => import('./component/admin/stores/stores.component').then(m => m.StoresComponent), canActivate: [StoreOwnerGuard] },
      { path: 'users', loadComponent: () => import('./component/admin/users/users.component').then(m => m.UsersComponent), canActivate: [AdminGuard] },
      { path: 'categories', loadComponent: () => import('./component/admin/categories/categories.component').then(m => m.CategoriesComponent), canActivate: [StoreOwnerGuard] },
      { path: 'products', loadComponent: () => import('./component/admin/products/products.component').then(m => m.ProductsComponent), canActivate: [StoreOwnerGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];

export const AppRoutingModule = RouterModule.forRoot(routes);
