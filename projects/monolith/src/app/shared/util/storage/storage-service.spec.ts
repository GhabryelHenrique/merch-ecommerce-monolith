import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage-service';

const isNumberList = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => typeof n === 'number');

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('grava e lê JSON no localStorage e no sessionStorage', () => {
    const storage = TestBed.inject(StorageService);
    storage.local.set('a', [1, 2]);
    storage.session.set('b', [3]);
    expect(storage.local.get('a', isNumberList)).toEqual([1, 2]);
    expect(storage.session.get('b', isNumberList)).toEqual([3]);
    expect(localStorage.getItem('a')).toBe('[1,2]');
  });

  it('é tolerante a JSON inválido e a valores reprovados pelo guard', () => {
    const storage = TestBed.inject(StorageService);
    localStorage.setItem('quebrado', '{nao é json');
    localStorage.setItem('tipo-errado', '"texto"');
    expect(storage.local.get('quebrado', isNumberList)).toBeUndefined();
    expect(storage.local.get('tipo-errado', isNumberList)).toBeUndefined();
    expect(storage.local.get('ausente', isNumberList)).toBeUndefined();
  });

  it('remove chaves', () => {
    const storage = TestBed.inject(StorageService);
    storage.local.set('a', [1]);
    storage.local.remove('a');
    expect(storage.local.get('a', isNumberList)).toBeUndefined();
  });

  it('usa memória quando o storage não está disponível', () => {
    const blocked = {
      get localStorage(): Storage {
        throw new DOMException('bloqueado', 'SecurityError');
      },
      get sessionStorage(): Storage {
        throw new DOMException('bloqueado', 'SecurityError');
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: blocked } }],
    });
    const storage = TestBed.inject(StorageService);
    storage.local.set('a', [7]);
    expect(storage.local.get('a', isNumberList)).toEqual([7]);
  });

  it('notifica mudanças feitas por outra aba', () => {
    const storage = TestBed.inject(StorageService);
    const calls: string[] = [];
    const stop = storage.onExternalChange('carrinho', () => calls.push('mudou'));
    window.dispatchEvent(new StorageEvent('storage', { key: 'outra' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'carrinho' }));
    stop();
    window.dispatchEvent(new StorageEvent('storage', { key: 'carrinho' }));
    expect(calls).toEqual(['mudou']);
  });
});
