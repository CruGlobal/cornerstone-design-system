import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/progress-ring/progress-ring.js';

const tagName = 'cs-progress-ring';

/**
 * @summary Progress rings show how far along a determinate operation is using a circular indicator. Use them as a
 *  compact alternative to progress bars when horizontal space is limited.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/progress-ring
 * @status stable
 * @since 2.0
 *
 * @slot - A label to show inside the ring.
 *
 * @csspart progress-ring - The component's outer wrapper.
 * @csspart label - The progress ring label.
 * @csspart track - The progress ring's track.
 * @csspart indicator - The progress ring's indicator.
 *
 * @cssproperty --size - The diameter of the progress ring (cannot be a percentage).
 * @cssproperty --track-width - The width of the track.
 * @cssproperty --track-color - The color of the track.
 * @cssproperty --indicator-width - The width of the indicator. Defaults to the track width.
 * @cssproperty --indicator-color - The color of the indicator.
 * @cssproperty --indicator-transition-duration - The duration of the indicator's transition when the value changes.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsProgressRing',
});

export default reactWrapper;
