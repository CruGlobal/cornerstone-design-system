import type { PropertyValues } from 'lit';
import { html, isServer } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CornerstoneFormAssociatedElement } from '../../internal/cornerstone-form-associated-element.js';
import { customElement } from '../../internal/custom-element.js';
import formControlStyles from '../../styles/component/form-control.styles.js';
import sizeStyles from '../../styles/component/size.styles.js';
import '../icon/icon.js';
import styles from './radio.styles.js';

/**
 * @summary Radios represent a single option within a mutually exclusive set. Use them inside a radio group when users
 *  must pick exactly one choice from a small list.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/radio
 * @status stable
 * @since 2.0
 *
 * @dependency cs-icon
 *
 * @slot - The radio's label.
 *
 * @event blur - Emitted when the control loses focus.
 * @event focus - Emitted when the control gains focus.
 *
 * @csspart control - The circular container that wraps the radio's checked state.
 * @csspart checked-icon - The checked icon.
 * @csspart label - The container that wraps the radio's label.
 *
 * @cssproperty --checked-icon-color - The color of the checked icon.
 * @cssproperty --checked-icon-scale - The size of the checked icon relative to the radio.
 *
 * @cssstate checked - Applied when the control is checked.
 * @cssstate disabled - Applied when the control is disabled.
 */
@customElement('cs-radio')
export default class CsRadio extends CornerstoneFormAssociatedElement {
  static css = [formControlStyles, sizeStyles, styles];

  @state() checked = false;

  /** @internal Used by radio group to force disable radios while preserving their original disabled state. */
  @state() forceDisabled = false;

  /** The radio's value. When selected, the radio group will receive this value. */
  @property({ reflect: true }) value: string;

  /** The radio's visual appearance. */
  @property({ reflect: true }) appearance: 'default' | 'button' = 'default';

  /**
   * The radio's size. When used inside a radio group, the size will be determined by the radio group's size, which will
   * override this attribute.
   */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl';

  /** Disables the radio. */
  @property({ type: Boolean }) disabled = false;

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('click', this.handleClick);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setInitialAttributes();
  }

  private setInitialAttributes() {
    this.setAttribute('role', 'radio');
    this.tabIndex = 0;
    this.setAttribute('aria-disabled', this.disabled || this.forceDisabled ? 'true' : 'false');
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('checked')) {
      this.customStates.set('checked', this.checked);
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
      // Only set tabIndex if not disabled
      if (!this.disabled && !this.forceDisabled) {
        this.tabIndex = this.checked ? 0 : -1;
      }
    }

    if (changedProperties.has('disabled') || changedProperties.has('forceDisabled')) {
      const effectivelyDisabled = this.disabled || this.forceDisabled;
      this.customStates.set('disabled', effectivelyDisabled);
      this.setAttribute('aria-disabled', effectivelyDisabled ? 'true' : 'false');

      // Set tabIndex based on disabled state
      if (effectivelyDisabled) {
        this.tabIndex = -1;
      } else {
        // Restore proper tabIndex - this will be managed by the radio group
        this.tabIndex = this.checked ? 0 : -1;
      }
    }
  }

  /**
   * @override
   */
  setValue(): void {
    // We override `setValue` because we don't want to set form values from here. We want to do that in "RadioGroup" itself.
  }

  private handleClick = () => {
    if (!this.disabled && !this.forceDisabled) {
      this.checked = true;
    }
  };

  render() {
    return html`
      <span part="control" class="control">
        ${
          this.checked
            ? html`
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" part="checked-icon" class="checked-icon">
                  <circle cx="8" cy="8" r="8" />
                </svg>
              `
            : ''
        }
      </span>

      <slot part="label" class="label"></slot>
    `;
  }
}

// The change-in-update warning is required for this component because the form-associated base class calls
// updateValidity() in firstUpdated(), which triggers requestUpdate('validity') to sync the validation state after the
// first render when the validation target is available. Additionally, HasSlotController triggers requestUpdate() on
// initial slotchange events. See https://lit.dev/docs/tools/development/#development-build-runtime-warnings
CsRadio.disableWarning?.('change-in-update');

declare global {
  interface HTMLElementTagNameMap {
    'cs-radio': CsRadio;
  }
}
