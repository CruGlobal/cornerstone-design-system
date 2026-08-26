import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/toast-item/toast-item.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-toast-item';

/**
 * @summary Toast items are individual notifications displayed within a toast container.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/toast
 * @status stable
 * @since 3.3
 *
 * @dependency cs-icon
 * @dependency cs-progress-ring
 *
 * @slot - The toast item's message content.
 * @slot icon - An optional icon to show at the start of the toast item.
 *
 * @event cs-show - Emitted when the toast item begins to show.
 * @event cs-after-show - Emitted after the toast item has finished showing.
 * @event cs-hide - Emitted when the toast item begins to hide.
 * @event cs-after-hide - Emitted after the toast item has finished hiding.
 *
 * @csspart toast-item - The toast item's main container.
 * @csspart accent - The colored accent line on the start side.
 * @csspart icon - The icon container.
 * @csspart content - The message content container.
 * @csspart close-button - The close button element.
 * @csspart progress-ring - The progress ring component.
 * @csspart progress-ring__progress-ring - The progress ring's exported `progress-ring` part.
 * @csspart progress-ring__label - The progress ring's exported label part.
 * @csspart progress-ring__track - The progress ring's exported track part.
 * @csspart progress-ring__indicator - The progress ring's exported indicator part.
 * @csspart close-icon - The close icon element.
 * @csspart close-icon__svg - The close icon's exported svg part.
 *
 * @cssproperty --accent-width - The width of the accent line. Defaults to 4px.
 * @cssproperty --padding - The internal spacing of the toast item. Scales with the `size` attribute.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The animation duration when showing.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The animation duration when hiding.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsShow: 'cs-show' as EventName<CsShowEvent>,
    onCsAfterShow: 'cs-after-show' as EventName<CsAfterShowEvent>,
    onCsHide: 'cs-hide' as EventName<CsHideEvent>,
    onCsAfterHide: 'cs-after-hide' as EventName<CsAfterHideEvent>,
  },
  displayName: 'CsToastItem',
});

export default reactWrapper;
