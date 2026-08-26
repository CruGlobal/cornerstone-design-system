/**
 * @internal Not public API. `<cs-accordion-item>` reports a trigger click upward so `<cs-accordion>`
 * can run its expand/collapse policy; the accordion binds it in its own template. The public events
 * for that moment are `cs-accordion-expand` and `cs-accordion-collapse`.
 */
import type CsAccordionItem from '../components/accordion-item/accordion-item.js';

export class CsAccordionItemTriggerEvent extends Event {
  readonly detail: { item: CsAccordionItem };

  constructor(detail: { item: CsAccordionItem }) {
    super('cs-accordion-item-trigger', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
