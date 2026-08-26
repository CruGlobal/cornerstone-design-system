import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/known-date/known-date.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-known-date';

/**
 * @summary Known dates let users enter dates they already know - birthdays, expirations, document
 *  dates - through three separate day, month, and year fields shown in the locale's natural order.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/known-date
 * @status experimental
 * @since 3.8
 *
 * @slot label - The known date's group label. Alternatively, use the `label` attribute.
 * @slot hint - Text that describes how to use the known date. Alternatively, use the `hint` attribute.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when the committed value transitions to a new ISO date.
 * @event focus - Emitted when the control gains focus.
 * @event input - Emitted as the user types in any field.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control's outer wrapper.
 * @csspart form-control-label - The wrapper inside the legend that styles the visible label text.
 * @csspart form-control-input - Alias on the fields row matching other form controls.
 * @csspart hint - The hint's wrapper.
 * @csspart known-date - The component's outer wrapper.
 * @csspart fieldset - The `<fieldset>` element grouping the three fields (or a `role="group"` div).
 * @csspart legend - The `<legend>` element (when a label is present).
 * @csspart fields - The flex row holding the three field blocks.
 * @csspart field - Each field block (label + input).
 * @csspart field-day - Added to the day field block.
 * @csspart field-month - Added to the month field block.
 * @csspart field-year - Added to the year field block.
 * @csspart field-label - The text label above each field's input.
 * @csspart field-input - The native `<input>` inside a field.
 *
 * @cssstate blank - The known date has no committed value.
 * @cssstate disabled - The known date is disabled.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsKnownDate',
});

export default reactWrapper;
