import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/animation/animation.js';

import { type EventName } from '@lit/react';
import type { CsCancelEvent } from '../../events/events.js';
import type { CsFinishEvent } from '../../events/events.js';
import type { CsStartEvent } from '../../events/events.js';
export type { CsCancelEvent } from '../../events/events.js';
export type { CsFinishEvent } from '../../events/events.js';
export type { CsStartEvent } from '../../events/events.js';

const tagName = 'cs-animation';

/**
 * @summary Animate elements declaratively with nearly 100 baked-in presets, or roll your own with custom keyframes.
 *  Powered by the Web Animations API.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/animation
 * @status stable
 * @since 2.0
 *
 * @event cs-cancel - Emitted when the animation is canceled.
 * @event cs-finish - Emitted when the animation finishes.
 * @event cs-start - Emitted when the animation starts or restarts.
 *
 * @slot - The element to animate. Avoid slotting in more than one element, as subsequent ones will be ignored. To
 *  animate multiple elements, either wrap them in a single container or use multiple `<cs-animation>` elements.
 *
 * @ssr - `<cs-animation>` renders during SSR without causing layout shift, but won't play its animation until the component hydrates on the client. Playback is driven by the Web Animations API, which is only available in the browser.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsCancel: 'cs-cancel' as EventName<CsCancelEvent>,
    onCsFinish: 'cs-finish' as EventName<CsFinishEvent>,
    onCsStart: 'cs-start' as EventName<CsStartEvent>,
  },
  displayName: 'CsAnimation',
});

export default reactWrapper;
