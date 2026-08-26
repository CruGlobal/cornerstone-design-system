import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/breadcrumb/breadcrumb.js';

const tagName = 'cs-breadcrumb';

/**
 * @summary Breadcrumbs display a trail of links that show users where they are in a site's hierarchy. They help users
 *  understand the current location and navigate back to parent pages.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/breadcrumb
 * @status stable
 * @since 2.0
 *
 * @slot - One or more breadcrumb items to display.
 * @slot separator - The separator to use between breadcrumb items. Works best with `<cs-icon>`.
 *
 * @dependency cs-icon
 *
 * @csspart breadcrumb - The component's outer wrapper.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsBreadcrumb',
});

export default reactWrapper;
