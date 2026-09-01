import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import type CsButton from '../button/button.js';
import styles from './button-group.styles.js';

/**
 * @summary Button groups combine related buttons into a single visual unit. Use them for toolbars, segmented controls,
 *  or any set of actions that belong together.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/button-group
 * @status stable
 * @since 0.1
 *
 * @slot - One or more `<cs-button>` elements to display in the button group.
 *
 */
@customElement('cs-button-group')
export default class CsButtonGroup extends CornerstoneElement {
  static css = [styles];

  @query('slot') defaultSlot: HTMLSlotElement;

  @state() disableRole = false;
  @state() hasOutlined = false;

  /**
   * A label to use for the button group. This won't be displayed on the screen, but it will be announced by assistive
   * devices when interacting with the control and is strongly recommended.
   */
  @property() label = '';

  /** The button group's orientation. */
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('orientation')) {
      this.setAttribute('aria-orientation', this.orientation);
    }
  }

  private handleFocus(event: Event) {
    const button = findButton(event.target as HTMLElement);
    button?.classList.add('button-focus');
  }

  private handleBlur(event: Event) {
    const button = findButton(event.target as HTMLElement);
    button?.classList.remove('button-focus');
  }

  private handleMouseOver(event: Event) {
    const button = findButton(event.target as HTMLElement);
    button?.classList.add('button-hover');
  }

  private handleMouseOut(event: Event) {
    const button = findButton(event.target as HTMLElement);
    button?.classList.remove('button-hover');
  }

  render() {
    return html`
      <slot
        class="button-group"
        role="${this.disableRole ? 'presentation' : 'group'}"
        aria-label=${this.label}
        aria-orientation=${this.orientation}
        @focusout=${this.handleBlur}
        @focusin=${this.handleFocus}
        @mouseover=${this.handleMouseOver}
        @mouseout=${this.handleMouseOut}
      ></slot>
    `;
  }
}

function findButton(el: HTMLElement) {
  const selector = 'cs-button, cs-radio-button';

  // The button could be the target element or a child of it (e.g. a dropdown or tooltip anchor)
  return (el.closest(selector) ?? el.querySelector(selector)) as CsButton;
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-button-group': CsButtonGroup;
  }
}
