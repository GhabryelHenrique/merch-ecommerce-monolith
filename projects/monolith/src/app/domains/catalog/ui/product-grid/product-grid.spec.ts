import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { makeProduct } from '../../data/testing';
import { ProductGrid } from './product-grid';

describe('ProductGrid', () => {
  it('renderiza um card por produto e prioriza só os primeiros', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src }],
    });
    const fixture = TestBed.createComponent(ProductGrid);
    fixture.componentRef.setInput('products', [1, 2, 3].map((i) => makeProduct({ id: String(i), slug: `p${i}` })));
    fixture.componentRef.setInput('priorityCount', 2);
    fixture.detectChanges();
    const imgs = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('img'));
    expect(imgs).toHaveLength(3);
    expect(imgs.map((i) => i.getAttribute('fetchpriority'))).toEqual(['high', 'high', 'auto']);
  });
});
