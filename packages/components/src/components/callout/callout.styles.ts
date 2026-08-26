import { css } from 'lit';

export default css`
  :host {
    display: flex;
    position: relative;
    align-items: stretch;
    border-radius: var(--cs-panel-border-radius);
    background-color: var(--cs-color-fill-quiet, var(--cs-color-brand-fill-quiet));
    border-color: var(--cs-color-border-quiet, var(--cs-color-brand-border-quiet));
    border-style: var(--cs-panel-border-style);
    border-width: var(--cs-panel-border-width);
    color: var(--cs-color-text-normal);
    padding: 1em;
  }

  /* Appearance modifiers */
  :host([appearance~='plain']) {
    background-color: transparent;
    border-color: transparent;
  }

  :host([appearance~='outlined']) {
    background-color: transparent;
    border-color: var(--cs-color-border-loud, var(--cs-color-brand-border-loud));
  }

  :host([appearance~='filled']) {
    background-color: var(--cs-color-fill-quiet, var(--cs-color-brand-fill-quiet));
    border-color: transparent;
  }

  :host([appearance~='filled-outlined']) {
    border-color: var(--cs-color-border-quiet, var(--cs-color-brand-border-quiet));
  }

  :host([appearance~='accent']) {
    color: var(--cs-color-on-loud, var(--cs-color-brand-on-loud));
    background-color: var(--cs-color-fill-loud, var(--cs-color-brand-fill-loud));
    border-color: transparent;

    [part~='icon'] {
      color: currentColor;
    }
  }

  [part~='icon'] {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--cs-color-on-quiet);
    font-size: 1.25em;
  }

  /*
   * The gap between the icon and the message, and why it is !important.
   *
   * A slotted element belongs to the outer tree, so per the shadow cascade a *normal* declaration from the
   * outer tree beats one from the inner tree whatever the specificity: any document-level universal margin
   * reset -- Starlight's, Tailwind's Preflight, any of the classic ones -- silently collapsed this gap to zero.
   * The same cascade rule inverts for important declarations, where the inner tree wins, which is the mechanism
   * a component has to defend its own internals against a consumer's reset.
   *
   * Two alternatives were tried and do not work. Moving the margin to the icon container puts it out of reach
   * of outer rules, but the container renders whether or not anything is slotted, so an icon-less callout gains
   * the gap as dead space -- reacting to what is actually slotted is the thing ::slotted gets for free. Gating
   * that with :host(:has(> [slot='icon'])) does not match at all: :host() takes a compound selector, and :has()
   * with a relative selector inside it is not matched.
   */
  ::slotted([slot='icon']) {
    margin-inline-end: var(--cs-form-control-padding-inline) !important;
  }

  [part~='message'] {
    flex: 1 1 auto;
    display: block;
    overflow: hidden;
  }
`;
