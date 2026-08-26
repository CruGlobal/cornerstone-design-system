import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/comparison/comparison.js';

const tagName = 'cs-comparison';

/**
 * @summary Comparisons show the visual differences between two pieces of similar content using a draggable divider. Use
 *  them for before/after images, design revisions, or side-by-side previews.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/comparison
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot before - The before content, often an `<img>` or `<svg>` element.
 * @slot after - The after content, often an `<img>` or `<svg>` element.
 * @slot handle - The icon used inside the handle.
 *
 * @event change - Emitted when the position changes.
 *
 * @csspart comparison - The component's outer wrapper.
 * @csspart before - The container that wraps the before content.
 * @csspart after - The container that wraps the after content.
 * @csspart divider - The divider that separates the before and after content.
 * @csspart handle - The handle that the user drags to expose the after content.
 *
 * @cssproperty --divider-width - The width of the dividing line.
 * @cssproperty --handle-size - The size of the compare handle.
 *
 * @cssstate dragging - Applied when the comparison is being dragged.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsComparison',
});

export default reactWrapper;
