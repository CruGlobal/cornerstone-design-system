import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/split-panel/split-panel.js';

import { type EventName } from '@lit/react';
import type { CsRepositionEvent } from '../../events/events.js';
export type { CsRepositionEvent } from '../../events/events.js';

const tagName = 'cs-split-panel';

/**
 * @summary Split panels display two adjacent panels separated by a draggable divider, letting users resize each side to
 *  suit their workflow.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/split-panel
 * @status stable
 * @since 2.0
 *
 * @event cs-reposition - Emitted when the divider's position changes.
 *
 * @slot start - Content to place in the start panel.
 * @slot end - Content to place in the end panel.
 * @slot divider - The divider. Useful for slotting in a custom icon that renders as a handle.
 *
 * @csspart start - The start panel.
 * @csspart end - The end panel.
 * @csspart panel - Targets both the start and end panels.
 * @csspart divider - The divider that separates the start and end panels.
 *
 * @cssproperty [--divider-width=4px] - The width of the visible divider.
 * @cssproperty [--divider-hit-area=12px] - The invisible region around the divider where dragging can occur. This is
 *  usually wider than the divider to facilitate easier dragging.
 * @cssproperty [--min=0] - The minimum allowed size of the primary panel.
 * @cssproperty [--max=100%] - The maximum allowed size of the primary panel.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsReposition: 'cs-reposition' as EventName<CsRepositionEvent>,
  },
  displayName: 'CsSplitPanel',
});

export default reactWrapper;
