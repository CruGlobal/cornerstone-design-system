import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/button/button.js';

import { type EventName } from '@lit/react';
import type { CsInvalidEvent } from '../../events/events.js';
export type { CsInvalidEvent } from '../../events/events.js';

const tagName = 'cs-button';

/**
 * @summary Buttons represent actions the user can take, such as submitting a form, opening a dialog, or navigating to
 *  another page.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/button
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 * @dependency cs-spinner
 *
 * @event blur - Emitted when the button loses focus.
 * @event focus - Emitted when the button gains focus.
 * @event cs-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @slot - The button's label.
 * @slot start - An element, such as `<cs-icon>`, placed before the label.
 * @slot end - An element, such as `<cs-icon>`, placed after the label.
 *
 * @csspart button - The component's outer wrapper.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart label - The button's label.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart caret - The button's caret icon, a `<cs-icon>` element.
 * @csspart spinner - The spinner that shows when the button is in the loading state.
 *
 * @cssstate disabled - Applied when the button is disabled.
 * @cssstate icon-button - Applied when the button contains only a `<cs-icon>` with no other content.
 * @cssstate link - Applied when the button is rendered as a link (i.e. `href` is set).
 * @cssstate loading - Applied when the button is in the loading state.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsInvalid: 'cs-invalid' as EventName<CsInvalidEvent>,
  },
  displayName: 'CsButton',
});

export default reactWrapper;
