import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/dialog/dialog.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-dialog';

/**
 * @summary Dialogs appear above the page and require the user's immediate attention. Use them for confirmations, forms,
 *  or focused tasks that interrupt the main flow.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/dialog
 * @status stable
 * @since 2.0
 *
 * @dependency cs-button
 *
 * @slot - The dialog's main content.
 * @slot label - The dialog's label. Alternatively, you can use the `label` attribute.
 * @slot header-actions - Optional actions to add to the header. Works best with `<cs-button>`.
 * @slot footer - The dialog's footer, usually one or more buttons representing various options.
 *
 * @event cs-show - Emitted when the dialog opens.
 * @event cs-after-show - Emitted after the dialog opens and all animations are complete.
 * @event {{ source: Element }} cs-hide - Emitted when the dialog is requested to close. Calling
 *  `event.preventDefault()` will prevent the dialog from closing. You can inspect `event.detail.source` to see which
 *  element caused the dialog to close. If the source is the dialog element itself, the user has pressed [[Escape]] or
 *  the dialog has been closed programmatically. Avoid using this unless closing the dialog will result in destructive
 *  behavior such as data loss.
 * @event cs-after-hide - Emitted after the dialog closes and all animations are complete.
 *
 * @csspart dialog - The dialog's internal `<dialog>` element.
 * @csspart header - The dialog's header. This element wraps the title and header actions.
 * @csspart header-actions - Optional actions to add to the header. Works best with `<cs-button>`.
 * @csspart title - The dialog's title.
 * @csspart close-button - The close button, a `<cs-button>`.
 * @csspart close-button__button - The close button's exported `button` part.
 * @csspart body - The dialog's body.
 * @csspart footer - The dialog's footer.
 *
 * @cssproperty --spacing - The amount of space around and between the dialog's content.
 * @cssproperty --width - The preferred width of the dialog. Note that the dialog will shrink to accommodate smaller screens.
 * @cssproperty [--backdrop-filter=none] - A filter to apply to the backdrop behind the dialog.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The animation duration when showing the dialog.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The animation duration when hiding the dialog.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsShow: 'cs-show' as EventName<CsShowEvent>,
    onCsAfterShow: 'cs-after-show' as EventName<CsAfterShowEvent>,
    onCsHide: 'cs-hide' as EventName<CsHideEvent>,
    onCsAfterHide: 'cs-after-hide' as EventName<CsAfterHideEvent>,
  },
  displayName: 'CsDialog',
});

export default reactWrapper;
