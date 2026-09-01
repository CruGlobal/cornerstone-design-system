import { html } from 'lit';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import styles from './carousel-item.styles.js';

/**
 * @summary Carousel items represent individual slides within a carousel.
 *
 * @since 0.1
 * @status experimental
 *
 * @slot - The carousel item's content..
 *
 * @cssproperty --aspect-ratio - The slide's aspect ratio. Inherited from the carousel by default.
 *
 */
@customElement('cs-carousel-item')
export default class CsCarouselItem extends CornerstoneElement {
  static css = styles;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-carousel-item': CsCarouselItem;
  }
}
