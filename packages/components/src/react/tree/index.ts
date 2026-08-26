import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tree/tree.js';

import { type EventName } from '@lit/react';
import type { CsSelectionChangeEvent } from '../../events/events.js';
export type { CsSelectionChangeEvent } from '../../events/events.js';

const tagName = 'cs-tree';

/**
 * @summary Trees allow you to display a hierarchical list of selectable tree items. Items with children can be expanded
 *  and collapsed as desired by the user.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tree
 * @status stable
 * @since 2.0
 *
 * @dependency cs-tree-item
 *
 * @event {{ selection: CsTreeItem[] }} cs-selection-change - Emitted when a tree item is selected or deselected.
 *
 * @slot - The default slot.
 * @slot expand-icon - The icon to show when the tree item is expanded. Works best with `<cs-icon>`.
 * @slot collapse-icon - The icon to show when the tree item is collapsed. Works best with `<cs-icon>`.
 *
 * @csspart tree - The component's outer wrapper.
 *
 * @cssproperty [--indent-size=var(--cs-space-m)] - The size of the indentation for nested items.
 * @cssproperty [--indent-guide-color=var(--cs-color-surface-border)] - The color of the indentation line.
 * @cssproperty [--indent-guide-offset=0] - The amount of vertical spacing to leave between the top and bottom of the
 *  indentation line's starting position.
 * @cssproperty [--indent-guide-style=solid] - The style of the indentation line, e.g. solid, dotted, dashed.
 * @cssproperty [--indent-guide-width=0] - The width of the indentation line.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsSelectionChange: 'cs-selection-change' as EventName<CsSelectionChangeEvent>,
  },
  displayName: 'CsTree',
});

export default reactWrapper;
