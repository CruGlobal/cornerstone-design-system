import { css } from 'lit';

export default css`
  :host([size='xs']) {
    font-size: var(--cs-font-size-xs);
  }

  :host([size='s']) {
    font-size: var(--cs-font-size-s);
  }

  :host([size='m']) {
    font-size: var(--cs-font-size-m);
  }

  :host([size='l']) {
    font-size: var(--cs-font-size-l);
  }

  :host([size='xl']) {
    font-size: var(--cs-font-size-xl);
  }
`;
