import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/carousel-item/carousel-item.js';

const tagName = 'cs-carousel-item';

/**
 * @summary Carousel items represent individual slides within a carousel.
 *
 * @since 2.0
 * @status experimental
 *
 * @slot - The carousel item's content..
 *
 * @cssproperty --aspect-ratio - The slide's aspect ratio. Inherited from the carousel by default.
 *
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsCarouselItem',
});

export default reactWrapper;
