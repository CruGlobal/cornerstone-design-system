import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/format-date/format-date.js';

const tagName = 'cs-format-date';

/**
 * @summary Formats a date or time for display using the specified locale and options. Powered by the
 *  Intl.DateTimeFormat API for consistent, localized output.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/format-date
 * @status stable
 * @since 2.0
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsFormatDate',
});

export default reactWrapper;
