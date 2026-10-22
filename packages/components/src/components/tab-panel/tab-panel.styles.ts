import { css } from 'lit';

export default css`
  :host {
    display: none;
  }

  :host([active]) {
    display: block;
  }

  .tab-panel {
    display: block;
    /* A tab group supplies its placement's default through the private --_tab-panel-padding. */
    padding: var(--cs-tab-panel-padding, var(--_tab-panel-padding, 0));
  }
`;
