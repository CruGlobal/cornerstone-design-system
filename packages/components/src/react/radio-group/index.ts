import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/radio-group/radio-group.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-radio-group';

/**
 * @summary Radio groups wrap a set of radios so they function as a single form control with one shared value. They
 *  handle keyboard navigation, labeling, and validation for the group as a whole.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/radio-group
 * @status stable
 * @since 2.0
 *
 * @dependency cs-radio
 *
 * @slot - The default slot where `<cs-radio>` elements are placed.
 * @slot label - The radio group's label. Required for proper accessibility. Alternatively, you can use the `label`
 *  attribute.
 * @slot hint - Text that describes how to use the radio group. Alternatively, you can use the `hint` attribute.
 *
 * @event change - Emitted when the radio group's selected value changes.
 * @event input - Emitted when the radio group receives user input.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The element that wraps the grouped radios, styled as a flex container by default.
 * @csspart hint - The hint's wrapper.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsRadioGroup',
});

export default reactWrapper;
