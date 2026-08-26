import type CsCarouselItem from '../components/carousel-item/carousel-item.js';

export class CsSlideChangeEvent extends Event {
  readonly detail: CsSlideChangeEventDetails;

  constructor(detail: CsSlideChangeEventDetails) {
    super('cs-slide-change', { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}

interface CsSlideChangeEventDetails {
  index: number;
  slide: CsCarouselItem;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'cs-slide-change': CsSlideChangeEvent;
  }
}
