import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/animated-image/animated-image.js';

import { type EventName } from '@lit/react';
import type { CsLoadEvent } from '../../events/events.js';
import type { CsErrorEvent } from '../../events/events.js';
export type { CsLoadEvent } from '../../events/events.js';
export type { CsErrorEvent } from '../../events/events.js';

const tagName = 'cs-animated-image';

/**
 * @summary Animated images display GIFs and WEBPs with controls to play and pause them on demand. Use them when you
 *  want motion but need to give users control over when it plays.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/animated-image
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @event cs-load - Emitted when the image loads successfully.
 * @event cs-error - Emitted when the image fails to load.
 *
 * @slot play-icon - Optional play icon to use instead of the default. Works best with `<cs-icon>`.
 * @slot pause-icon - Optional pause icon to use instead of the default. Works best with `<cs-icon>`.
 *
 * @csspart control-box - The container that surrounds the pause/play icons and provides their background.
 *
 * @cssproperty --control-box-size - The size of the icon box.
 * @cssproperty --icon-size - The size of the play/pause icons.
 *
 * @ssr - Due to browser limitations, `<cs-animated-image>` can't render during SSR. As a fallback you can use a `<video>` tag, but its controls won't work, and the gif or webp will always auto-play.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsLoad: 'cs-load' as EventName<CsLoadEvent>,
    onCsError: 'cs-error' as EventName<CsErrorEvent>,
  },
  displayName: 'CsAnimatedImage',
});

export default reactWrapper;
