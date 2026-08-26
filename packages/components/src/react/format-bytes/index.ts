import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/format-bytes/format-bytes.js';

const tagName = 'cs-format-bytes';

/**
 * @summary Formats a number of bytes as a human-readable string with the appropriate unit, such as kB, MB, or GB.
 *  Supports both byte and bit units with configurable locale.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/format-bytes
 * @status stable
 * @since 2.0
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsFormatBytes',
});

export default reactWrapper;
