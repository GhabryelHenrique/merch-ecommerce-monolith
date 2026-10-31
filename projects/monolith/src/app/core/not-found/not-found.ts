import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, EmptyState } from '@merch/shared/ui';

@Component({
  selector: 'merch-not-found',
  imports: [RouterLink, Button, EmptyState],
  template: `
    <merch-empty-state
      heading="Página não encontrada"
      description="O endereço que você acessou não existe ou foi removido."
      icon="alert"
      [headingLevel]="1"
    >
      <a merch-button routerLink="/">Voltar para a página inicial</a>
      <a merch-button variant="secondary" routerLink="/c/novidades">Ver novidades</a>
    </merch-empty-state>
  `,
})
export class NotFound {}
