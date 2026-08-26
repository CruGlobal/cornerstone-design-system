import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tag/tag.js';

import { type EventName } from '@lit/react';
import type { CsRemoveEvent } from '../../events/events.js';
export type { CsRemoveEvent } from '../../events/events.js';

const tagName = 'cs-tag';

/**
 * @summary Tags label, categorize, or represent selections with a compact visual marker. Use them for status
 *  indicators, filters, or removable chips.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tag
 * @status stable
 * @since 2.0
 *
 * @dependency cs-button
 *
 * @slot - The tag's content.
 *
 * @event cs-remove - Emitted when the remove button is activated.
 *
 * @csspart content - The tag's content.
 * @csspart remove-button - The tag's remove button, a `<cs-button>`.
 * @csspart remove-button__button - The remove button's exported `button` part.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsRemove: 'cs-remove' as EventName<CsRemoveEvent>,
  },
  displayName: 'CsTag',
});

export default reactWrapper;
