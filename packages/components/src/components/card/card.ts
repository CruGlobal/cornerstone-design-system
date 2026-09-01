import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { HasSlotController } from '../../internal/slot.js';
import sizeStyles from '../../styles/component/size.styles.js';
import styles from './card.styles.js';

/**
 * @summary Cards group related content and actions inside a bordered container. Use them to present products, articles,
 *  user profiles, or any self-contained unit of information.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/card
 * @status stable
 * @since 0.1
 *
 * @slot - The card's main content.
 * @slot header - An optional header for the card.
 * @slot footer - An optional footer for the card.
 * @slot media - An optional media section to render at the start of the card.
 * @slot actions - An optional actions section to render at the end for the horizontal card.
 * @slot header-actions - An optional actions section to render in the header of the vertical card.
 * @slot footer-actions - An optional actions section to render in the footer of the vertical card.
 *
 * @csspart media - The container that wraps the card's media.
 * @csspart header - The container that wraps the card's header.
 * @csspart body - The container that wraps the card's main content.
 * @csspart footer - The container that wraps the card's footer.
 * @csspart actions - The container that wraps the card's actions.
 *
 * @cssproperty [--spacing=var(--cs-space-l)] - The amount of space around and between sections of the card. Expects a single value.
 *
 * @ssr - If you use the header, media, or footer slots, set the matching `has-header`, `has-media`, or `has-footer` attribute — otherwise only the card's body will render during SSR. This works around the lack of a `:has-slotted` CSS pseudo-class, which would normally let us style borders based on slotted content.
 */
@customElement('cs-card')
export default class CsCard extends CornerstoneElement {
  static css = [sizeStyles, styles];

  private readonly hasSlotController = new HasSlotController(
    this,
    'footer',
    'header',
    'media',
    'header-actions',
    'footer-actions',
  );

  /** The card's visual appearance. */
  @property({ reflect: true })
  appearance: 'accent' | 'filled' | 'outlined' | 'filled-outlined' | 'plain' = 'outlined';

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `header` element so the server-rendered markup
   * includes the header before the component hydrates on the client.
   */
  @property({ attribute: 'has-header', type: Boolean, reflect: true }) hasHeader = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `media` element so the server-rendered markup
   * includes the media before the component hydrates on the client.
   */
  @property({ attribute: 'has-media', type: Boolean, reflect: true }) hasMedia = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `footer` element so the server-rendered markup
   * includes the footer before the component hydrates on the client.
   */
  @property({ attribute: 'has-footer', type: Boolean, reflect: true }) hasFooter = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `header-actions` element so the server-rendered markup
   * includes the media before the component hydrates on the client.
   */
  @property({ attribute: 'ssr-header-actions', type: Boolean, reflect: true }) ssrHeaderActions = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `footer-actions` element so the server-rendered markup
   * includes the media before the component hydrates on the client.
   */
  @property({ attribute: 'ssr-footer-actions', type: Boolean, reflect: true }) ssrFooterActions = false;

  /** Renders the card's orientation **/
  @property({ reflect: true })
  orientation: 'horizontal' | 'vertical' = 'vertical';

  willUpdate(changedProperties: PropertyValues<this>) {
    // Enable the respective slots when detected
    this.hasHeader = this.hasSlotController.test('header', 'hasHeader');
    this.hasMedia = this.hasSlotController.test('media', 'hasMedia');
    this.hasFooter = this.hasSlotController.test('footer', 'hasFooter');
    super.willUpdate(changedProperties);
  }

  render() {
    // Horizontal Orientation
    if (this.orientation === 'horizontal') {
      return html`
        <slot name="media" part="media" class="media"></slot>
        <div part="body" class="body"><slot></slot></div>
        <slot name="actions" part="actions" class="actions"></slot>
      `;
    }

    const hasHeaderActions = this.hasSlotController.test('header-actions', 'ssrHeaderActions');
    const hasFooterActions = this.hasSlotController.test('footer-actions', 'ssrFooterActions');

    // Vertical Orientation
    return html`
      <slot name="media" part="media" class="media"></slot>

      <header
        part="header"
        class=${classMap({
          header: true,
          'has-actions': hasHeaderActions,
        })}
      >
        <slot name="header"></slot>
        <slot name="header-actions"></slot>
      </header>

      <div part="body" class="body"><slot></slot></div>

      <footer
        part="footer"
        class=${classMap({
          footer: true,
          'has-actions': hasFooterActions,
        })}
      >
        <slot name="footer"></slot>
        <slot name="footer-actions"></slot>
      </footer>
    `;
  }
}

// The change-in-update warning is required for this component because HasSlotController triggers requestUpdate() on
// initial slotchange events to detect slot content. See https://lit.dev/docs/tools/development/#development-build-runtime-warnings
CsCard.disableWarning?.('change-in-update');

declare global {
  interface HTMLElementTagNameMap {
    'cs-card': CsCard;
  }
}
