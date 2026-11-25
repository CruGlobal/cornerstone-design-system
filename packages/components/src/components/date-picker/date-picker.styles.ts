import { css } from 'lit';

export default css`
  @layer cs-component {
    :host {
      display: inline-block;
    }

    .date-picker {
      display: inline-flex;
      flex-direction: column;
      gap: 0.5em;
      color: var(--cs-color-text-normal);
    }

    :host([disabled]) .date-picker {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 0.25em;
    }

    .title {
      flex: 1 1 auto;
      text-align: center;
      font-weight: var(--cs-font-weight-semibold);
    }

    .navigation-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 2.25em;
      height: 2.25em;
      padding: 0;
      border: none;
      border-radius: var(--cs-border-radius-m);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .navigation-button cs-icon {
      font-size: 1.25em;
    }

    .navigation-button:hover:not(:disabled, [aria-disabled='true']) {
      background-color: var(--cs-color-neutral-fill-quiet);
    }

    .navigation-button:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }

    .navigation-button:disabled {
      cursor: inherit;
    }

    .navigation-button[aria-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Grid */
    .grid {
      border-collapse: separate;
      border-spacing: 0;
    }

    .weekday {
      padding: 0 0 0.25em;
      color: var(--cs-color-text-quiet);
      font-weight: var(--cs-font-weight-semibold);
      text-align: center;
    }

    /* MAX_SHORT_WEEKDAY_LENGTH in date-picker.ts is measured against this size and the day width below. */
    .weekday-short {
      font-size: 0.75em;
    }

    .day,
    .placeholder {
      width: 2.25em;
      height: 2.25em;
      padding: 0;
      text-align: center;
      vertical-align: middle;
    }

    .day {
      /* A transparent border keeps every day the same size when the selected one draws its ring. */
      border: var(--cs-border-width-m) solid transparent;
      border-radius: var(--cs-border-radius-m);
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      user-select: none;
    }

    :host([readonly]) .day {
      cursor: default;
    }

    :host(:not([readonly])) .day:hover:not([aria-disabled='true'], [aria-selected='true']) {
      background-color: var(--cs-color-neutral-fill-quiet);
    }

    .day:focus-visible {
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }

    /*
     * Selected: a filled day inside a ring. The brand fill alone can sit near the surface's lightness (Cru's yellow
     * on white), and the brand border is that same yellow there, so the ring takes the brand's foreground colour,
     * which keeps 3:1 against the surface in every shipped theme and scheme.
     */
    .day[aria-selected='true'] {
      border-color: var(--cs-color-brand-on-quiet);
      background-color: var(--cs-color-brand-fill-loud);
      color: var(--cs-color-brand-on-loud);
      font-weight: var(--cs-font-weight-semibold);
    }

    /* Today: an underline drawn in the text's own colour, so it reads on a selected day too. */
    .day[aria-current='date'] {
      font-weight: var(--cs-font-weight-bold);
      text-decoration-line: underline;
      text-decoration-thickness: 0.125em;
      text-underline-offset: 0.25em;
    }

    /* A day outside min and max or on a disabled list. A disabled picker dims as a whole instead. */
    .day-unavailable {
      color: var(--cs-color-text-quiet);
      text-decoration-line: line-through;
      cursor: not-allowed;
    }

    .day-unavailable[aria-current='date'] {
      text-decoration-line: underline line-through;
    }

    :host([disabled]) .day {
      cursor: inherit;
    }

    @media (forced-colors: active) {
      .day[aria-selected='true'] {
        forced-color-adjust: none;
        border-color: Highlight;
        background-color: Highlight;
        color: HighlightText;
      }

      .day-unavailable {
        color: GrayText;
      }
    }
  }
`;
