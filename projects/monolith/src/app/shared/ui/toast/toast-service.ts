import { DestroyRef, Service, inject, signal } from '@angular/core';

export type ToastTone = 'success' | 'info' | 'error';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly tone: ToastTone;
  readonly action?: { readonly label: string; readonly url: string };
}

export interface ToastOptions {
  tone?: ToastTone;
  action?: Toast['action'];
  /** ms até sumir sozinho; 0 = só fecha manualmente. */
  duration?: number;
}

/**
 * Fila de toasts. Qualquer área publica; o `ToastHost` do shell renderiza.
 * Na fase 2 é compartilhado (singleton) entre shell e remotes.
 */
@Service()
export class ToastService {
  private readonly state = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 1;

  readonly toasts = this.state.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((t) => clearTimeout(t)));
  }

  show(message: string, options: ToastOptions = {}): number {
    const id = this.nextId++;
    const toast: Toast = { id, message, tone: options.tone ?? 'success', action: options.action };
    // Máximo de 3 visíveis: o mais antigo sai.
    this.state.update((list) => [...list, toast].slice(-3));
    const duration = options.duration ?? 6000;
    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
    return id;
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.state.update((list) => list.filter((t) => t.id !== id));
  }
}
