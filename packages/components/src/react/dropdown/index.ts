import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/dropdown/dropdown.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
import type { CsSelectEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';
export type { CsSelectEvent } from '../../events/events.js';

const tagName = 'cs-dropdown';

/**
 * @summary Dropdowns display a list of options triggered by a button or other element. They support keyboard
 *  navigation, submenus, and checkable items for building menus and context actions.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/dropdown
 * @status stable
 * @since 2.0
 *
 * @dependency cs-dropdown-item
 * @dependency cs-popup
 *
 * @event cs-show - Emitted when the dropdown is about to show.
 * @event cs-after-show - Emitted after the dropdown has been shown.
 * @event cs-hide - Emitted when the dropdown is about to hide.
 * @event cs-after-hide - Emitted after the dropdown has been hidden.
 * @event cs-select - Emitted when an item in the dropdown is selected.
 *
 * @slot - The dropdown's items, typically `<cs-dropdown-item>` elements.
 * @slot trigger - The element that triggers the dropdown, such as a `<cs-button>` or `<button>`.
 *
 * @csspart menu - The dropdown menu container.
 *
 * @cssproperty --show-duration - The duration of the show animation.
 * @cssproperty --hide-duration - The duration of the hide animation.
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
    onCsSelect: 'cs-select' as EventName<CsSelectEvent>,
  },
  displayName: 'CsDropdown',
});

export default reactWrapper;
