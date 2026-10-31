import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SearchBox } from './search-box';

describe('SearchBox', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SearchBox);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { navigate, input: el.querySelector('input') as HTMLInputElement, form: el.querySelector('form') as HTMLFormElement };
  };

  it('navega para /busca?q= com o termo (contrato por URL)', () => {
    const { navigate, input, form } = setup();
    input.value = '  moletom  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    expect(navigate).toHaveBeenCalledWith(['/busca'], { queryParams: { q: 'moletom' } });
  });

  it('ignora busca vazia', () => {
    const { navigate, form } = setup();
    form.dispatchEvent(new Event('submit'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('tem landmark de busca e rótulo', () => {
    const { form, input } = setup();
    expect(form.getAttribute('role')).toBe('search');
    expect(document.querySelector(`label[for="${input.id}"]`) ?? form.querySelector('label')).not.toBeNull();
  });
});
