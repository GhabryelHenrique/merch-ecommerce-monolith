import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, EmptyState } from '@merch/shared/ui';

interface InfoTopic {
  title: string;
  paragraphs: string[];
}

/** Conteúdo institucional estático do shell (fictício, para a demonstração). */
const TOPICS: Record<string, InfoTopic> = {
  sobre: {
    title: 'Sobre a loja',
    paragraphs: [
      'A Merch Store é uma loja de demonstração criada para o workshop "Do monólito aos Micro Frontends".',
      'Os produtos, preços e fotos vêm do catálogo público da Google Merch Shop (preços convertidos para reais). Esta loja de demonstração não tem vínculo com o Google.',
      'Nenhum pedido é processado e nenhum dado de pagamento é coletado.',
    ],
  },
  entregas: {
    title: 'Entregas',
    paragraphs: [
      'Calculamos o frete pelo CEP na etapa de entrega. Há duas opções: Econômico e Expresso.',
      'O frete Econômico é grátis em compras acima de R$ 299,00.',
    ],
  },
  trocas: {
    title: 'Trocas e devoluções',
    paragraphs: [
      'Você pode trocar ou devolver qualquer produto em até 30 dias após o recebimento.',
      'O produto deve estar sem uso e com a etiqueta. A primeira troca é gratuita.',
    ],
  },
  privacidade: {
    title: 'Privacidade',
    paragraphs: [
      'Esta demonstração guarda o carrinho e o andamento do checkout apenas no seu navegador.',
      'Nenhuma informação é enviada a servidores e não usamos cookies de rastreamento.',
    ],
  },
};

@Component({
  selector: 'merch-info-page',
  imports: [RouterLink, Button, EmptyState],
  templateUrl: './info-page.html',
  styleUrl: './info-page.scss',
})
export class InfoPage {
  /** Param da rota `ajuda/:topico` via `withComponentInputBinding()`. */
  readonly topico = input.required<string>();
  protected readonly topic = computed(() => TOPICS[this.topico()]);
}
