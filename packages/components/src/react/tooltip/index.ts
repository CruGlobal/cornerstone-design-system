import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tooltip/tooltip.js';

import { type EventName } from '@lit/react';
import type { CsShowEvent } from '../../events/events.js';
import type { CsAfterShowEvent } from '../../events/events.js';
import type { CsHideEvent } from '../../events/events.js';
import type { CsAfterHideEvent } from '../../events/events.js';
export type { CsShowEvent } from '../../events/events.js';
export type { CsAfterShowEvent } from '../../events/events.js';
export type { CsHideEvent } from '../../events/events.js';
export type { CsAfterHideEvent } from '../../events/events.js';

const tagName = 'cs-tooltip';

/**
 * @summary Tooltips display brief contextual information when the user hovers, focuses, or taps a target element.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tooltip
 * @status stable
 * @since 2.0
 *
 * @dependency cs-popup
 *
 * @slot - The tooltip's default slot where any content should live. Interactive content should be avoided.
 *
 * @event cs-show - Emitted when the tooltip begins to show.
 * @event cs-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event cs-hide - Emitted when the tooltip begins to hide.
 * @event cs-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @csspart tooltip - The component's outer wrapper.
 * @csspart tooltip__popup - The popup's exported `popup` part. Use this to target the tooltip's popup container.
 * @csspart tooltip__arrow - The popup's exported `arrow` part. Use this to target the tooltip's arrow.
 * @csspart body - The tooltip's body where its content is rendered.
 *
 * @cssproperty --max-width - The maximum width of the tooltip before its content will wrap.
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
  displayName: 'CsTooltip',
});

export default reactWrapper;
