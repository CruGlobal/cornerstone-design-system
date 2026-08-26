import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/intersection-observer/intersection-observer.js';

import { type EventName } from '@lit/react';
import type { CsIntersectEvent } from '../../events/events.js';
export type { CsIntersectEvent } from '../../events/events.js';

const tagName = 'cs-intersection-observer';

/**
 * @summary Tracks immediate child elements and fires events as they move in and out of view. Useful for lazy loading,
 *  scroll-triggered animations, and viewport-aware interactions.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/intersection-observer
 * @status stable
 * @since 2.0
 *
 * @slot - Elements to track. Only immediate children of the host are monitored.
 *
 * @event {{ entry: IntersectionObserverEntry }} cs-intersect - Fired when a tracked element begins or ceases intersecting.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsIntersect: 'cs-intersect' as EventName<CsIntersectEvent>,
  },
  displayName: 'CsIntersectionObserver',
});

export default reactWrapper;
