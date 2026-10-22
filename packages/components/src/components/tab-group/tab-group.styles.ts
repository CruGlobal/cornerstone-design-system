import { css } from 'lit';

export default css`
  :host {
    /* Private */
    --_safe-track-width: max(0.5px, round(var(--cs-tab-group-track-width, 0.125rem), 0.5px));

    display: block;
  }

  .tab-group {
    display: flex;
    border-radius: 0;
  }

  .tabs {
    display: flex;
    position: relative;
  }

  .indicator {
    position: absolute;
  }

  .tab-group-has-scroll-controls .nav-container {
    position: relative;
    padding: 0 1.5em;
  }

  .body {
    display: block;
  }

  .scroll-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1.5em;
  }

  .scroll-button-start {
    inset-inline-start: 0;
  }

  .scroll-button-end {
    inset-inline-end: 0;
  }

  /*
    * Top
    */

  .tab-group-top {
    flex-direction: column;
  }

  .tab-group-top .nav-container {
    order: 1;
  }

  .tab-group-top .nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group-top .nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group-top .tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-bottom: solid var(--_safe-track-width) var(--cs-tab-group-track-color, var(--cs-color-neutral-fill-normal));
  }

  .tab-group-top .indicator {
    bottom: calc(-1 * var(--_safe-track-width));
    border-bottom: solid var(--_safe-track-width) var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
  }

  .tab-group-top .body {
    order: 2;
  }

  /* These are !important because a document-level universal margin reset would otherwise beat them:
     a slotted element belongs to the outer tree. See callout.styles.ts for the full note. */
  .tab-group-top ::slotted(cs-tab[active]) {
    border-block-end: solid var(--_safe-track-width)
      var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
    margin-block-end: calc(-1 * var(--_safe-track-width)) !important;
  }

  /* Hand-off: each placement sets its panels' default padding privately, so --cs-tab-panel-padding set on the page
     or a section still wins. */
  .tab-group-top .body slot::slotted(cs-tab-panel) {
    --_tab-panel-padding: var(--cs-space-xl) 0;
  }

  /*
    * Bottom
    */

  .tab-group-bottom {
    flex-direction: column;
  }

  .tab-group-bottom .nav-container {
    order: 2;
  }

  .tab-group-bottom .nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group-bottom .nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group-bottom .tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-top: solid var(--_safe-track-width) var(--cs-tab-group-track-color, var(--cs-color-neutral-fill-normal));
  }

  .tab-group-bottom .indicator {
    top: calc(-1 * var(--_safe-track-width));
    border-top: solid var(--_safe-track-width) var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
  }

  .tab-group-bottom .body {
    order: 1;
  }

  .tab-group-bottom ::slotted(cs-tab[active]) {
    border-block-start: solid var(--_safe-track-width)
      var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
    margin-block-start: calc(-1 * var(--_safe-track-width)) !important;
  }

  .tab-group-bottom .body slot::slotted(cs-tab-panel) {
    --_tab-panel-padding: var(--cs-space-xl) 0;
  }

  /*
    * Start
    */

  .tab-group-start {
    flex-direction: row;
  }

  .tab-group-start .nav-container {
    order: 1;
  }

  .tab-group-start .tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-inline-end: solid var(--_safe-track-width)
      var(--cs-tab-group-track-color, var(--cs-color-neutral-fill-normal));
  }

  .tab-group-start .indicator {
    inset-inline-end: calc(-1 * var(--_safe-track-width));
    border-right: solid var(--_safe-track-width) var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
  }

  .tab-group-start .body {
    flex: 1 1 auto;
    order: 2;
  }

  .tab-group-start ::slotted(cs-tab[active]) {
    border-inline-end: solid var(--_safe-track-width)
      var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
    margin-inline-end: calc(-1 * var(--_safe-track-width)) !important;
  }

  .tab-group-start .body slot::slotted(cs-tab-panel) {
    --_tab-panel-padding: 0 var(--cs-space-xl);
  }

  /*
    * End
    */

  .tab-group-end {
    flex-direction: row;
  }

  .tab-group-end .nav-container {
    order: 2;
  }

  .tab-group-end .tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-left: solid var(--_safe-track-width) var(--cs-tab-group-track-color, var(--cs-color-neutral-fill-normal));
  }

  .tab-group-end .indicator {
    inset-inline-start: calc(-1 * var(--_safe-track-width));
    border-inline-start: solid var(--_safe-track-width)
      var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
  }

  .tab-group-end .body {
    flex: 1 1 auto;
    order: 1;
  }

  .tab-group-end ::slotted(cs-tab[active]) {
    border-inline-start: solid var(--_safe-track-width)
      var(--cs-tab-group-indicator-color, var(--cs-color-brand-fill-loud));
    margin-inline-start: calc(-1 * var(--_safe-track-width)) !important;
  }

  .tab-group-end .body slot::slotted(cs-tab-panel) {
    --_tab-panel-padding: 0 var(--cs-space-xl);
  }
`;
