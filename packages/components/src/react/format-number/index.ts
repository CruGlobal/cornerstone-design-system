import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/format-number/format-number.js';

const tagName = 'cs-format-number';

/**
 * @summary Formats a number for display using the specified locale and options, including currency, percent, and unit
 *  styles. Powered by the Intl.NumberFormat API.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/format-number
 * @status stable
 * @since 2.0
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsFormatNumber',
});

export default reactWrapper;
