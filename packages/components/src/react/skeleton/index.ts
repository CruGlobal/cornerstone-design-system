import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/skeleton/skeleton.js';

const tagName = 'cs-skeleton';

/**
 * @summary Skeletons show placeholder shapes where content will appear once it finishes loading, reducing perceived
 *  wait time and preventing layout shift.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/skeleton
 * @status stable
 * @since 2.0
 *
 * @csspart indicator - The skeleton's indicator which is responsible for its color and animation.
 *
 * @cssproperty --color - The color of the skeleton.
 * @cssproperty --sheen-color - The sheen color when the skeleton is in its loading state.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsSkeleton',
});

export default reactWrapper;
