import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/button-group/button-group.js';

const tagName = 'cs-button-group';

/**
 * @summary Button groups combine related buttons into a single visual unit. Use them for toolbars, segmented controls,
 *  or any set of actions that belong together.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/button-group
 * @status stable
 * @since 2.0
 *
 * @slot - One or more `<cs-button>` elements to display in the button group.
 *
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsButtonGroup',
});

export default reactWrapper;
