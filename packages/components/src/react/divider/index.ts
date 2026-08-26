import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/divider/divider.js';

const tagName = 'cs-divider';

/**
 * @summary Dividers visually separate or group adjacent elements with a horizontal or vertical line. Use them to
 *  establish rhythm and hierarchy within menus, toolbars, and layouts.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/divider
 * @status stable
 * @since 2.0
 *
 * @cssproperty --color - The color of the divider.
 * @cssproperty --width - The width of the divider.
 * @cssproperty --spacing - The spacing of the divider.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsDivider',
});

export default reactWrapper;
