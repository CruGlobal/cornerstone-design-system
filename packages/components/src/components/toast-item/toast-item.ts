import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CsAfterHideEvent } from '../../events/after-hide.js';
import { CsAfterShowEvent } from '../../events/after-show.js';
import { CsHideEvent } from '../../events/hide.js';
import { CsShowEvent } from '../../events/show.js';
import { animateWithClass } from '../../internal/animate.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { HasSlotController } from '../../internal/slot.js';
import sizeStyles from '../../styles/component/size.styles.js';
import variantStyles from '../../styles/component/variants.styles.js';
import { LocalizeController } from '../../utilities/localize.js';
import '../icon/icon.js';
import '../progress-ring/progress-ring.js';
import styles from './toast-item.styles.js';

/**
 * @summary Toast items are individual notifications displayed within a toast container.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/toast
 * @status stable
 * @since 3.3
 *
 * @dependency cs-icon
 * @dependency cs-progress-ring
 *
 * @slot - The toast item's message content.
 * @slot icon - An optional icon to show at the start of the toast item.
 *
 * @event cs-show - Emitted when the toast item begins to show.
 * @event cs-after-show - Emitted after the toast item has finished showing.
 * @event cs-hide - Emitted when the toast item begins to hide.
 * @event cs-after-hide - Emitted after the toast item has finished hiding.
 *
 * @csspart toast-item - The toast item's main container.
 * @csspart accent - The colored accent line on the start side.
 * @csspart icon - The icon container.
 * @csspart content - The message content container.
 * @csspart close-button - The close button element.
 * @csspart progress-ring - The progress ring component.
 * @csspart progress-ring__progress-ring - The progress ring's exported `progress-ring` part.
 * @csspart progress-ring__label - The progress ring's exported label part.
 * @csspart progress-ring__track - The progress ring's exported track part.
 * @csspart progress-ring__indicator - The progress ring's exported indicator part.
 * @csspart close-icon - The close icon element.
 * @csspart close-icon__svg - The close icon's exported svg part.
 *
 * @cssproperty --accent-width - The width of the accent line. Defaults to 4px.
 * @cssproperty --padding - The internal spacing of the toast item. Scales with the `size` attribute.
 * @cssproperty [--show-duration=var(--cs-transition-normal)] - The animation duration when showing.
 * @cssproperty [--hide-duration=var(--cs-transition-normal)] - The animation duration when hiding.
 */
@customElement('cs-toast-item')
export default class CsToastItem extends CornerstoneElement {
  static css = [styles, variantStyles, sizeStyles];

  private readonly hasSlotController = new HasSlotController(this, 'icon');
  private readonly localize = new LocalizeController(this);
  private animationFrame: number | null = null;
  private startTime: number | null = null;
  private isHovering = false;
  private isFocused = false;

  @query('.toast-item') toastItemElement: HTMLElement;

  /** @internal The time remaining as a percentage (100 to 0). */
  @state() timeLeft = 100;

  /** The toast item's variant. */
  @property({ reflect: true }) variant:
    'brand' | 'highlight' | 'information' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';

  /** The toast item's size. */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';

  /**
   * The length of time in milliseconds before the toast item is automatically dismissed. Set to 0 to keep the toast
   * item open until the user dismisses it.
   */
  @property({ type: Number }) duration = 5000;

  /**
   * Only required for SSR. Set to `true` if you're slotting in an `icon` element so the server-rendered markup
   * includes the icon before the component hydrates on the client.
   */
  @property({ attribute: 'ssr-icon', type: Boolean }) ssrIcon = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
  }

  /** @internal Starts the toast item's timer and shows it. Called by the parent toast component. */
  async startTimer() {
    // Dispatch show event
    const showEvent = new CsShowEvent();
    this.dispatchEvent(showEvent);

    if (showEvent.defaultPrevented) {
      return;
    }

    // Animate in
    await this.updateComplete;
    await animateWithClass(this.toastItemElement, 'show');
    this.dispatchEvent(new CsAfterShowEvent());

    // Start the countdown if there's a duration
    if (this.duration > 0 && Number.isFinite(this.duration)) {
      this.startTime = performance.now();
      this.timeLeft = 100;
      this.tick();
    }
  }

  /** @internal Stops the toast item's timer. */
  stopTimer() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private tick = () => {
    if (!this.startTime) {
      return;
    }

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    this.timeLeft = 100 * (1 - progress);

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(this.tick);
    } else {
      this.hide();
    }
  };

  /** Hides the toast item with animation and removes it from the DOM. */
  async hide() {
    this.stopTimer();

    // Dispatch hide event
    const hideEvent = new CsHideEvent();
    this.dispatchEvent(hideEvent);

    if (hideEvent.defaultPrevented) {
      return;
    }

    // Animate out
    await animateWithClass(this.toastItemElement, 'hide');
    this.dispatchEvent(new CsAfterHideEvent());

    // Remove from DOM
    this.remove();
  }

  private handleCloseClick() {
    this.hide();
  }

  private pauseTimer() {
    this.stopTimer();
    this.timeLeft = 100;
  }

  private resumeTimer() {
    // Only resume if neither hover nor focus is keeping it paused
    if (!this.isHovering && !this.isFocused && this.duration > 0) {
      this.startTime = performance.now();
      this.tick();
    }
  }

  private handlePointerEnter = (event: PointerEvent) => {
    // Don't reset for touch events as they don't have hover behavior
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      this.isHovering = true;
      this.pauseTimer();
    }
  };

  private handlePointerLeave = () => {
    if (this.isHovering) {
      this.isHovering = false;
      this.resumeTimer();
    }
  };

  private handleFocusIn = () => {
    this.isFocused = true;
    this.pauseTimer();
  };

  private handleFocusOut = () => {
    this.isFocused = false;
    this.resumeTimer();
  };

  render() {
    const hasIcon = this.hasSlotController.test('icon', 'ssrIcon');
    const hasDuration = this.duration > 0;

    return html`
      <div
        part="toast-item"
        class=${classMap({
          'toast-item': true,
          'toast-item--has-icon': hasIcon,
          'toast-item--has-duration': hasDuration,
        })}
      >
        <div part="accent" class="accent"></div>

        <div part="icon" class="icon">
          <slot name="icon"></slot>
        </div>

        <div part="content" class="content">
          <slot></slot>
        </div>

        <button
          part="close-button"
          class="close-button"
          type="button"
          aria-label=${this.localize.term('close')}
          @click=${this.handleCloseClick}
          @focusin=${this.handleFocusIn}
          @focusout=${this.handleFocusOut}
        >
          <cs-progress-ring
            part="progress-ring"
            exportparts="
              progress-ring:progress-ring__progress-ring,
              label:progress-ring__label,
              track:progress-ring__track,
              indicator:progress-ring__indicator
            "
            value=${this.timeLeft}
            aria-hidden="true"
          >
            <cs-icon part="close-icon" exportparts="svg:close-icon__svg" name="close" library="system"></cs-icon>
          </cs-progress-ring>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-toast-item': CsToastItem;
  }
}
