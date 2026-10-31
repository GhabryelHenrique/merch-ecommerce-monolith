import { InjectionToken } from '@angular/core';

/** Configuração de runtime, lida de `config.json` no startup (muda sem rebuild). */
export interface AppConfig {
  readonly storeName: string;
  readonly environment: string;
  readonly promo: {
    readonly message: string;
    readonly linkLabel: string;
    readonly linkUrl: string;
  };
  readonly contact: {
    readonly email: string;
    readonly phone: string;
    readonly hours: string;
  };
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  storeName: 'Merch Store',
  environment: 'local',
  promo: { message: '', linkLabel: '', linkUrl: '/' },
  contact: { email: '', phone: '', hours: '' },
};

/** Valor já resolvido da config de runtime. Quem fornece o valor real é o shell (core). */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  factory: () => DEFAULT_APP_CONFIG,
});
