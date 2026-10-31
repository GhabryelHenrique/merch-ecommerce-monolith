import { DOCUMENT, Service, inject } from '@angular/core';

/** Valida o valor lido do storage. Valor reprovado é tratado como ausente. */
export type StorageGuard<T> = (value: unknown) => value is T;

export interface KeyValueStore {
  get<T>(key: string, guard: StorageGuard<T>): T | undefined;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

/** Fallback quando o Web Storage não existe ou está bloqueado (modo privado, cota, SSR). */
class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  get<T>(key: string, guard: StorageGuard<T>): T | undefined {
    return parse(this.data.get(key) ?? null, guard);
  }

  set(key: string, value: unknown): void {
    this.data.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.data.delete(key);
  }
}

class WebStore implements KeyValueStore {
  constructor(
    private readonly storage: Storage,
    private readonly fallback: MemoryStore,
  ) {}

  get<T>(key: string, guard: StorageGuard<T>): T | undefined {
    try {
      return parse(this.storage.getItem(key), guard);
    } catch {
      return this.fallback.get(key, guard);
    }
  }

  set(key: string, value: unknown): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      this.fallback.set(key, value);
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      this.fallback.remove(key);
    }
  }
}

/** JSON tolerante: texto inválido ou reprovado pelo guard vira `undefined`. */
function parse<T>(raw: string | null, guard: StorageGuard<T>): T | undefined {
  if (raw === null) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    return guard(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Único ponto de acesso a `localStorage`/`sessionStorage` e ao evento `storage`.
 * Nenhum outro código toca `window` diretamente (AGENTS.md §7).
 */
@Service()
export class StorageService {
  private readonly window = inject(DOCUMENT).defaultView;

  readonly local: KeyValueStore = this.create('localStorage');
  readonly session: KeyValueStore = this.create('sessionStorage');

  /**
   * Avisa quando OUTRA aba altera `key` no localStorage (o evento não dispara na própria aba).
   * Devolve a função para cancelar a inscrição.
   */
  onExternalChange(key: string, callback: () => void): () => void {
    const target = this.window;
    if (!target) return () => undefined;
    const listener = (event: StorageEvent) => {
      if (event.key === key || event.key === null) callback();
    };
    target.addEventListener('storage', listener);
    return () => target.removeEventListener('storage', listener);
  }

  private create(kind: 'localStorage' | 'sessionStorage'): KeyValueStore {
    const memory = new MemoryStore();
    try {
      const storage = this.window?.[kind];
      if (!storage) return memory;
      const probe = '__merch_probe__';
      storage.setItem(probe, probe);
      storage.removeItem(probe);
      return new WebStore(storage, memory);
    } catch {
      return memory;
    }
  }
}
