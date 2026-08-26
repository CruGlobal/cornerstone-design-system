import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/callout/callout.js';

const tagName = 'cs-callout';

/**
 * @summary Callouts display important messages inline with surrounding content. Use them to highlight tips, warnings,
 *  errors, or other information users should not miss.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/callout
 * @status stable
 * @since 3.0
 *
 * @slot - The callout's main content.
 * @slot icon - An icon to show in the callout. Works best with `<cs-icon>`.
 *
 * @csspart icon - The container that wraps the optional icon.
 * @csspart message - The container that wraps the callout's main content.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsCallout',
});

export default reactWrapper;
