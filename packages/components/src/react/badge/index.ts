import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/badge/badge.js';

const tagName = 'cs-badge';

/**
 * @summary Badges draw attention to adjacent content by displaying a status, count, or label. Use them to highlight
 *  notifications, categorize items, or flag new activity.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/badge
 * @status stable
 * @since 2.0
 *
 * @slot - The badge's content.
 * @slot start - An element, such as `<cs-icon>`, placed before the label.
 * @slot end - An element, such as `<cs-icon>`, placed after the label.
 *
 * @csspart badge - The component's outer wrapper.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 *
 * @cssproperty --pulse-color - The color of the badge's pulse effect when using `attention="pulse"`.
 *
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsBadge',
});

export default reactWrapper;
