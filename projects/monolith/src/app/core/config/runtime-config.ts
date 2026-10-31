import { HttpClient } from '@angular/common/http';
import {
  type EnvironmentProviders,
  Service,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { APP_CONFIG, type AppConfig, DEFAULT_APP_CONFIG } from '@merch/shared/util';
import { firstValueFrom } from 'rxjs';

/**
 * Carrega `config.json` (relativo ao base href) antes do bootstrap.
 * Precursor do `federation.manifest.json` da fase 2: ambos são lidos em runtime.
 */
@Service()
export class RuntimeConfigLoader {
  private readonly http = inject(HttpClient);
  private readonly state = signal<AppConfig>(DEFAULT_APP_CONFIG);

  readonly config = this.state.asReadonly();

  async load(url = 'config.json'): Promise<void> {
    try {
      const loaded = await firstValueFrom(this.http.get<Partial<AppConfig>>(url));
      this.state.set({ ...DEFAULT_APP_CONFIG, ...loaded });
    } catch (error) {
      console.warn('[config] config.json indisponível; usando valores padrão.', error);
    }
  }
}

export function provideRuntimeConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(RuntimeConfigLoader).load()),
    { provide: APP_CONFIG, useFactory: () => inject(RuntimeConfigLoader).config() },
  ]);
}
