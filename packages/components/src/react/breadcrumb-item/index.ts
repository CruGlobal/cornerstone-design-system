import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/breadcrumb-item/breadcrumb-item.js';

const tagName = 'cs-breadcrumb-item';

/**
 * @summary Breadcrumb items represent individual links inside a breadcrumb, typically one per level of the site
 *  hierarchy.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/breadcrumb-item
 * @status stable
 * @since 2.0
 *
 * @slot - The breadcrumb item's label.
 * @slot start - An element, such as `<cs-icon>`, placed before the label.
 * @slot end - An element, such as `<cs-icon>`, placed after the label.
 * @slot separator - The separator to use for the breadcrumb item. This will only change the separator for this item. If
 * you want to change it for all items in the group, set the separator on `<cs-breadcrumb>` instead.
 *
 * @csspart label - The breadcrumb item's label.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 * @csspart separator - The container that wraps the separator.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsBreadcrumbItem',
});

export default reactWrapper;
