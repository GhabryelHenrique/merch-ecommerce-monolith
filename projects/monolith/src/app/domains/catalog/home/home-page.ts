import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductApi } from '../data/product-api';

@Component({
  selector: 'merch-home-page',
  imports: [NgOptimizedImage],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly api = inject(ProductApi);
}
