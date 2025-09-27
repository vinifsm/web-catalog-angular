import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../model/cart-item.model';
import { Product } from '../model/product.model';

const STORAGE_KEY_PREFIX = 'catalog_cart_store_';

@Injectable({
    providedIn: 'root'
  })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();
  private currentStoreId: string | null = null;

  constructor() {
   
  }

  setCurrentStore(storeId: string) {
    this.currentStoreId = storeId;
    this.loadStoreItems();
  }

  private getStorageKey(): string {
    return this.currentStoreId ? `${STORAGE_KEY_PREFIX}${this.currentStoreId}` : 'catalog_cart_default';
  }

  private loadStoreItems() {
    if (typeof window !== 'undefined' && window.localStorage && this.currentStoreId) {
      const raw = localStorage.getItem(this.getStorageKey());
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      this.itemsSubject.next(items);
    } else {
      this.itemsSubject.next([]);
    }
  }

  private saveToStorage(items: CartItem[]) {
    if (typeof window !== 'undefined' && window.localStorage && this.currentStoreId) {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(items));
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
