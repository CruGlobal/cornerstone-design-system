import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/dropdown-item/dropdown-item.js';

const tagName = 'cs-dropdown-item';

/**
 * @summary Dropdown items represent selectable entries within a dropdown menu, including standard actions, checkable
 *  items, and submenu triggers.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/dropdown-item
 * @status stable
 * @since 3.0
 *
 * @dependency cs-icon
 *
 * @event blur - Emitted when the dropdown item loses focus.
 * @event focus - Emitted when the dropdown item gains focus.
 *
 * @slot - The dropdown item's label.
 * @slot icon - An optional icon to display before the label.
 * @slot details - Additional content or details to display after the label.
 * @slot submenu - Submenu items, typically `<cs-dropdown-item>` elements, to create a nested menu.
 *
 * @csspart checkmark - The checkmark icon (a `<cs-icon>` element) when the item is a checkbox.
 * @csspart checkmark__svg - The checkmark icon's `svg` part.
 * @csspart icon - The container for the icon slot.
 * @csspart label - The container for the label slot.
 * @csspart details - The container for the details slot.
 * @csspart submenu-icon - The submenu indicator icon (a `<cs-icon>` element).
 * @csspart submenu-icon__svg - The submenu icon's `svg` part.
 * @csspart submenu - The submenu container.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsDropdownItem',
});

export default reactWrapper;
