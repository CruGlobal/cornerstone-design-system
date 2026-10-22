import { html } from 'lit';
import { property } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import styles from './skeleton.styles.js';

/**
 * @summary Skeletons show placeholder shapes where content will appear once it finishes loading, reducing perceived
 *  wait time and preventing layout shift.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/skeleton
 * @status stable
 * @since 0.1
 *
 * @csspart indicator - The skeleton's indicator which is responsible for its color and animation.
 *
 * @cssproperty [--cs-skeleton-color=var(--cs-color-neutral-fill-normal)] - The color of the skeleton. In forced
 *  colors mode the skeleton is always `GrayText`, since any other color is forced to the page background.
 * @cssproperty [--cs-skeleton-sheen-color=color-mix(in oklab, var(--cs-skeleton-color), var(--cs-color-surface-raised))] - The sheen color when the skeleton is in its loading state.
 */
@customElement('cs-skeleton')
export default class CsSkeleton extends CornerstoneElement {
  static css = styles;

  /** Determines which effect the skeleton will use. */
  @property({ reflect: true }) effect: 'pulse' | 'sheen' | 'none' = 'none';

  render() {
    return html` <div part="indicator" class="indicator"></div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-skeleton': CsSkeleton;
  }
}
