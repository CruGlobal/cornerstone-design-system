import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/checkbox/checkbox.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-checkbox';

/**
 * @summary Checkboxes let users toggle an option on or off, or select multiple items from a list. They also support an
 *  indeterminate state for partial selections in groups.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/checkbox
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot - The checkbox's label.
 * @slot hint - Text that describes how to use the checkbox. Alternatively, you can use the `hint` attribute.
 *
 * @event blur - Emitted when the checkbox loses focus.
 * @event change - Emitted when the checked state changes.
 * @event focus - Emitted when the checkbox gains focus.
 * @event input - Emitted when the checkbox receives input.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart checkbox - The component's outer wrapper.
 * @csspart control - The square container that wraps the checkbox's checked state.
 * @csspart checked-icon - The checked icon, a `<cs-icon>` element.
 * @csspart indeterminate-icon - The indeterminate icon, a `<cs-icon>` element.
 * @csspart icon - Whichever state icon is currently rendered, checked or indeterminate.
 * @csspart label - The container that wraps the checkbox's label.
 * @csspart hint - The hint's wrapper.
 *
 * @cssproperty --checked-icon-color - The color of the checked and indeterminate icons.
 * @cssproperty --checked-icon-scale - The size of the checked and indeterminate icons relative to the checkbox.
 *
 * @cssstate checked - Applied when the checkbox is checked.
 * @cssstate disabled - Applied when the checkbox is disabled.
 * @cssstate indeterminate - Applied when the checkbox is in an indeterminate state.
 *
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsCheckbox',
});

export default reactWrapper;
