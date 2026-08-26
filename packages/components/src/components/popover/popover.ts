import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CsAfterHideEvent } from '../../events/after-hide.js';
import { CsAfterShowEvent } from '../../events/after-show.js';
import { CsHideEvent } from '../../events/hide.js';
import { CsShowEvent } from '../../events/show.js';
import { animateWithClass } from '../../internal/animate.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { isTopDismissible, registerDismissible, unregisterDismissible } from '../../internal/dismissible-stack.js';
import { waitForEvent } from '../../internal/event.js';
import { uniqueId } from '../../internal/math.js';
import { watch } from '../../internal/watch.js';
import CsPopup from '../popup/popup.js';
import styles from './popover.styles.js';

const openPopovers = new Set<CsPopover>();

/**
 * @summary Popovers display contextual content and interactive elements in a floating panel anchored to a trigger. Use
 *  them for rich tooltips, menus, or any content that appears on demand without navigating away.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/popover
 * @status stable
 * @since 3.0
 *
 * @dependency cs-popup
 *
 * @slot - The popover's content. Interactive elements such as buttons and links are supported.
 *
 * @event cs-show - Emitted when the popover begins to show. Canceling this event will stop the popover from showing.
 * @event cs-after-show - Emitted after the popover has shown and all animations are complete.
 * @event cs-hide - Emitted when the popover begins to hide. Canceling this event will stop the popover from hiding.
 * @event cs-after-hide - Emitted after the popover has hidden and all animations are complete.
 *
 * @csspart dialog - The native dialog element that contains the popover content.
 * @csspart body - The popover's body where its content is rendered.
 * @csspart popup - The internal `<cs-popup>` element that positions the popover.
 * @csspart popup__popup - The popup's exported `popup` part. Use this to target the popover's popup container.
 * @csspart popup__arrow - The popup's exported `arrow` part. Use this to target the popover's arrow.
 *
 * @cssproperty [--arrow-size=0.375rem] - The size of the tiny arrow that points to the popover (set to zero to remove).
 * @cssproperty [--max-width=25rem] - The maximum width of the popover's body content.
 * @cssproperty [--show-duration=var(--cs-transition-fast)] - The speed of the show animation.
 * @cssproperty [--hide-duration=var(--cs-transition-fast)] - The speed of the hide animation.
 *
 * @cssstate open - Applied when the popover is open.
 */
@customElement('cs-popover')
export default class CsPopover extends CornerstoneElement {
  static css = styles;
  static dependencies = { 'cs-popup': CsPopup };

  @query('dialog') dialog: HTMLDialogElement;
  @query('.body') body: HTMLElement;
  @query('cs-popup') popup: CsPopup;

  @state() anchor: null | Element = null;

  /**
   * The preferred placement of the popover. Note that the actual placement may vary as needed to keep the popover
   * inside of the viewport.
   */
  @property() placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'top';

  /** Shows or hides the popover. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The distance in pixels from which to offset the popover away from its target. */
  @property({ type: Number }) distance = 8;

  /** The distance in pixels from which to offset the popover along its target. */
  @property({ type: Number }) skidding = 0;

  /** The ID of the popover's anchor element. This must be an interactive/focusable element such as a button. */
  @property() for: string | null = null;

  /** Removes the arrow from the popover. */
  @property({ attribute: 'without-arrow', type: Boolean, reflect: true }) withoutArrow = false;

  private eventController = new AbortController();

  connectedCallback() {
    super.connectedCallback();

    // If the user doesn't give us an id, generate one.
    if (!this.id) {
      this.id = uniqueId('cs-popover-');
    }

    // Recreate event controller if it was aborted
    if (this.eventController.signal.aborted) {
      this.eventController = new AbortController();
    }

    // Re-establish anchor connection after being moved in the DOM
    if (this.for && this.anchor) {
      this.anchor = null; // force reattach
      this.handleForChange();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup events in case the popover is removed while open
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    unregisterDismissible(this);
    this.eventController.abort();
  }

  firstUpdated(changedProperties: PropertyValues<typeof this>) {
    super.firstUpdated(changedProperties);

    // If the popover is visible on init, update its position
    if (this.open) {
      this.dialog.show();
      this.popup.active = true;
      this.popup.reposition();
    }
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('open')) {
      this.customStates.set('open', this.open);
    }
  }

  private handleAnchorClick = () => {
    // Clicks on the anchor should toggle the popover
    this.open = !this.open;
  };

  private handleBodyClick = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-popover="close"]');

    // Watch for [data-popover="close"] clicks
    if (button) {
      event.stopPropagation();
      this.open = false;
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    // Hide the popover when escape is pressed
    if (event.key === 'Escape' && this.open && isTopDismissible(this)) {
      event.preventDefault();
      event.stopPropagation();
      this.open = false;
      const anchor = this.anchor as Partial<HTMLElement> | string;
      if (anchor && typeof (anchor as Partial<HTMLElement>).focus === 'function') {
        (anchor as HTMLElement).focus({ preventScroll: true });
      }
    }
  };

  private handleDocumentClick = (event: PointerEvent) => {
    // Ignore clicks on the anchor so it will be closed by the anchor's click handler
    if (this.anchor && event.composedPath().includes(this.anchor)) {
      return;
    }

    // Detect when clicks occur outside the popover (using composedPath to traverse shadow DOM boundaries)
    if (!event.composedPath().includes(this)) {
      this.open = false;
    }
  };

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.open) {
      // Show
      const csShowEvent = new CsShowEvent();
      this.dispatchEvent(csShowEvent);
      if (csShowEvent.defaultPrevented) {
        this.open = false;
        return;
      }

      // Close other popovers that are open
      openPopovers.forEach((popover) => (popover.open = false));

      document.addEventListener('keydown', this.handleDocumentKeyDown, { signal: this.eventController.signal });
      document.addEventListener('click', this.handleDocumentClick, { signal: this.eventController.signal });

      // Show the dialog non-modally. Set the `open` attribute instead of calling show(): show() runs the native
      // dialog focusing steps, which scroll the page even though the popover is anchored in-viewport. The popover
      // manages focus itself below (with preventScroll), so those steps are unwanted.
      this.dialog.setAttribute('open', '');
      this.popup.active = true;
      openPopovers.add(this);
      registerDismissible(this);

      // Autofocus the first element with the autofocus attribute. preventScroll everywhere: the popup may not be
      // positioned yet, and an anchored popover is always shown in-viewport, so focus must never scroll the page.
      requestAnimationFrame(() => {
        const elementToFocus = this.querySelector<HTMLElement>('[autofocus]');
        if (elementToFocus && typeof elementToFocus.focus === 'function') {
          elementToFocus.focus({ preventScroll: true });
        } else {
          // Fall back to setting focus on the dialog
          this.dialog.focus({ preventScroll: true });
        }
      });

      await animateWithClass(this.popup.popup, 'show-with-scale');
      this.popup.reposition();

      this.dispatchEvent(new CsAfterShowEvent());
    } else {
      // Hide
      const csHideEvent = new CsHideEvent();
      this.dispatchEvent(csHideEvent);
      if (csHideEvent.defaultPrevented) {
        this.open = true;
        return;
      }

      document.removeEventListener('keydown', this.handleDocumentKeyDown);
      document.removeEventListener('click', this.handleDocumentClick);

      openPopovers.delete(this);
      unregisterDismissible(this);

      await animateWithClass(this.popup.popup, 'hide-with-scale');
      this.popup.active = false;
      this.dialog.close();

      this.dispatchEvent(new CsAfterHideEvent());
    }
  }

  @watch('for')
  handleForChange() {
    const rootNode = this.getRootNode() as Document | ShadowRoot | null;

    if (!rootNode) {
      return;
    }

    const newAnchor = this.for ? rootNode.getElementById(this.for) : null;
    const oldAnchor = this.anchor;

    if (newAnchor === oldAnchor) {
      return;
    }

    const { signal } = this.eventController;

    if (newAnchor) {
      newAnchor.addEventListener('click', this.handleAnchorClick, { signal });
    }

    if (oldAnchor) {
      oldAnchor.removeEventListener('click', this.handleAnchorClick);
    }

    this.anchor = newAnchor;

    if (this.for && !newAnchor) {
      console.warn(
        `A popover was assigned to an element with an ID of "${this.for}" but the element could not be found.`,
        this,
      );
    }
  }

  @watch(['distance', 'placement', 'skidding'])
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }

  /** Shows the popover. */
  async show() {
    if (this.open) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'cs-after-show');
  }

  /** Hides the popover. */
  async hide() {
    if (!this.open) {
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'cs-after-hide');
  }

  render() {
    return html`
      <dialog part="dialog" class="dialog">
        <cs-popup
          part="popup"
          exportparts="
            popup:popup__popup,
            arrow:popup__arrow
          "
          class=${classMap({
            popover: true,
            'popover-open': this.open,
          })}
          placement=${this.placement}
          distance=${this.distance}
          skidding=${this.skidding}
          flip
          shift
          shift-padding="8"
          ?arrow=${!this.withoutArrow}
          .anchor=${this.anchor}
        >
          <div part="body" class="body" @click=${this.handleBodyClick}>
            <slot></slot>
          </div>
        </cs-popup>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-popover': CsPopover;
  }
}
