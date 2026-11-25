import { css } from 'lit';

/**
 * Shared field styling for segmented-field pickers (`<cs-date-input>`, `<cs-time-input>`): the
 * popup's card, the input wrapper and its appearances, the segments, and the hidden value input.
 *
 * It also keeps their clear and expand buttons — and their start/end decoration slots — on the
 * same trailing optical axis as `<cs-select>`'s chevron and end-slot icons, while preserving each
 * button's padded hit target and focus ring.
 *
 * How the alignment works:
 *  - Each button keeps `0.25em` padding (hit area + focus-ring breathing room).
 *  - `margin-inline-end: -0.25em` lets that trailing padding overhang the trailing content
 *    edge instead of pushing the glyph inboard.
 *  - Each button is given a fixed `inline-size` equal to its natural width (glyph + 2×padding):
 *    `1.75em` for the expand glyph (1.25em) and `1.5em` for the clear glyph (1em). Because the
 *    width is fixed and the glyph is centered, a custom-slotted icon of any width stays centered
 *    on the axis — the alignment is glyph-agnostic, not tuned to one icon.
 *  - The expand button's `margin-inline-start` sets the gap that positions the clear button onto
 *    `<cs-select>`'s clear axis given those fixed widths.
 */
export default css`
  /* Popup body — the bordered card the popup's content sits in. */
  .popup-body {
    display: inline-flex;
    flex-direction: column;
    background-color: var(--cs-color-surface-raised);
    border: var(--cs-border-style) var(--cs-border-width-s) var(--cs-color-surface-border);
    border-radius: var(--cs-border-radius-m);
    box-shadow: var(--cs-shadow-m);
    color: var(--cs-color-text-normal);
    font-size: inherit;
    padding: var(--cs-space-2xs);
  }

  /* Input wrapper */
  .input-wrapper {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    min-height: var(--cs-form-control-height);
    background-color: var(--cs-form-control-background-color);
    border-color: var(--cs-form-control-border-color);
    border-radius: var(--cs-form-control-border-radius);
    border-style: var(--cs-form-control-border-style);
    border-width: var(--cs-form-control-border-width);
    color: var(--cs-form-control-value-color);
    cursor: text;
    font-family: inherit;
    font-weight: var(--cs-form-control-value-font-weight);
    line-height: var(--cs-form-control-value-line-height);
    padding: 0 var(--cs-form-control-padding-inline);
    transition:
      background-color var(--cs-transition-normal),
      border-color var(--cs-transition-normal),
      outline-color var(--cs-transition-fast);
    transition-timing-function: var(--cs-transition-easing);
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) transparent;
    outline-offset: var(--cs-focus-ring-offset);
  }

  :host([pill]) .input-wrapper {
    border-radius: var(--cs-border-radius-pill);
  }

  :host(:focus-within) .input-wrapper {
    outline-color: var(--cs-color-focus);
  }

  :host(:state(disabled)) .input-wrapper {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Appearance variants */
  :host([appearance='filled']) .input-wrapper,
  :host([appearance='filled-outlined']) .input-wrapper {
    background-color: var(--cs-color-surface-lowered);
  }

  :host([appearance='filled']) .input-wrapper {
    border-color: transparent;
  }

  /* Segmented input */
  .segments {
    flex: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    caret-color: transparent;
  }

  .segment {
    display: inline-block;
    padding: 0 0.15em;
    margin: 0;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font: inherit;
    text-align: center;
    cursor: text;
    user-select: none;
    white-space: nowrap;
    border-radius: var(--cs-border-radius-s);
    transition:
      background-color var(--cs-transition-fast),
      color var(--cs-transition-fast);
  }

  .segment.empty {
    color: var(--cs-color-text-quiet);
  }

  /* Focus style — applies to keyboard *and* pointer focus so a click always shows the selection. Soft brand fill
     reads as "selected" without competing with the popup's loud selected items. */
  .segment:focus {
    background-color: var(--cs-color-brand-fill-quiet);
    color: var(--cs-color-brand-on-quiet);
    outline: none;
  }

  .segment.empty:focus {
    color: var(--cs-color-brand-on-quiet);
  }

  .segment-literal {
    display: inline-block;
    color: var(--cs-color-text-quiet);
    white-space: pre;
    user-select: none;
  }

  :host([disabled]) .segment,
  :host([readonly]) .segment {
    cursor: inherit;
  }

  /* Hidden form-value input (anchored under the wrapper for native validity tooltips). */
  .value-input {
    position: absolute;
    inset-inline-start: var(--cs-form-control-padding-inline);
    inset-block-start: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    border: none;
    padding: 0;
    margin: 0;
  }

  /* font: inherit lifts the UA default button font-size so children that size with em
     (e.g. the expand icon) resolve against the host size-driven font-size instead of ~13px. */
  [part~='clear-button'],
  [part~='expand-button'] {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--cs-color-text-quiet);
    font: inherit;
    padding: 0.25em;
    /* Trailing padding overhangs the content edge rather than displacing the glyph. */
    margin-inline-end: -0.25em;
    border-radius: var(--cs-border-radius-s);
    transition: color var(--cs-transition-fast);
  }

  /* Fixed widths (= glyph + 2×0.25em padding) keep each glyph centered on the trailing axis
     regardless of the slotted icon's intrinsic width. */
  [part~='expand-button'] {
    inline-size: 1.75em;
    /* Leading gap that lands the clear button on <cs-select>'s clear axis. Scales with the
       form-control padding token (like select's own spacing) so it holds across themes; the
       0.125em offset accounts for the fixed button widths. */
    margin-inline-start: calc(var(--cs-form-control-padding-inline) - 0.125em);
  }

  [part~='clear-button'] {
    inline-size: 1.5em;
    margin-inline-start: var(--cs-form-control-padding-inline);
  }

  [part~='clear-button']:hover,
  [part~='expand-button']:hover {
    color: var(--cs-color-text-normal);
  }

  [part~='expand-button']:focus-visible {
    outline: var(--cs-focus-ring-style) var(--cs-focus-ring-width) var(--cs-color-focus);
    outline-offset: 2px;
  }

  /* font-size scales the glyph with the host size attribute; the button width handles centering. */
  [part~='expand-icon'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cs-color-text-quiet);
    font-size: 1.25em;
  }

  /* Start / end decoration slots. Spaced with the same --cs-form-control-padding-inline gap as
     <cs-input>/<cs-select> so slotted icons line up with the rest of the form controls, rather
     than the tighter 0.25em the pickers used before. */
  [part~='start'],
  [part~='end'] {
    display: inline-flex;
    align-items: center;
    color: var(--cs-color-text-quiet);
  }

  [part~='start']::slotted(*) {
    margin-inline-end: var(--cs-form-control-padding-inline);
  }

  [part~='end']::slotted(*) {
    margin-inline-start: var(--cs-form-control-padding-inline);
  }
`;
