import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../service/cart.service';
import { CartItem } from '../../model/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CartComponent {
  items: CartItem[] = [];
  showWhatsAppModal = false;
  customerName = '';
  showSuccessMessage = false;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.cartService.items$.subscribe(items => this.items = items);
  }

  updateQty(productId: string, event: any) {
    const q = parseInt(event.target.value, 10) || 0;
    if (q <= 0) {
      this.cartService.remove(productId);
      return;
    }
    this.cartService.updateQuantity(productId, q);
  }

  increaseQuantity(productId: string) {
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: string) {
    const item = this.items.find(i => i.product.id === productId);
    if (item) {
      if (item.quantity <= 1) {
        this.cartService.remove(productId);
      } else {
        this.cartService.updateQuantity(productId, item.quantity - 1);
      }
    }
  }

  remove(productId: string) {
    this.cartService.remove(productId);
  }

  getTotal(): number {
    return this.cartService.getTotalPrice();
  }

  openWhatsAppModal() {
    if (!this.items.length) {
      alert('Carrinho está vazio');
      return;
    }
    this.customerName = '';
    this.showWhatsAppModal = true;
  }

  closeWhatsAppModal() {
    this.showWhatsAppModal = false;
    this.customerName = '';
  }

  sendToWhatsApp() {
    if (!this.customerName.trim()) {
      alert('Por favor, digite seu nome para o pedido');
      return;
    }

    let message = `Pedido de ${this.customerName}\n\n`;
    this.items.forEach(i => {
      message += `Produto: ${i.product.sku} | ${i.product.name} - ${i.quantity}\n`;
    });
    message += `\nTotal: R$ ${this.getTotal().toFixed(2)}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');

    this.cartService.clear();
    this.showWhatsAppModal = false;
    
    // Mostrar mensagem de sucesso
    this.showSuccessMessage = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  closeSuccessMessage() {
    this.showSuccessMessage = false;
    this.cdr.detectChanges();
  }
}
