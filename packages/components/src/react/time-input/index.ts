import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/time-input/time-input.js';

import { type EventName } from '@lit/react';
import type { CsClearEvent } from '../../events/events.js';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsClearEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-time-input';

/**
 * @summary Time pickers let users enter a time through a segmented field or select one visually from a popup column
 *  picker. They support 12- and 24-hour formats, optional seconds, and locale-aware segment order.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/time-input
 * @status experimental
 * @since 3.8
 *
 * @dependency cs-icon
 * @dependency cs-popup
 *
 * @slot label - The time picker's label. Alternatively, use the `label` attribute.
 * @slot hint - Text that describes how to use the time picker. Alternatively, use the `hint` attribute.
 * @slot start - An element placed at the start of the input.
 * @slot end - An element placed at the end of the input.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show on the popup toggle button. Defaults to a clock icon.
 * @slot footer - Content shown below the column picker in the popup. Replaces the default Now button when present.
 *
 * @event change - Emitted when the committed value changes.
 * @event input - Emitted as the user types into a segment or interacts with the popup columns.
 * @event focus - Emitted when the control receives focus.
 * @event blur - Emitted when the control loses focus.
 * @event cs-clear - Emitted when the clear button is activated.
 * @event cs-show - Emitted when the popup is about to open. Cancelable.
 * @event cs-after-show - Emitted after the popup opens and animations complete.
 * @event cs-hide - Emitted when the popup is about to close. Cancelable.
 * @event cs-after-hide - Emitted after the popup closes and animations complete.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The input's wrapper.
 * @csspart hint - The hint's wrapper.
 * @csspart time-input - The component's outer wrapper.
 * @csspart input-wrapper - The container around the start slot, segmented input, clear button, and expand button.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart input - The segmented input group.
 * @csspart segment - Each editable segment (hour/minute/second/AM-PM spinbutton). Use `[part~="segment"]` to style all.
 * @csspart segment-literal - Inert literal text between segments (separators).
 * @csspart clear-button - The clear button.
 * @csspart expand-button - The popup toggle button.
 * @csspart expand-icon - The expand icon wrapper.
 * @csspart popup - The popup container.
 * @csspart columns - The row of column listboxes inside the popup.
 * @csspart column - Each column listbox.
 * @csspart column-hour - The hour column listbox.
 * @csspart column-minute - The minute column listbox.
 * @csspart column-second - The second column listbox.
 * @csspart column-day-period - The AM/PM column listbox.
 * @csspart column-item - Each option inside a column.
 * @csspart column-item-selected - The currently selected option inside a column.
 * @csspart now-button - The default "Now" button rendered in the popup footer when `with-now` is set.
 *
 * @cssproperty [--show-duration=var(--cs-transition-fast)] - The duration of the show animation.
 * @cssproperty [--hide-duration=var(--cs-transition-fast)] - The duration of the hide animation.
 * @cssproperty [--column-item-height=2.25em] - Height of each option inside a popup column.
 * @cssproperty [--column-width=3em] - Width of each popup column.
 *
 * @cssstate blank - The time picker has no committed value.
 * @cssstate open - The popup is open.
 * @cssstate disabled - The time picker is disabled.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsClear: 'cs-clear' as EventName<CsClearEvent>,
    onCsShow: 'cs-show' as EventName<CsShowEvent>,
    onCsAfterShow: 'cs-after-show' as EventName<CsAfterShowEvent>,
    onCsHide: 'cs-hide' as EventName<CsHideEvent>,
    onCsAfterHide: 'cs-after-hide' as EventName<CsAfterHideEvent>,
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsTimeInput',
});

export default reactWrapper;
