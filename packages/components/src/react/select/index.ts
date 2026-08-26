import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/select/select.js';

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

const tagName = 'cs-select';

/**
 * @summary Selects let users choose one or more values from a dropdown list of predefined options. Use them in forms
 *  when a fixed set of choices needs to fit in limited space.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/select
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 * @dependency cs-popup
 * @dependency cs-tag
 * @dependency cs-option
 *
 * @slot - The listbox options. Must be `<cs-option>` elements. You can use `<cs-divider>` to group items visually.
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot start - An element, such as `<cs-icon>`, placed at the start of the combobox.
 * @slot end - An element, such as `<cs-icon>`, placed at the end of the combobox.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot expand-icon - The icon to show when the control is expanded and collapsed. Rotates on open and close.
 * @slot hint - Text that describes how to use the input. Alternatively, you can use the `hint` attribute.
 *
 * @event change - Emitted when the control's value changes.
 * @event input - Emitted when the control receives input.
 * @event focus - Emitted when the control gains focus.
 * @event blur - Emitted when the control loses focus.
 * @event cs-clear - Emitted when the control's value is cleared.
 * @event cs-show - Emitted when the select's menu opens.
 * @event cs-after-show - Emitted after the select's menu opens and all animations are complete.
 * @event cs-hide - Emitted when the select's menu closes.
 * @event cs-after-hide - Emitted after the select's menu closes and all animations are complete.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The select's wrapper.
 * @csspart hint - The hint's wrapper.
 * @csspart combobox - The container the wraps the start, end, value, clear icon, and expand button.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart display-input - The element that displays the selected option's label, an `<input>` element.
 * @csspart listbox - The listbox container where options are slotted.
 * @csspart tags - The container that houses option tags when `multiselect` is used.
 * @csspart tag - The individual tags that represent each multiselect option.
 * @csspart tag__content - The tag's content part.
 * @csspart tag__remove-button - The tag's remove button.
 * @csspart tag__remove-button__button - The tag's remove button's exported `button` part.
 * @csspart clear-button - The clear button.
 * @csspart expand-icon - The container that wraps the expand icon.
 *
 * @cssproperty [--show-duration=var(--cs-transition-fast)] - The duration of the show animation.
 * @cssproperty [--hide-duration=var(--cs-transition-fast)] - The duration of the hide animation.
 * @cssproperty [--tag-max-size=10ch] - When using `multiple`, the max size of tags before their content is truncated.
 *
 * @cssstate blank - The select is empty.
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
  displayName: 'CsSelect',
});

export default reactWrapper;
