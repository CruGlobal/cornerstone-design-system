/**
 * @internal Not public API. `<cs-accordion-item>` awaits this to know its own collapse animation has
 * finished (`waitForEvent(this, 'cs-accordion-item-collapsed')`). It is deliberately neither bubbling
 * nor composed, so it cannot be observed from outside the item. Consumers wanting this moment listen
 * for `cs-accordion-after-collapse` on the parent `<cs-accordion>`.
 */
export class CsAccordionItemCollapsedEvent extends Event {
  constructor() {
    super('cs-accordion-item-collapsed', { bubbles: false, cancelable: false, composed: false });
  }
}
