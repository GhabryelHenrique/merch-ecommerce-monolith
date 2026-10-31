import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '@merch/shared/ui';
import { APP_CONFIG } from '@merch/shared/util';
import { FOOTER_LINKS, MAIN_MENU } from '../../navigation/menu';
import { NewsletterForm } from '../newsletter-form/newsletter-form';

@Component({
  selector: 'merch-footer',
  imports: [RouterLink, Icon, NewsletterForm],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly config = inject(APP_CONFIG);
  protected readonly storeName = this.config.storeName;
  protected readonly contact = this.config.contact;
  protected readonly institutional = FOOTER_LINKS;
  protected readonly categories = MAIN_MENU.filter((s) => s.children);
  protected readonly year = new Date().getFullYear();
  protected readonly phoneHref = `tel:+55${this.contact.phone.replace(/\D/g, '')}`;
}
