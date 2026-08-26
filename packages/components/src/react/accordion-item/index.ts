import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/accordion-item/accordion-item.js';

const tagName = 'cs-accordion-item';

/**
 * @summary Accordion items are used inside `<cs-accordion>` to create expandable sections with accessible headers.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/accordion
 * @status experimental
 * @since 1.0
 *
 * @dependency cs-icon
 *
 * @slot - The accordion item's body content.
 * @slot label - The accordion item's label. Alternatively, use the `label` attribute.
 * @slot icon - Optional expand/collapse icon. Works best with `<cs-icon>`.
 *
 * @csspart accordion-item - The component's outer wrapper.
 * @csspart heading - The heading element wrapping the trigger button. Omitted when `heading-level="none"`.
 * @csspart button - The trigger button that toggles the panel.
 * @csspart label - The container that wraps the label.
 * @csspart icon - The container that wraps the expand/collapse icon.
 * @csspart panel - The panel that contains the item's content.
 * @csspart content - The content slot inside the panel.
 *
 * @cssproperty [--spacing=var(--cs-space-m)] - The amount of space around and between the item's header and content.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The duration of the expand animation.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The duration of the collapse animation.
 * @cssproperty [--easing=var(--cs-transition-easing)] - The easing of the expand/collapse animation.
 *
 * @cssstate animating - Applied while the panel is animating.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsAccordionItem',
});

export default reactWrapper;
