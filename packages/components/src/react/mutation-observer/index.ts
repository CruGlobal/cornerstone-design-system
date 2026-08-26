import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/mutation-observer/mutation-observer.js';

import { type EventName } from '@lit/react';
import type { CsMutationEvent } from '../../events/events.js';
export type { CsMutationEvent } from '../../events/events.js';

const tagName = 'cs-mutation-observer';

/**
 * @summary Mutation observers watch for changes to an element's DOM tree and emit an event when they occur. Provides a
 *  thin, declarative interface to the browser's MutationObserver API.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/mutation-observer
 * @status stable
 * @since 2.0
 *
 * @event {{ mutationList: MutationRecord[] }} cs-mutation - Emitted when a mutation occurs.
 *
 * @slot - The content to watch for mutations.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsMutation: 'cs-mutation' as EventName<CsMutationEvent>,
  },
  displayName: 'CsMutationObserver',
});

export default reactWrapper;
