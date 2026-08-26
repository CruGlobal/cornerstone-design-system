import { html } from 'lit';
import { property } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import sizeStyles from '../../styles/component/size.styles.js';
import variantStyles from '../../styles/component/variants.styles.js';
import styles from './callout.styles.js';

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
@customElement('cs-callout')
export default class CsCallout extends CornerstoneElement {
  static css = [styles, variantStyles, sizeStyles];

  /** The callout's theme variant. Defaults to `brand` if not within another element with a variant. */
  @property({ reflect: true }) variant:
    'brand' | 'neutral' | 'highlight' | 'information' | 'success' | 'warning' | 'danger' = 'brand';

  /** The callout's visual appearance. */
  @property({ reflect: true }) appearance: 'accent' | 'filled' | 'outlined' | 'plain' | 'filled-outlined';

  /** The callout's size. */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';

  render() {
    return html`
      <div part="icon">
        <slot name="icon"></slot>
      </div>

      <div part="message">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-callout': CsCallout;
  }
}
