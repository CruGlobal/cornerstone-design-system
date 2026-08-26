import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/accordion/accordion.js';

import { type EventName } from '@lit/react';
import type { CsAccordionExpandEvent } from '../../events/events.js';
import type { CsAccordionAfterExpandEvent } from '../../events/events.js';
import type { CsAccordionCollapseEvent } from '../../events/events.js';
import type { CsAccordionAfterCollapseEvent } from '../../events/events.js';
export type { CsAccordionExpandEvent } from '../../events/events.js';
export type { CsAccordionAfterExpandEvent } from '../../events/events.js';
export type { CsAccordionCollapseEvent } from '../../events/events.js';
export type { CsAccordionAfterCollapseEvent } from '../../events/events.js';

const tagName = 'cs-accordion';

/**
 * @summary Accordions are a vertically stacked set of interactive headings that each contain a title, representing a section of content.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/accordion
 * @status experimental
 * @since 3.7
 *
 * @dependency cs-accordion-item
 *
 * @slot - One or more `<cs-accordion-item>` elements.
 *
 * @event {{ item: CsAccordionItem }} cs-accordion-expand - Emitted before an item expands. Cancelable.
 * @event {{ item: CsAccordionItem }} cs-accordion-after-expand - Emitted after an item finishes expanding.
 * @event {{ item: CsAccordionItem }} cs-accordion-collapse - Emitted before an item collapses. Cancelable.
 * @event {{ item: CsAccordionItem }} cs-accordion-after-collapse - Emitted after an item finishes collapsing.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsAccordionExpand: 'cs-accordion-expand' as EventName<CsAccordionExpandEvent>,
    onCsAccordionAfterExpand: 'cs-accordion-after-expand' as EventName<CsAccordionAfterExpandEvent>,
    onCsAccordionCollapse: 'cs-accordion-collapse' as EventName<CsAccordionCollapseEvent>,
    onCsAccordionAfterCollapse: 'cs-accordion-after-collapse' as EventName<CsAccordionAfterCollapseEvent>,
  },
  displayName: 'CsAccordion',
});

export default reactWrapper;
