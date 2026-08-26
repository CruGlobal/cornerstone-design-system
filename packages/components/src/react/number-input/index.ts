import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/number-input/number-input.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-number-input';

/**
 * @summary Number inputs let users enter and edit numeric values, with optional stepper buttons for incrementing and
 *  decrementing. Use them for quantities, measurements, and other numeric form fields.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/number-input
 * @status stable
 * @since 3.2
 *
 * @dependency cs-icon
 *
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot start - An element, such as `<cs-icon>`, placed at the start of the input control.
 * @slot end - An element, such as `<cs-icon>`, placed at the end of the input control (before steppers).
 * @slot increment-icon - An icon to use in lieu of the default increment icon.
 * @slot decrement-icon - An icon to use in lieu of the default decrement icon.
 * @slot hint - Text that describes how to use the input. Alternatively, you can use the `hint` attribute.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when an alteration to the control's value is committed by the user.
 * @event focus - Emitted when the control gains focus.
 * @event input - Emitted when the control receives input.
 * @event beforeinput - Emitted before the value changes. Can be cancelled with `event.preventDefault()` to prevent the
 *  value from changing.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control-label - The label.
 * @csspart hint - The hint element.
 * @csspart number-input - The component's outer wrapper.
 * @csspart input - The internal `<input>` control.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart stepper - Both stepper buttons (for shared styling).
 * @csspart stepper-increment - The increment (+) button on the end side.
 * @csspart stepper-decrement - The decrement (-) button on the start side.
 *
 * @cssstate blank - The input is empty.
 * @cssstate focused - The input has focus.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsNumberInput',
});

export default reactWrapper;
