import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/input/input.js';

import { type EventName } from '@lit/react';
import type { CsClearEvent } from '../../events/events.js';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsClearEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-input';

/**
 * @summary Inputs collect single-line data from the user, such as text, numbers, email addresses, and passwords. They
 *  support labels, hints, validation, and prefix or suffix slots.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/input
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot start - An element, such as `<cs-icon>`, placed at the start of the input control.
 * @slot end - An element, such as `<cs-icon>`, placed at the end of the input control.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot show-password-icon - An icon to use in lieu of the default show password icon.
 * @slot hide-password-icon - An icon to use in lieu of the default hide password icon.
 * @slot hint - Text that describes how to use the input. Alternatively, you can use the `hint` attribute.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when an alteration to the control's value is committed by the user.
 * @event focus - Emitted when the control gains focus.
 * @event input - Emitted when the control receives input.
 * @event cs-clear - Emitted when the clear button is activated.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control-label - The label.
 * @csspart hint - The hint's wrapper.
 * @csspart input-wrapper - The component's outer wrapper.
 * @csspart input - The internal `<input>` control.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart clear-button - The clear button.
 * @csspart password-toggle-button - The password toggle button.
 * @csspart end - The container that wraps the `end` slot.
 *
 * @cssstate blank - The input is empty.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsClear: 'cs-clear' as EventName<CsClearEvent>,
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsInput',
});

export default reactWrapper;
