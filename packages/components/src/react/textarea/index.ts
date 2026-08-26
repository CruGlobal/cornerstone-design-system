import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/textarea/textarea.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-textarea';

/**
 * @summary Textareas collect multi-line text input from the user, with optional resizing and character counting.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/textarea
 * @status stable
 * @since 2.0
 *
 * @slot label - The textarea's label. Alternatively, you can use the `label` attribute.
 * @slot hint - Text that describes how to use the input. Alternatively, you can use the `hint` attribute.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when an alteration to the control's value is committed by the user.
 * @event focus - Emitted when the control gains focus.
 * @event input - Emitted when the control receives input.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control-label - The label.
 * @csspart hint - The hint's wrapper.
 * @csspart textarea - The internal `<textarea>` control.
 * @csspart textarea-wrapper - The component's outer wrapper.
 * @csspart textarea-adjuster - The invisible sizer that grows the control to fit its content when `resize` is `auto`.
 * @csspart count - The character count element, rendered when the `with-count` attribute is present.
 *
 * @cssstate blank - The textarea is empty.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsTextarea',
});

export default reactWrapper;
