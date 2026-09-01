import { html, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import { CsResizeEvent } from '../../events/resize.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { watch } from '../../internal/watch.js';
import styles from './resize-observer.styles.js';

/**
 * @summary Resize observers watch their slotted elements for size changes and emit an event when they occur. Provides a
 *  thin, declarative interface to the browser's ResizeObserver API.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/resize-observer
 * @status stable
 * @since 0.1
 *
 * @slot - One or more elements to watch for resizing.
 *
 * @event {{ entries: ResizeObserverEntry[] }} cs-resize - Emitted when the element is resized.
 */
@customElement('cs-resize-observer')
export default class CsResizeObserver extends CornerstoneElement {
  static css = styles;

  private resizeObserver: ResizeObserver;
  private observedElements: HTMLElement[] = [];

  /** Disables the observer. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  connectedCallback() {
    super.connectedCallback();

    // SSR guard: ResizeObserver is not available during server-side rendering
    if (!isServer) {
      this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        this.dispatchEvent(new CsResizeEvent({ entries }));
      });

      if (!this.disabled) {
        this.updateComplete.then(() => {
          this.startObserver();
        });
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopObserver();
  }

  private handleSlotChange() {
    if (!this.disabled) {
      this.startObserver();
    }
  }

  private startObserver() {
    const slot = this.shadowRoot!.querySelector('slot');

    if (slot !== null) {
      const elements = slot.assignedElements({ flatten: true }) as HTMLElement[];

      // Unwatch previous elements
      this.observedElements.forEach((el) => this.resizeObserver.unobserve(el));
      this.observedElements = [];

      // Watch new elements
      elements.forEach((el) => {
        this.resizeObserver.observe(el);
        this.observedElements.push(el);
      });
    }
  }

  private stopObserver() {
    this.resizeObserver.disconnect();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange() {
    if (this.disabled) {
      this.stopObserver();
    } else {
      this.startObserver();
    }
  }

  render() {
    return html` <slot @slotchange=${this.handleSlotChange}></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-resize-observer': CsResizeObserver;
  }
}
