// Throwaway prototype for issue #230. Lives only on research/host-aria. Never ship.
//
// cs-proto-keep-button, but after each client update the forwarded aria-* attributes are REMOVED from the
// host (the Ionic-style "inherit and strip" shape). The forwarded values live on in the Lit properties.
// Stripping runs on the client only: on the server the host attribute is the only copy that survives into
// hydration.
import { isServer } from 'lit';
import { customElement } from '../../internal/custom-element.js';
import CsProtoKeepButton from '../proto-keep-button/proto-keep-button.js';

const FORWARDED = [
  'aria-label',
  'aria-current',
  'aria-expanded',
  'aria-haspopup',
  'aria-pressed',
  'aria-labelledby',
  'aria-describedby',
  'aria-controls',
];

/**
 * @summary Research prototype: cs-button that forwards host ARIA and strips it from the host.
 * @status experimental
 * @since 0.0
 */
@customElement('cs-proto-strip-button')
export default class CsProtoStripButton extends CsProtoKeepButton {
  #stripping = false;

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Our own removeAttribute() must not clear the forwarded value.
    if (this.#stripping) return;
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  protected updated(changed: Parameters<CsProtoKeepButton['updated']>[0]) {
    super.updated(changed);
    if (isServer) return;
    this.#stripping = true;
    for (const name of FORWARDED) {
      if (this.hasAttribute(name)) this.removeAttribute(name);
    }
    this.#stripping = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-proto-strip-button': CsProtoStripButton;
  }
}
