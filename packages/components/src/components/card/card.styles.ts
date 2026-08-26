import { css } from 'lit';

export default css`
  :host {
    --spacing: var(--cs-space-l);

    /* Internal calculated properties */
    --inner-border-radius: calc(var(--cs-panel-border-radius) - var(--cs-panel-border-width));

    display: flex;
    flex-direction: column;
    background-color: var(--cs-color-surface-default);
    border-color: var(--cs-color-surface-border);
    border-radius: var(--cs-panel-border-radius);
    border-style: var(--cs-panel-border-style);
    box-shadow: var(--cs-shadow-s);
    border-width: var(--cs-panel-border-width);
    color: var(--cs-color-text-normal);
  }

  /* Appearance modifiers */
  :host([appearance='plain']) {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  :host([appearance='outlined']) {
    background-color: var(--cs-color-surface-default);
    border-color: var(--cs-color-surface-border);
  }

  :host([appearance='filled']) {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: transparent;
  }

  :host([appearance='filled-outlined']) {
    background-color: var(--cs-color-neutral-fill-quiet);
    border-color: var(--cs-color-surface-border);
  }

  :host([appearance='accent']) {
    color: var(--cs-color-neutral-on-loud);
    background-color: var(--cs-color-neutral-fill-loud);
    border-color: transparent;
  }

  /* Take care of top and bottom radii */
  .media,
  :host(:not([has-media])) .header,
  :host(:not([has-media], [has-header])) .body {
    border-start-start-radius: var(--inner-border-radius);
    border-start-end-radius: var(--inner-border-radius);
  }

  :host(:not([has-footer])) .body,
  .footer {
    border-end-start-radius: var(--inner-border-radius);
    border-end-end-radius: var(--inner-border-radius);
  }

  .media {
    display: flex;
    overflow: hidden;

    &::slotted(*) {
      display: block;
      width: 100%;
      border-radius: 0 !important;
    }
  }

  /* Round all corners for plain appearance */
  :host([appearance='plain']) .media {
    border-radius: var(--inner-border-radius);

    &::slotted(*) {
      border-radius: inherit !important;
    }
  }

  .header {
    display: block;
    border-block-end-style: inherit;
    border-block-end-color: var(--cs-color-surface-border);
    border-block-end-width: var(--cs-panel-border-width);
    padding: calc(var(--spacing) / 2) var(--spacing);
  }

  .body {
    display: block;
    padding: var(--spacing);
  }

  .footer {
    display: block;
    border-block-start-style: inherit;
    border-block-start-color: var(--cs-color-surface-border);
    border-block-start-width: var(--cs-panel-border-width);
    padding: var(--spacing);
  }

  /* Push slots to sides when the action slots renders */
  .has-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :host(:not([has-header])) .header,
  :host(:not([has-footer])) .footer,
  :host(:not([has-media])) .media {
    display: none;
  }

  /* Orientation Styles */
  :host([orientation='horizontal']) {
    flex-direction: row;

    .media {
      border-start-start-radius: var(--inner-border-radius);
      border-end-start-radius: var(--inner-border-radius);
      border-start-end-radius: 0;

      &::slotted(*) {
        block-size: 100%;
        inline-size: 100%;
        object-fit: cover;
      }
    }
  }

  :host([orientation='horizontal']) .body slot::slotted(*) {
    display: block;
    height: 100%;
    margin: 0;
  }

  :host([orientation='horizontal']) slot[name='actions']::slotted(*) {
    display: flex;
    align-items: center;
    padding: var(--spacing);
  }
`;
