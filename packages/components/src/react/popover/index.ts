import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/popover/popover.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-popover';

/**
 * @summary Popovers display contextual content and interactive elements in a floating panel anchored to a trigger. Use
 *  them for rich tooltips, menus, or any content that appears on demand without navigating away.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/popover
 * @status stable
 * @since 3.0
 *
 * @dependency cs-popup
 *
 * @slot - The popover's content. Interactive elements such as buttons and links are supported.
 *
 * @event cs-show - Emitted when the popover begins to show. Canceling this event will stop the popover from showing.
 * @event cs-after-show - Emitted after the popover has shown and all animations are complete.
 * @event cs-hide - Emitted when the popover begins to hide. Canceling this event will stop the popover from hiding.
 * @event cs-after-hide - Emitted after the popover has hidden and all animations are complete.
 *
 * @csspart dialog - The native dialog element that contains the popover content.
 * @csspart body - The popover's body where its content is rendered.
 * @csspart popup - The internal `<cs-popup>` element that positions the popover.
 * @csspart popup__popup - The popup's exported `popup` part. Use this to target the popover's popup container.
 * @csspart popup__arrow - The popup's exported `arrow` part. Use this to target the popover's arrow.
 *
 * @cssproperty [--arrow-size=0.375rem] - The size of the tiny arrow that points to the popover (set to zero to remove).
 * @cssproperty [--max-width=25rem] - The maximum width of the popover's body content.
 * @cssproperty [--show-duration=var(--cs-transition-fast)] - The speed of the show animation.
 * @cssproperty [--hide-duration=var(--cs-transition-fast)] - The speed of the hide animation.
 *
 * @cssstate open - Applied when the popover is open.
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
  displayName: 'CsPopover',
});

export default reactWrapper;
