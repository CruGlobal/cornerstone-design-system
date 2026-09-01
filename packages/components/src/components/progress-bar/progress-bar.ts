import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { clamp } from '../../internal/math.js';
import { LocalizeController } from '../../utilities/localize.js';
import styles from './progress-bar.styles.js';

/**
 * @summary Progress bars show how far along an ongoing operation is as a horizontal fill. Use them for file uploads,
 *  multi-step flows, or any task with measurable progress.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/progress-bar
 * @status stable
 * @since 0.1
 *
 * @slot - A label to show inside the progress indicator.
 *
 * @csspart progress-bar - The component's outer wrapper.
 * @csspart indicator - The progress bar's indicator.
 * @csspart label - The progress bar's label.
 *
 * @cssproperty [--track-height=1rem] - The height of the track.
 * @cssproperty [--track-color=var(--cs-color-neutral-fill-normal)] - The color of the track.
 * @cssproperty [--indicator-color=var(--cs-color-brand-fill-loud)] - The color of the indicator.
 */
@customElement('cs-progress-bar')
export default class CsProgressBar extends CornerstoneElement {
  static css = styles;
  private readonly localize = new LocalizeController(this);

  /** The current progress as a percentage, 0 to 100. */
  @property({ type: Number, reflect: true }) value = 0;

  /** When true, percentage is ignored, the label is hidden, and the progress bar is drawn in an indeterminate state. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  /** A custom label for assistive devices. */
  @property() label = '';

  willUpdate(changedProperties: PropertyValues<this>) {
    // This is intended for the server.
    if (this.style == null) {
      this.setStyleProperty('--percentage', `${clamp(this.value, 0, 100)}%`);
    }

    super.willUpdate(changedProperties);
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('value')) {
      // Wait a cycle before setting it so Safari animates it.
      // https://github.com/shoelace-style/webawesome/issues/356
      requestAnimationFrame(() => {
        this.style.setProperty('--percentage', `${clamp(this.value, 0, 100)}%`);
      });
    }

    super.updated(changedProperties);
  }

  render() {
    return html`
      <div
        part="progress-bar"
        class="progress-bar"
        role="progressbar"
        title=${ifDefined(this.title)}
        aria-label=${this.label.length > 0 ? this.label : this.localize.term('progress')}
        aria-describedby="label"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this.indeterminate ? '0' : this.value}
      >
        <div part="indicator" class="indicator">
          ${!this.indeterminate ? html` <slot id="label" part="label" class="label"></slot> ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-progress-bar': CsProgressBar;
  }
}
