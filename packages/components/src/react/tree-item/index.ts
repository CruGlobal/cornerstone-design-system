import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tree-item/tree-item.js';

import { type EventName } from '@lit/react';
import type { CsExpandEvent } from '../../events/events.js';
import type { CsAfterExpandEvent } from '../../events/events.js';
import type { CsCollapseEvent } from '../../events/events.js';
import type { CsAfterCollapseEvent } from '../../events/events.js';
import type { CsLazyChangeEvent } from '../../events/events.js';
import type { CsLazyLoadEvent } from '../../events/events.js';
export type { CsExpandEvent } from '../../events/events.js';
export type { CsAfterExpandEvent } from '../../events/events.js';
export type { CsCollapseEvent } from '../../events/events.js';
export type { CsAfterCollapseEvent } from '../../events/events.js';
export type { CsLazyChangeEvent } from '../../events/events.js';
export type { CsLazyLoadEvent } from '../../events/events.js';

const tagName = 'cs-tree-item';

/**
 * @summary Tree items represent a single hierarchical node inside a tree, and can contain nested items that expand and
 *  collapse.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tree-item
 * @status stable
 * @since 2.0
 *
 * @dependency cs-checkbox
 * @dependency cs-icon
 * @dependency cs-spinner
 *
 * @event cs-expand - Emitted when the tree item expands.
 * @event cs-after-expand - Emitted after the tree item expands and all animations are complete.
 * @event cs-collapse - Emitted when the tree item collapses.
 * @event cs-after-collapse - Emitted after the tree item collapses and all animations are complete.
 * @event cs-lazy-change - Emitted when the tree item's lazy state changes.
 * @event cs-lazy-load - Emitted when a lazy item is selected. Use this event to asynchronously load data and append
 *  items to the tree before expanding. After appending new items, remove the `lazy` attribute to remove the loading
 *  state and update the tree.
 *
 * @slot - The default slot.
 * @slot expand-icon - The icon to show when the tree item is expanded.
 * @slot collapse-icon - The icon to show when the tree item is collapsed.
 *
 * @csspart tree-item - The component's outer wrapper.
 * @csspart item - The tree item's container. This element wraps everything except slotted tree item children.
 * @csspart indentation - The tree item's indentation container.
 * @csspart expand-button - The container that wraps the tree item's expand button and spinner.
 * @csspart spinner - The spinner that shows when a lazy tree item is in the loading state.
 * @csspart spinner__spinner - The spinner's exported `spinner` part.
 * @csspart label - The tree item's label.
 * @csspart children - The container that wraps the tree item's nested children.
 * @csspart checkbox - The checkbox that shows when using multiselect.
 * @csspart checkbox__checkbox - The checkbox's exported `checkbox` part.
 * @csspart checkbox__control - The checkbox's exported `control` part.
 * @csspart checkbox__checked-icon - The checkbox's exported `checked-icon` part.
 * @csspart checkbox__indeterminate-icon - The checkbox's exported `indeterminate-icon` part.
 * @csspart checkbox__label - The checkbox's exported `label` part.
 *
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The animation duration when expanding tree items.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The animation duration when collapsing tree items.
 *
 * @cssstate disabled - Applied when the tree item is disabled.
 * @cssstate expanded - Applied when the tree item is expanded.
 * @cssstate indeterminate - Applied when the selection is indeterminate.
 * @cssstate selected - Applied when the tree item is selected.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsExpand: 'cs-expand' as EventName<CsExpandEvent>,
    onCsAfterExpand: 'cs-after-expand' as EventName<CsAfterExpandEvent>,
    onCsCollapse: 'cs-collapse' as EventName<CsCollapseEvent>,
    onCsAfterCollapse: 'cs-after-collapse' as EventName<CsAfterCollapseEvent>,
    onCsLazyChange: 'cs-lazy-change' as EventName<CsLazyChangeEvent>,
    onCsLazyLoad: 'cs-lazy-load' as EventName<CsLazyLoadEvent>,
  },
  displayName: 'CsTreeItem',
});

export default reactWrapper;
