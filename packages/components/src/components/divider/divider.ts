import { property } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { watch } from '../../internal/watch.js';
import styles from './divider.styles.js';

/**
 * @summary Dividers visually separate or group adjacent elements with a horizontal or vertical line. Use them to
 *  establish rhythm and hierarchy within menus, toolbars, and layouts.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/divider
 * @status stable
 * @since 2.0
 *
 * @cssproperty --color - The color of the divider.
 * @cssproperty --width - The width of the divider.
 * @cssproperty --spacing - The spacing of the divider.
 */
@customElement('cs-divider')
export default class CsDivider extends CornerstoneElement {
  static css = styles;

  /** Sets the divider's orientation. */
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'separator');
  }

  @watch('orientation')
  handleVerticalChange() {
    this.setAttribute('aria-orientation', this.orientation);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-divider': CsDivider;
  }
}
