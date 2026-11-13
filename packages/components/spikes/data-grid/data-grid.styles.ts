import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      --_row-height: var(--cs-data-grid-row-height, var(--cs-form-control-height));
      --_border: var(--cs-border-width-s) var(--cs-border-style)
        var(--cs-data-grid-border-color, var(--cs-color-surface-border));
      --_background: var(--cs-data-grid-background, var(--cs-color-surface-default));

      display: block;
      height: var(--cs-data-grid-height, 24em);
    }

    .data-grid {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-2xs);
      height: 100%;
      color: var(--cs-color-text-normal);
      font-family: var(--cs-font-family-body);
    }

    .data-grid__skip {
      align-self: flex-start;
      color: var(--cs-color-text-link);
    }

    .data-grid__label {
      font-weight: var(--cs-font-weight-semibold);
    }

    .data-grid__hint {
      color: var(--cs-color-text-quiet);
      font-size: var(--cs-font-size-smaller);
    }

    .data-grid__scroller {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      border: var(--_border);
      border-radius: var(--cs-border-radius-m);
      background: var(--_background);
    }

    .data-grid__head {
      position: sticky;
      top: 0;
      z-index: 3;
      width: max-content;
    }

    .data-grid__body {
      position: relative;
    }

    .data-grid__row {
      display: grid;
      grid-template-columns: var(--_columns);
      height: var(--_row-height);
    }

    .data-grid__body .data-grid__row {
      position: absolute;
      top: 0;
      inset-inline-start: 0;
    }

    /* Each row's transform makes it a stacking context, so lift the active row for its error message. */
    .data-grid__body .data-grid__row--active {
      z-index: 1;
    }

    .cell {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--cs-space-3xs);
      min-width: 0;
      padding-inline: var(--cs-space-xs);
      border-block-end: var(--_border);
      border-inline-end: var(--_border);
      background: var(--_background);
      white-space: nowrap;
      outline: none;
    }

    .cell__value {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cell--end {
      justify-content: flex-end;
      font-variant-numeric: tabular-nums;
    }

    .cell--header {
      background: var(--cs-data-grid-header-background, var(--cs-color-surface-lowered));
      font-weight: var(--cs-font-weight-semibold);
    }

    .cell--readonly:not(.cell--header) {
      color: var(--cs-color-text-quiet);
    }

    /* Pinned columns stay in the row, in DOM order, and stick with inset-inline-start (Esther R7). */
    .cell--pinned {
      position: sticky;
      z-index: 2;
    }

    .cell--pinned-last {
      border-inline-end-width: var(--cs-border-width-l);
    }

    /* The active row: tinted, and its row header carries a bar so it is not shown by colour alone (Esther E2). */
    .data-grid__row--active .cell:not(.cell--header) {
      background: color-mix(in oklab, var(--cs-color-brand-fill-quiet) 60%, var(--_background));
    }

    .data-grid__row--active [role='rowheader'] {
      box-shadow: inset var(--cs-border-width-l) 0 0 0 var(--cs-color-brand-border-loud);
    }

    .data-grid__row--active [role='rowheader']:dir(rtl) {
      box-shadow: inset calc(-1 * var(--cs-border-width-l)) 0 0 0 var(--cs-color-brand-border-loud);
    }

    /* The active cell while focus is elsewhere: dashed, so Tab back in has a visible landing spot. */
    .cell--active {
      outline: var(--cs-border-width-m) dashed var(--cs-color-neutral-border-loud);
      outline-offset: calc(-1 * var(--cs-border-width-m));
    }

    .cell:focus,
    .cell--editing {
      z-index: 4;
      outline: var(--cs-focus-ring);
      outline-offset: calc(-1 * var(--cs-focus-ring-width));
    }

    .cell--editing {
      padding: 0;
    }

    .cell--invalid {
      border-color: var(--cs-color-danger-border-loud);
    }

    .cell__icon {
      flex: none;
      font-weight: var(--cs-font-weight-bold);
    }

    .cell--invalid .cell__icon,
    .status--error,
    .status--failed {
      color: var(--cs-color-danger-on-quiet);
    }

    .cell__message {
      position: absolute;
      top: 100%;
      inset-inline-start: 0;
      z-index: 5;
      width: max-content;
      max-width: 20em;
      padding: var(--cs-space-3xs) var(--cs-space-xs);
      border-radius: var(--cs-border-radius-s);
      background: var(--cs-color-danger-fill-loud);
      color: var(--cs-color-danger-on-loud);
      font-size: var(--cs-font-size-smaller);
      white-space: normal;
    }

    .cell__editor {
      width: 100%;
      height: 100%;
      min-width: 0;
      margin: 0;
      padding-inline: var(--cs-space-xs);
      border: none;
      background: var(--cs-form-control-background-color);
      color: var(--cs-form-control-value-color);
      font: inherit;
      text-align: inherit;
      outline: none;
    }

    .lookup {
      position: fixed;
      inset: auto;
      margin: 0;
      max-height: 16em;
      overflow: auto;
      padding: var(--cs-space-3xs);
      border: var(--_border);
      border-radius: var(--cs-border-radius-m);
      background: var(--cs-color-surface-raised);
      color: var(--cs-color-text-normal);
      box-shadow: var(--cs-shadow-m);
      font: inherit;
    }

    .lookup__option {
      display: flex;
      gap: var(--cs-space-xs);
      padding: var(--cs-space-3xs) var(--cs-space-xs);
      border-radius: var(--cs-border-radius-s);
      cursor: pointer;
    }

    .lookup__option[aria-selected='true'] {
      background: var(--cs-color-brand-fill-normal);
      color: var(--cs-color-brand-on-normal);
      outline: var(--cs-border-width-m) solid var(--cs-color-brand-border-loud);
      outline-offset: calc(-1 * var(--cs-border-width-m));
    }

    .lookup__marker {
      inline-size: 1ch;
    }

    .lookup__empty {
      padding: var(--cs-space-xs);
      color: var(--cs-color-text-quiet);
    }

    .data-grid__probe {
      position: absolute;
      visibility: hidden;
      width: 1px;
      height: var(--_row-height);
    }
  }
`;
