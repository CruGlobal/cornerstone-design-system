import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/otp-input/otp-input.js';

import { type EventName } from '@lit/react';
import type { CsCompleteEvent } from '../../events/events.js';
import type { CsClearEvent } from '../../events/events.js';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsCompleteEvent } from '../../events/events.js';
export type { CsClearEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-otp-input';

/**
 * @summary OTP inputs collect one-time passcodes, PINs, and other fixed-length codes, one character per segment.
 * Use them for SMS verification, two-factor authentication, and invite codes.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/otp-input
 * @status experimental
 * @since 3.11
 *
 * @slot label - An optional label. Use this for labels that contain HTML. Takes precedence over the `label` attribute, which is its fallback.
 * @slot hint - Optional hint text. Use this for hints that contain HTML. Takes precedence over the `hint` attribute, which is its fallback.
 *
 * @event focus - Emitted when the control gains focus.
 * @event blur - Emitted when the control loses focus.
 * @event input - Emitted when a character is entered or removed.
 * @event change - Emitted when the value changes and the field loses focus.
 * @event cs-complete - Emitted once when all segments are filled. Cancelable — call `preventDefault()` to stop
 *   `autosubmit` from submitting the form for this completion.
 * @event cs-clear - Emitted when the control's value is cleared.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart label - The label element.
 * @csspart hint - The hint element.
 * @csspart segments - The wrapper around all segment cells and separators.
 * @csspart segment - An individual character segment cell.
 * @csspart segment-literal - Inert literal text between segment groups (e.g. space or dash).
 *
 * @cssstate --blank - Applied when no characters have been entered.
 * @cssstate --filled - Applied when all segments are filled.
 * @cssstate disabled - Applied when the component is disabled.
 * @cssstate readonly - Applied when the component is readonly.
 * @cssstate user-invalid - Applied when validation fails after interaction.
 *
 * @cssproperty [--segment-size=2.5em] - Width and height of each segment cell.
 * @cssproperty [--segment-gap=var(--cs-space-xs)] - Gap between segments (not used in `contained` appearance).
 * @cssproperty [--segment-border-radius=var(--cs-form-control-border-radius)] - Corner radius of each segment.
 * @cssproperty [--mask-char='•'] - Character shown in place of entered values when `mask` is set, and as a hint
 *   in empty segments when `with-mask` is set.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsComplete: 'cs-complete' as EventName<CsCompleteEvent>,
    onCsClear: 'cs-clear' as EventName<CsClearEvent>,
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsOtpInput',
});

export default reactWrapper;
