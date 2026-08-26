import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/rating/rating.js';

import { type EventName } from '@lit/react';
import type { CsHoverEvent } from '../../events/events.js';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsHoverEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-rating';

/**
 * @summary Ratings display a numeric score as a row of selectable symbols, typically stars. Use them to capture quick
 *  feedback or show an average rating for a product or piece of content.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/rating
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @event change - Emitted when the rating's value changes.
 * @event {{ phase: 'start' | 'move' | 'end', value: number }} cs-hover - Emitted when the user hovers over a value. The
 *  `phase` property indicates when hovering starts, moves to a new value, or ends. The `value` property tells what the
 *  rating's value would be if the user were to commit to the hovered value.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart rating - The component's outer wrapper.
 *
 * @cssproperty --symbol-color - The inactive color for symbols.
 * @cssproperty --symbol-color-active - The active color for symbols.
 * @cssproperty --symbol-spacing - The spacing to use around symbols.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsHover: 'cs-hover' as EventName<CsHoverEvent>,
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsRating',
});

export default reactWrapper;
