import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/drawer/drawer.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-drawer';

/**
 * @summary Drawers slide in from the edge of a container to expose additional options and information without
 *  navigating away. Useful for navigation menus, filters, and secondary content.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/drawer
 * @status stable
 * @since 2.0
 *
 * @dependency cs-button
 *
 * @slot - The drawer's main content.
 * @slot label - The drawer's label. Alternatively, you can use the `label` attribute.
 * @slot header-actions - Optional actions to add to the header. Works best with `<cs-button>`.
 * @slot footer - The drawer's footer, usually one or more buttons representing various options.
 *
 * @event cs-show - Emitted when the drawer opens.
 * @event cs-after-show - Emitted after the drawer opens and all animations are complete.
 * @event cs-hide - Emitted when the drawer closes.
 * @event cs-after-hide - Emitted after the drawer closes and all animations are complete.
 * @event {{ source: Element }} cs-hide - Emitted when the drawer is requesting to close. Calling
 *  `event.preventDefault()` will prevent the drawer from closing. You can inspect `event.detail.source` to see which
 *  element caused the drawer to close. If the source is the drawer element itself, the user has pressed [[Escape]] or
 *  the drawer has been closed programmatically. Avoid using this unless closing the drawer will result in destructive
 *  behavior such as data loss.
 *
 * @csspart dialog - The drawer's internal `<dialog>` element.
 * @csspart header - The drawer's header. This element wraps the title and header actions.
 * @csspart header-actions - Optional actions to add to the header. Works best with `<cs-button>`.
 * @csspart title - The drawer's title.
 * @csspart close-button - The close button, a `<cs-button>`.
 * @csspart close-button__button - The close button's exported `button` part.
 * @csspart body - The drawer's body.
 * @csspart footer - The drawer's footer.
 *
 * @cssproperty --spacing - The amount of space around and between the drawer's content.
 * @cssproperty --size - The preferred size of the drawer. This will be applied to the drawer's width or height
 *   depending on its `placement`. Note that the drawer will shrink to accommodate smaller screens.
 * @cssproperty [--backdrop-filter=none] - A filter to apply to the backdrop behind the drawer.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The animation duration when showing the drawer.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The animation duration when hiding the drawer.
 *
 * @property modal - Exposes the internal modal utility that controls focus trapping. To temporarily disable focus
 *   trapping and allow third-party modals spawned from an active Shoelace modal, call `modal.activateExternal()` when
 *   the third-party modal opens. Upon closing, call `modal.deactivateExternal()` to restore Shoelace's focus trapping.
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
  displayName: 'CsDrawer',
});

export default reactWrapper;
