import { css } from 'lit';

/* The popup's card, the input wrapper, the segments and the trailing buttons come from segmentedFieldStyles, shared
   with <cs-time-input>. */
export default css`
  @layer cs-component {
    :host(:state(disabled)) {
      cursor: not-allowed;
    }

    /* Popup. The z-index matches the other form controls' popups: <cs-select>, <cs-combobox>, <cs-time-input>. */
    .date-input-popup {
      flex: 1 1 auto;
      display: inline-flex;
      width: 100%;
      position: relative;
      vertical-align: middle;

      &::part(popup) {
        z-index: 900;
      }

      &[data-current-placement^='top']::part(popup) {
        transform-origin: bottom;
      }

      &[data-current-placement^='bottom']::part(popup) {
        transform-origin: top;
      }
    }

    /* The start and end parts are wrappers around their slots, so the gap goes on what is slotted. !important,
       because a page's own margin reset would otherwise beat a shadow root's normal declarations. */
    .start > slot::slotted(*) {
      margin-inline-end: var(--cs-form-control-padding-inline) !important;
    }

    .end > slot::slotted(*) {
      margin-inline-start: var(--cs-form-control-padding-inline) !important;
    }
  }
`;
