import { css } from 'lit';

export default css`
  .cs-visually-hidden:not(:focus-within),
  .cs-visually-hidden-force,
  .cs-visually-hidden-hint::part(hint),
  .cs-visually-hidden-label::part(label),
  .cs-visually-hidden-label::part(form-control-label) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    clip: rect(0 0 0 0) !important;
    clip-path: inset(50%) !important;
    border: none !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    padding: 0 !important;
  }
`;
