// Throwaway prototype for issue #230. Lives only on research/host-aria. Never ship.
//
// cs-button plus host-ARIA forwarding, with the host's attributes LEFT IN PLACE:
//   - string-valued aria-* on the host are Lit properties, so they reach render() on the server too, and
//     are rendered onto the inner [part~="button"] element
//   - IDREF aria-* on the host (aria-labelledby, aria-describedby, aria-controls) are resolved in the host's
//     own tree and set on the inner element through ARIA element reflection, client side only
//   - `label` and `current` properties (the "component properties" shape) render onto the same element
import { isServer } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal } from 'lit/static-html.js';
import { customElement } from '../../internal/custom-element.js';
import CsButton from '../button/button.js';

type Reflecting = HTMLElement & {
  ariaLabelledByElements: Element[] | null;
  ariaDescribedByElements: Element[] | null;
  ariaControlsElements: Element[] | null;
};

/**
 * @summary Research prototype: cs-button that forwards host ARIA and keeps it on the host.
 * @status experimental
 * @since 0.0
 */
@customElement('cs-proto-keep-button')
export default class CsProtoKeepButton extends CsButton {
  /** Shape B: an accessible name rendered onto the inner element. */
  @property() label?: string;
  /** Shape B: the current item in a set, rendered as aria-current on the inner element. */
  @property() current?: string;

  // Shape A: forwarded string-valued host ARIA.
  @property({ attribute: 'aria-label' }) fwdLabel: string | null = null;
  @property({ attribute: 'aria-current' }) fwdCurrent: string | null = null;
  @property({ attribute: 'aria-expanded' }) fwdExpanded: string | null = null;
  @property({ attribute: 'aria-haspopup' }) fwdHaspopup: string | null = null;
  @property({ attribute: 'aria-pressed' }) fwdPressed: string | null = null;

  // Shape A: forwarded IDREF host ARIA, resolved outward with element reflection.
  @property({ attribute: 'aria-labelledby' }) fwdLabelledBy: string | null = null;
  @property({ attribute: 'aria-describedby' }) fwdDescribedBy: string | null = null;
  @property({ attribute: 'aria-controls' }) fwdControls: string | null = null;

  private resolveIds(ids: string | null): Element[] | null {
    if (!ids) return null;
    const root = this.getRootNode() as Document | ShadowRoot;
    const found = ids
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => root.getElementById?.(id))
      .filter((el): el is HTMLElement => Boolean(el));
    return found.length ? found : null;
  }

  protected updated(changed: Parameters<CsButton['updated']>[0]) {
    super.updated(changed);
    if (isServer) return;
    const target = this.button as unknown as Reflecting;
    if (!target || !('ariaLabelledByElements' in target)) return;
    target.ariaLabelledByElements = this.resolveIds(this.fwdLabelledBy);
    target.ariaDescribedByElements = this.resolveIds(this.fwdDescribedBy);
    target.ariaControlsElements = this.resolveIds(this.fwdControls);
  }

  render() {
    // Same template as cs-button (button.ts:285-325) plus the forwarded attributes.
    // @ts-expect-error private in the parent; the prototype reuses it
    const isLink = this.isLink();
    const tag = isLink ? literal`a` : literal`button`;
    return html`
      <${tag}
        part="button"
        class=${classMap({
          button: true,
          caret: this.withCaret,
          disabled: this.disabled,
          loading: this.loading,
          'is-icon-button': this.isIconButton,
        })}
        ?disabled=${ifDefined(isLink ? undefined : this.disabled)}
        type=${ifDefined(isLink ? undefined : this.type)}
        title=${this.title}
        name=${ifDefined(isLink ? undefined : this.name)}
        value=${ifDefined(isLink ? undefined : this.value)}
        href=${ifDefined(isLink ? this.href : undefined)}
        target=${ifDefined(isLink ? this.target : undefined)}
        download=${ifDefined(isLink ? this.download : undefined)}
        rel=${ifDefined(isLink && this.rel ? this.rel : undefined)}
        role=${ifDefined(isLink ? undefined : 'button')}
        aria-disabled=${ifDefined(isLink && this.disabled ? 'true' : undefined)}
        aria-label=${ifDefined(this.fwdLabel ?? (this.label || undefined))}
        aria-current=${ifDefined(this.fwdCurrent ?? (this.current || undefined))}
        aria-expanded=${ifDefined(this.fwdExpanded ?? undefined)}
        aria-haspopup=${ifDefined(this.fwdHaspopup ?? undefined)}
        aria-pressed=${ifDefined(this.fwdPressed ?? undefined)}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${
          // @ts-expect-error private in the parent
          this.handleClick
        }
      >
        <slot name="start" part="start" class="start"></slot>
        <slot part="label" class="label" @slotchange=${
          // @ts-expect-error private in the parent
          this.handleLabelSlotChange
        }></slot>
        <slot name="end" part="end" class="end"></slot>
      </${tag}>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cs-proto-keep-button': CsProtoKeepButton;
  }
}
