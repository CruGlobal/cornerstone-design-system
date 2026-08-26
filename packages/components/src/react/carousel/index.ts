import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/carousel/carousel.js';

import { type EventName } from '@lit/react';
import type { CsSlideChangeEvent } from '../../events/events.js';
export type { CsSlideChangeEvent } from '../../events/events.js';

const tagName = 'cs-carousel';

/**
 * @summary Carousels display a series of content slides along a horizontal or vertical axis, one or more at a time.
 *  Users can navigate between slides with controls, pagination, or autoplay.
 *
 * @since 2.2
 * @status experimental
 *
 * @dependency cs-icon
 *
 * @event {{ index: number, slide: CsCarouselItem }} cs-slide-change - Emitted when the active slide changes.
 *
 * @slot - The carousel's main content, one or more `<cs-carousel-item>` elements.
 * @slot next-icon - Optional next icon to use instead of the default. Works best with `<cs-icon>`.
 * @slot previous-icon - Optional previous icon to use instead of the default. Works best with `<cs-icon>`.
 *
 * @csspart carousel - The component's outer wrapper.
 * @csspart scroll-container - The scroll container that wraps the slides.
 * @csspart pagination - The pagination indicators wrapper.
 * @csspart pagination-item - The pagination indicator.
 * @csspart pagination-item-active - Applied when the item is active.
 * @csspart navigation - The navigation wrapper.
 * @csspart navigation-button - The navigation button.
 * @csspart navigation-button-previous - Applied to the previous button.
 * @csspart navigation-button-next - Applied to the next button.
 *
 * @cssproperty [--aspect-ratio=16/9] - The aspect ratio of each slide.
 * @cssproperty --scroll-hint - The amount of padding to apply to the scroll area, allowing adjacent slides to become
 *  partially visible as a scroll hint.
 * @cssproperty [--slide-gap=var(--cs-space-m)] - The space between each slide.
 *
 * @ssr - `<cs-carousel>` displays its first slide during SSR, but won't be interactive until it hydrates on the client.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    onCsSlideChange: 'cs-slide-change' as EventName<CsSlideChangeEvent>,
  },
  displayName: 'CsCarousel',
});

export default reactWrapper;
