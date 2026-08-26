import type CsAccordionItem from '../components/accordion-item/accordion-item.js';

export class CsAccordionAfterCollapseEvent extends Event {
  readonly detail: { item: CsAccordionItem };

  constructor(detail: { item: CsAccordionItem }) {
    super('cs-accordion-after-collapse', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-accordion-after-collapse': CsAccordionAfterCollapseEvent;
  }
}
