import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/relative-time/relative-time.js';

const tagName = 'cs-relative-time';

/**
 * @summary Relative times display a date as a localized phrase relative to now, such as "3 hours ago" or "in 2 days".
 *  The phrase updates automatically as time passes and respects the user's locale.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/relative-time
 * @status stable
 * @since 2.0
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsRelativeTime',
});

export default reactWrapper;
