import type CsAccordionItem from '../components/accordion-item/accordion-item.js';

export class CsAccordionExpandEvent extends Event {
  readonly detail: { item: CsAccordionItem };

  constructor(detail: { item: CsAccordionItem }) {
    super('cs-accordion-expand', { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-accordion-expand': CsAccordionExpandEvent;
  }
}
