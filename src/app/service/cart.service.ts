import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../model/cart-item.model';
import { Product } from '../model/product.model';

const STORAGE_KEY = 'catalog_cart_v1';

@Injectable({
    providedIn: 'root'
  })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]); // inicializa vazio
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadInitialItems();
  }

  private loadInitialItems() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      this.itemsSubject.next(items);
    }
  }

  private saveToStorage(items: CartItem[]) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    this.itemsSubject.next(items);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  addToCart(product: Product, quantity: number) {
    if (quantity <= 0) return;
    const items = this.getItems();
    const idx = items.findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.saveToStorage(items);
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return this.remove(productId);
    const items = this.getItems().map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.saveToStorage(items);
  }

  remove(productId: string) {
    const items = this.getItems().filter(i => i.product.id !== productId);
    this.saveToStorage(items);
  }

  clear() {
    this.saveToStorage([]);
  }

  getTotalCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalPrice(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity * (i.product.price || 0), 0);
  }
}
