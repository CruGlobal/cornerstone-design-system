import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/spinner/spinner.js';

const tagName = 'cs-spinner';

/**
 * @summary Spinners indicate that an operation is in progress when the duration is unknown. Use them for loading states
 *  where a determinate progress bar isn't practical.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/spinner
 * @status stable
 * @since 2.0
 *
 * @csspart spinner - The component's outer wrapper.
 *
 * @cssproperty --track-width - The width of the track.
 * @cssproperty --track-color - The color of the track.
 * @cssproperty --indicator-color - The color of the spinner's indicator.
 * @cssproperty --speed - The time it takes for the spinner to complete one animation cycle.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsSpinner',
});

export default reactWrapper;
