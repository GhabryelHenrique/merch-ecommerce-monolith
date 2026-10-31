import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Icon } from '@merch/shared/ui';
import { OrderService } from '../data/order-service';
import { paymentLabel } from '../data/rules';

@Component({
  selector: 'merch-confirmation-page',
  imports: [CurrencyPipe, RouterLink, Button, Icon],
  templateUrl: './confirmation-page.html',
  styleUrl: './confirmation-page.scss',
})
export class ConfirmationPage {
  private readonly orders = inject(OrderService);
  readonly orderId = input.required<string>();

  protected readonly order = computed(() => this.orders.get(this.orderId()));
  protected readonly payment = computed(() => paymentLabel(this.order()?.paymentMethod ?? null));
  protected readonly itemCount = computed(() => this.order()?.items.reduce((n, i) => n + i.quantity, 0) ?? 0);
}
