import { html } from 'lit';
import { property } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import variantStyles from '../../styles/component/variants.styles.js';
import styles from './badge.styles.js';

/**
 * @summary Badges draw attention to adjacent content by displaying a status, count, or label. Use them to highlight
 *  notifications, categorize items, or flag new activity.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/badge
 * @status stable
 * @since 0.1
 *
 * @slot - The badge's content.
 * @slot start - An element, such as `<cs-icon>`, placed before the label.
 * @slot end - An element, such as `<cs-icon>`, placed after the label.
 *
 * @csspart badge - The component's outer wrapper.
 * @csspart start - The container that wraps the `start` slot.
 * @csspart end - The container that wraps the `end` slot.
 *
 * @cssproperty --pulse-color - The color of the badge's pulse effect when using `attention="pulse"`.
 *
 */
@customElement('cs-badge')
export default class CsBadge extends CornerstoneElement {
  static css = [variantStyles, styles];

  /** The badge's theme variant. Defaults to `brand` if not within another element with a variant. */
  @property({ reflect: true }) variant:
    'brand' | 'neutral' | 'highlight' | 'information' | 'success' | 'warning' | 'danger' = 'brand';

  /** The badge's visual appearance. */
  @property({ reflect: true }) appearance: 'accent' | 'filled' | 'outlined' | 'filled-outlined' = 'accent';

  /** Draws a pill-style badge with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** Adds an animation to draw attention to the badge. */
  @property({ reflect: true }) attention: 'none' | 'pulse' | 'bounce' = 'none';

  render() {
    return html`
      <span part="start">
        <slot name="start"></slot>
      </span>

      <span part="badge" role="status">
        <slot></slot>
      </span>

      <span part="end">
        <slot name="end"></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-badge': CsBadge;
  }
}
