import { property } from 'lit/decorators.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { LocalizeController } from '../../utilities/localize.js';

/**
 * @summary Formats a number of bytes as a human-readable string with the appropriate unit, such as kB, MB, or GB.
 *  Supports both byte and bit units with configurable locale.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/format-bytes
 * @status stable
 * @since 0.1
 */
@customElement('cs-format-bytes')
export default class CsFormatBytes extends CornerstoneElement {
  static get styles() {
    return [];
  }

  private readonly localize = new LocalizeController(this);

  /** The number to format in bytes. */
  @property({ type: Number }) value = 0;

  /** The type of unit to display. */
  @property() unit: 'byte' | 'bit' = 'byte';

  /** Determines how to display the result, e.g. "100 bytes", "100 b", or "100b". */
  @property() display: 'long' | 'short' | 'narrow' = 'short';

  render() {
    if (isNaN(this.value)) {
      return '';
    }

    const bitPrefixes = ['', 'kilo', 'mega', 'giga', 'tera']; // petabit isn't a supported unit
    const bytePrefixes = ['', 'kilo', 'mega', 'giga', 'tera', 'peta'];
    const prefix = this.unit === 'bit' ? bitPrefixes : bytePrefixes;
    const index = Math.max(0, Math.min(Math.floor(Math.log10(this.value) / 3), prefix.length - 1));
    const unit = prefix[index] + this.unit;
    const valueToFormat = parseFloat((this.value / Math.pow(1000, index)).toPrecision(3));

    return this.localize.number(valueToFormat, {
      style: 'unit',
      unit,
      unitDisplay: this.display,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-format-bytes': CsFormatBytes;
  }
}
