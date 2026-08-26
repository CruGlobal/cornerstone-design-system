import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/scroller/scroller.js';

const tagName = 'cs-scroller';

/**
 * @summary Scrollers wrap overflowing content in an accessible container with visual cues that help users recognize and
 *  navigate scrollable regions.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/scroller
 * @status stable
 * @since 3.0
 *
 * @slot - The content to show inside the scroller.
 *
 * @cssproperty [--shadow-color=var(--cs-color-surface-default)] - The base color of the shadow.
 * @cssproperty [--shadow-size=2rem] - The size of the shadow.
 *
 * @csspart content - The container that wraps the slotted content.
 * @csspart start-shadow - The scroll shadow shown at the start edge when more content is available, unless `without-shadow` is set.
 * @csspart end-shadow - The scroll shadow shown at the end edge when more content is available, unless `without-shadow` is set.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsScroller',
});

export default reactWrapper;
