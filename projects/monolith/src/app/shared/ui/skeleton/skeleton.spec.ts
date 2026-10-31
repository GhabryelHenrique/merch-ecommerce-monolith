import { TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('é oculto para tecnologias assistivas e aceita dimensões', () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentRef.setInput('aspectRatio', '1 / 1');
    fixture.componentRef.setInput('shape', 'circle');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.style.aspectRatio).toBe('1 / 1');
    expect(el.classList).toContain('skeleton--circle');
  });
});
