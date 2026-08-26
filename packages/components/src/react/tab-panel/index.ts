import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/tab-panel/tab-panel.js';

const tagName = 'cs-tab-panel';

/**
 * @summary Tab panels hold the content shown for a single tab inside a tab group.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tab-panel
 * @status stable
 * @since 2.0
 *
 * @slot - The tab panel's content.
 *
 *
 * @cssproperty --padding - The tab panel's padding.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsTabPanel',
});

export default reactWrapper;
