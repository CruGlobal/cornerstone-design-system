import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/copy-button/copy-button.js';

import { type EventName } from '@lit/react';
import type { CsCopyEvent } from '../../events/events.js';
import type { CsErrorEvent } from '../../events/events.js';
export type { CsCopyEvent } from '../../events/events.js';
export type { CsErrorEvent } from '../../events/events.js';

const tagName = 'cs-copy-button';

/**
 * @summary Copy buttons copy text to the clipboard when the user activates them. They provide built-in success and
 *  error feedback so users know the copy worked.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/copy
 * @status stable
 * @since 3.6
 *
 * @dependency cs-icon
 * @dependency cs-tooltip
 *
 * @event cs-copy - Emitted when the data has been copied.
 * @event cs-error - Emitted when the data could not be copied.
 *
 * @slot - The trigger element. By default, a copy icon button is rendered so this is optional. If desired, you can slot
 *  in a custom element such as `<cs-button>` or `<button>`.
 * @slot copy-icon - The icon to show in the default copy state. Works best with `<cs-icon>`.
 * @slot success-icon - The icon to show when the content is copied. Works best with `<cs-icon>`.
 * @slot error-icon - The icon to show when a copy error occurs. Works best with `<cs-icon>`.
 *
 * @cssstate success - Applied when the copy operation succeeds.
 * @cssstate error - Applied when the copy operation fails.
 *
 * @csspart button - The internal `<button>` element.
 * @csspart copy-icon - The container that holds the copy icon.
 * @csspart success-icon - The container that holds the success icon.
 * @csspart error-icon - The container that holds the error icon.
 * @csspart feedback - The internal `<cs-tooltip>` element.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsCopy: 'cs-copy' as EventName<CsCopyEvent>,
    onCsError: 'cs-error' as EventName<CsErrorEvent>,
  },
  displayName: 'CsCopyButton',
});

export default reactWrapper;
