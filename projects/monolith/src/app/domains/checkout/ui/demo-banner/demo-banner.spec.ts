import { TestBed } from '@angular/core/testing';
import { DemoBanner } from './demo-banner';

describe('DemoBanner', () => {
  it('avisa que nenhum pagamento é processado', () => {
    const fixture = TestBed.createComponent(DemoBanner);
    fixture.detectChanges();
    const note = (fixture.nativeElement as HTMLElement).querySelector('[role="note"]');
    expect(note?.textContent).toContain('Ambiente de demonstração: nenhum pagamento é processado');
  });
});
