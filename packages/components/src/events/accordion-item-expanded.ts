/**
 * @internal Not public API. `<cs-accordion-item>` awaits this to know its own expand animation has
 * finished (`waitForEvent(this, 'cs-accordion-item-expanded')`). It is deliberately neither bubbling
 * nor composed, so it cannot be observed from outside the item. Consumers wanting this moment listen
 * for `cs-accordion-after-expand` on the parent `<cs-accordion>`.
 */
export class CsAccordionItemExpandedEvent extends Event {
  constructor() {
    super('cs-accordion-item-expanded', { bubbles: false, cancelable: false, composed: false });
  }
}
