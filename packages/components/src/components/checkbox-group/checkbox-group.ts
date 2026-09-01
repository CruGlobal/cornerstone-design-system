import type { PropertyValues } from 'lit';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { HasSlotController } from '../../internal/slot.js';
import formControlStyles from '../../styles/component/form-control.styles.js';
import sizeStyles from '../../styles/component/size.styles.js';
import '../checkbox/checkbox.js';
import type CsCheckbox from '../checkbox/checkbox.js';
import styles from './checkbox-group.styles.js';

/**
 * @summary Checkbox groups wrap a set of related checkboxes or switches so they share a label, hint, and grouping
 *  semantics.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/checkbox-group
 * @status stable
 * @since 0.1
 *
 * @dependency cs-checkbox
 *
 * @slot - The default slot where `<cs-checkbox>` or `<cs-switch>` elements are placed.
 * @slot label - The checkbox group's label. Required for proper accessibility. Alternatively, you can use the `label`
 *  attribute.
 * @slot hint - Text that describes how to use the checkbox group. Alternatively, you can use the `hint` attribute.
 *
 * @csspart form-control - The form control that wraps the label, group, and hint.
 * @csspart form-control-label - The label.
 * @csspart form-control-input - The element that wraps the grouped checkboxes, exposed as a `role="group"`.
 * @csspart hint - The hint's wrapper.
 *
 * @cssproperty [--gap=0.5em] - The gap between grouped checkboxes.
 */
@customElement('cs-checkbox-group')
export default class CsCheckboxGroup extends CornerstoneElement {
  static css = [sizeStyles, formControlStyles, styles];

  private readonly hasSlotController = new HasSlotController(this, 'hint', 'label');

  /**
   * The checkbox group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
   * instead.
   */
  @property() label = '';

  /** The checkbox group's hint. If you need to display HTML, use the `hint` slot instead. */
  @property({ attribute: 'hint' }) hint = '';

  /** The orientation in which to show grouped checkboxes. */
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'vertical';

  /**
   * The group's size. When present, this size will be applied to all `<cs-checkbox>` and `<cs-switch>` items inside.
   */
  @property({ reflect: true }) size: 'xs' | 's' | 'm' | 'l' | 'xl';

  /**
   * Indicates that at least one option should be selected. This only adds a visual indicator to the label. To enforce
   * the requirement, use the `required` attribute on the individual checkboxes and/or their `setCustomValidity()`
   * method.
   */
  @property({ type: Boolean, reflect: true }) required = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `label` element so the server-rendered markup includes
   * the label before the component hydrates on the client.
   */
  @property({ type: Boolean, attribute: 'ssr-label' }) ssrLabel = false;

  /**
   * Only required for SSR. Set to `true` if you're slotting in a `hint` element so the server-rendered markup includes
   * the hint before the component hydrates on the client.
   */
  @property({ type: Boolean, attribute: 'ssr-hint' }) ssrHint = false;

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('size')) {
      this.syncCheckboxElements();
    }
  }

  /** Returns all grouped checkbox and switch elements. */
  private getAllCheckboxes() {
    return [...this.querySelectorAll<CsCheckbox>(':is(cs-checkbox, cs-switch)')];
  }

  /**
   * Applies the group's size to each grouped checkbox/switch
   */
  private syncCheckboxElements = () => {
    if (!this.size) {
      return;
    }

    for (const checkbox of this.getAllCheckboxes()) {
      checkbox.setAttribute('size', this.size);
    }
  };

  render() {
    const hasLabelSlot = this.hasSlotController.test('label', 'ssrLabel');
    const hasHintSlot = this.hasSlotController.test('hint', 'ssrHint');
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;

    return html`
      <fieldset
        part="form-control"
        class=${classMap({
          'form-control': true,
          'checkbox-group-required': this.required,
          'form-control-has-label': hasLabel,
        })}
      >
        <label
          part="form-control-label"
          id="label"
          class=${classMap({
            label: true,
            'has-label': hasLabel,
          })}
          aria-hidden=${hasLabel ? 'false' : 'true'}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" role="group" aria-labelledby="label" aria-describedby="hint">
          <slot @slotchange=${this.syncCheckboxElements}></slot>
        </div>

        <slot
          id="hint"
          name="hint"
          part="hint"
          class=${classMap({
            'has-slotted': hasHint,
          })}
          aria-hidden=${hasHint ? 'false' : 'true'}
          >${this.hint}</slot
        >
      </fieldset>
    `;
  }
}

// HasSlotController calls requestUpdate() in response to slotchange events after first render. See
// https://lit.dev/docs/tools/development/#development-build-runtime-warnings
CsCheckboxGroup.disableWarning?.('change-in-update');

declare global {
  interface HTMLElementTagNameMap {
    'cs-checkbox-group': CsCheckboxGroup;
  }
}
