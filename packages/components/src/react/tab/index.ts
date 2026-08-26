import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tab/tab.js';

const tagName = 'cs-tab';

/**
 * @summary Tabs label and activate an individual panel inside a tab group.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tab
 * @status stable
 * @since 2.0
 *
 * @slot - The tab's label.
 *
 * @csspart tab - The component's outer wrapper.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsTab',
});

export default reactWrapper;
