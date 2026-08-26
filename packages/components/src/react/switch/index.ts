import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/switch/switch.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-switch';

/**
 * @summary Switches toggle a single setting on or off and apply the change immediately, without requiring a form
 *  submission.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/switch
 * @status stable
 * @since 2.0
 *
 * @slot - The switch's label.
 * @slot hint - Text that describes how to use the switch. Alternatively, you can use the `hint` attribute.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when the control's checked state changes.
 * @event input - Emitted when the control receives input.
 * @event focus - Emitted when the control gains focus.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart switch - The component's outer wrapper.
 * @csspart control - The control that houses the switch's thumb.
 * @csspart thumb - The switch's thumb.
 * @csspart label - The switch's label.
 * @csspart hint - The hint's wrapper.
 *
 * @cssproperty --width - The width of the switch.
 * @cssproperty --height - The height of the switch.
 * @cssproperty --thumb-size - The size of the thumb.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsSwitch',
});

export default reactWrapper;
