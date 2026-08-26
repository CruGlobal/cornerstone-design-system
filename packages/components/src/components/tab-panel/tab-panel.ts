import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CornerstoneElement from '../../internal/cornerstone-element.js';
import { customElement } from '../../internal/custom-element.js';
import { watch } from '../../internal/watch.js';
import styles from './tab-panel.styles.js';

let id = 0;

/**
 * @summary Tab panels hold the content shown for a single tab inside a tab group.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/tab-panel
 * @status stable
 * @since 2.0
 *
 * @slot - The tab panel's content.
 *
 *
 * @cssproperty --padding - The tab panel's padding.
 */
@customElement('cs-tab-panel')
export default class CsTabPanel extends CornerstoneElement {
  static css = styles;

  private readonly attrId = ++id;
  private readonly componentId = `cs-tab-panel-${this.attrId}`;

  /** The tab panel's name. */
  @property({ reflect: true }) name = '';

  /** When true, the tab panel will be shown. */
  @property({ type: Boolean, reflect: true }) active = false;

  @property({ reflect: true }) role = 'tabpanel';

  connectedCallback() {
    super.connectedCallback();
    this.id = (this.id || '').length > 0 ? this.id : this.componentId;
  }

  @watch('active')
  handleActiveChange() {
    this.setAttribute('aria-hidden', this.active ? 'false' : 'true');
  }

  render() {
    return html`
      <slot
        class=${classMap({
          'tab-panel': true,
          'tab-panel-active': this.active,
        })}
      ></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-tab-panel': CsTabPanel;
  }
}
