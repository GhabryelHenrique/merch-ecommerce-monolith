import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductApi } from '../data/product-api';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('renderiza o título', () => {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), ProductApi],
    });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Merch Store');
  });
});
