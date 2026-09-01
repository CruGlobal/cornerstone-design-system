import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { CsRemoveEvent } from '../../events/remove.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import sizeStyles from '../../styles/component/size.styles.js';
import variantStyles from '../../styles/component/variants.styles.js';
import { LocalizeController } from '../../utilities/localize.js';
import '../button/button.js';
import styles from './tag.styles.js';

/**
 * @summary Tags label, categorize, or represent selections with a compact visual marker. Use them for status
 *  indicators, filters, or removable chips.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tag
 * @status stable
 * @since 0.1
 *
 * @dependency cs-button
 *
 * @slot - The tag's content.
 *
 * @event cs-remove - Emitted when the remove button is activated.
 *
 * @csspart content - The tag's content.
 * @csspart remove-button - The tag's remove button, a `<cs-button>`.
 * @csspart remove-button__button - The remove button's exported `button` part.
 */
@customElement('cs-tag')
export default class CsTag extends CornerstoneElement {
  static css = [styles, variantStyles, sizeStyles];

  private readonly localize = new LocalizeController(this);

  /** The tag's theme variant. Defaults to `neutral` if not within another element with a variant. */
  @property({ reflect: true }) variant:
    'brand' | 'neutral' | 'highlight' | 'information' | 'success' | 'warning' | 'danger' = 'neutral';

  /** The tag's visual appearance. */
  @property({ reflect: true }) appearance: 'accent' | 'filled' | 'outlined' | 'filled-outlined' = 'filled-outlined';

  /** The tag's size. */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';

  /** Draws a pill-style tag with rounded edges. */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** Makes the tag removable and shows a remove button. */
  @property({ attribute: 'with-remove', type: Boolean }) withRemove = false;

  private handleRemoveClick() {
    this.dispatchEvent(new CsRemoveEvent());
  }

  render() {
    return html`
      <slot part="content" class="content"></slot>

      ${
        this.withRemove
          ? html`
              <cs-button
                part="remove-button"
                exportparts="button:remove-button__button"
                class="remove"
                appearance="plain"
                size=${this.size}
                @click=${this.handleRemoveClick}
                tabindex="-1"
              >
                <cs-icon name="close" library="system" label=${this.localize.term('remove')}></cs-icon>
              </cs-button>
            `
          : ''
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-tag': CsTag;
  }
}
