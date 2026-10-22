import { css } from 'lit';

export default css`
  :host(:not([orientation='vertical'])) {
    display: block;
    border-top: solid var(--cs-divider-width, var(--cs-border-width-s))
      var(--cs-divider-color, var(--cs-color-surface-border));
    margin: var(--cs-divider-spacing, var(--cs-space-m)) 0;
  }

  :host([orientation='vertical']) {
    display: inline-block;
    height: 100%;
    border-inline-start: solid var(--cs-divider-width, var(--cs-border-width-s))
      var(--cs-divider-color, var(--cs-color-surface-border));
    margin: 0 var(--cs-divider-spacing, var(--cs-space-m));
    min-block-size: 1lh;
  }
`;
