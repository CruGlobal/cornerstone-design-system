import { html } from 'lit';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { LocalizeController } from '../../utilities/localize.js';
import styles from './spinner.styles.js';

/**
 * @summary Spinners indicate that an operation is in progress when the duration is unknown. Use them for loading states
 *  where a determinate progress bar isn't practical.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/spinner
 * @status stable
 * @since 0.1
 *
 * @csspart spinner - The component's outer wrapper.
 *
 * @cssproperty [--cs-track-width=2px] - The width of the track.
 * @cssproperty [--cs-track-color=var(--cs-color-neutral-fill-normal)] - The color of the track.
 * @cssproperty [--cs-indicator-color=var(--cs-color-brand-fill-loud)] - The color of the spinner's indicator.
 * @cssproperty [--cs-spinner-speed=2s] - The time it takes for the spinner to complete one animation cycle.
 */
@customElement('cs-spinner')
export default class CsSpinner extends CornerstoneElement {
  static css = styles;

  private readonly localize = new LocalizeController(this);

  render() {
    return html`
      <svg
        part="spinner"
        role="progressbar"
        aria-label=${this.localize.term('loading')}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="track" />
        <circle class="indicator" />
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-spinner': CsSpinner;
  }
}
