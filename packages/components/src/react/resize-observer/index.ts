import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/resize-observer/resize-observer.js';

import { type EventName } from '@lit/react';
import type { CsResizeEvent } from '../../events/events.js';
export type { CsResizeEvent } from '../../events/events.js';

const tagName = 'cs-resize-observer';

/**
 * @summary Resize observers watch their slotted elements for size changes and emit an event when they occur. Provides a
 *  thin, declarative interface to the browser's ResizeObserver API.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/resize-observer
 * @status stable
 * @since 2.0
 *
 * @slot - One or more elements to watch for resizing.
 *
 * @event {{ entries: ResizeObserverEntry[] }} cs-resize - Emitted when the element is resized.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsResize: 'cs-resize' as EventName<CsResizeEvent>,
  },
  displayName: 'CsResizeObserver',
});

export default reactWrapper;
