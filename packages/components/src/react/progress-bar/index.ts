import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/progress-bar/progress-bar.js';

const tagName = 'cs-progress-bar';

/**
 * @summary Progress bars show how far along an ongoing operation is as a horizontal fill. Use them for file uploads,
 *  multi-step flows, or any task with measurable progress.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/progress-bar
 * @status stable
 * @since 2.0
 *
 * @slot - A label to show inside the progress indicator.
 *
 * @csspart progress-bar - The component's outer wrapper.
 * @csspart indicator - The progress bar's indicator.
 * @csspart label - The progress bar's label.
 *
 * @cssproperty [--track-height=1rem] - The height of the track.
 * @cssproperty [--track-color=var(--cs-color-neutral-fill-normal)] - The color of the track.
 * @cssproperty [--indicator-color=var(--cs-color-brand-fill-loud)] - The color of the indicator.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsProgressBar',
});

export default reactWrapper;
