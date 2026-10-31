import { TestBed } from '@angular/core/testing';
import { PixQr } from './pix-qr';

describe('PixQr', () => {
  it('é SVG inline com nome acessível e aviso de ilustração', () => {
    const fixture = TestBed.createComponent(PixQr);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('QR code ilustrativo do Pix');
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('ilustrativo');
  });
});
