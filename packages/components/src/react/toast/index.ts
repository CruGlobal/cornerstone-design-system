import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/toast/toast.js';

const tagName = 'cs-toast';

/**
 * @summary Toasts display brief, non-blocking notifications that appear temporarily above the page content.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/toast
 * @status stable
 * @since 3.3
 *
 * @dependency cs-toast-item
 *
 * @slot - Place `<cs-toast-item>` elements here to show them as notifications.
 *
 * @csspart stack - The container that holds the toast items.
 *
 * @cssproperty [--gap=var(--cs-space-s)] - The gap between stacked toast items.
 * @cssproperty [--width=28rem] - The width of the toast stack.
 *
 * @cssstate visible - Applied when the toast stack has one or more visible toast items.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsToast',
});

export default reactWrapper;
