---
title: Transitions
description: Transition tokens define the duration and easing of motion across Cornerstone.
synonyms:
  - animation timing
  - easing
  - duration
use-cases:
  - transition speed
  - motion tokens
---

<style>
  .transition-swatch {
    background-color: var(--cs-color-neutral-fill-normal);
    border: none;
    position: relative;
    overflow: hidden;
  }
  .transition-swatch::after {
    content: '';
    position: absolute;
    background-color: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    transition: inherit;
  }
  .transition-swatch:hover::after,
  .transition-swatch:focus::after {
    width: 100%;
  }
</style>

Transition tokens make interactions feel more lively and help users understand the relationship between their action and its outcome.

Mouse over or focus the preview swatches below to see each token in action.

## Duration

Cornerstone uses different transition durations to make it easy to track a component's state while minimizing sluggish or distracting movement.

Properties that change between frequent, incidental states (like hover) typically use faster durations than properties that change between intentional states (like opening a menu or checking a box).

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-transition-fast">
        <td class="token-name"><code>--cs-transition-fast</code></td>
        <td>Fast duration for frequent, incidental state changes like hover and focus</td>
        <td><div tabindex="0" class="swatch transition-swatch" style="transition: width var(--cs-transition-fast) var(--cs-transition-easing)"></div></td>
      </tr>
      <tr id="token-cs-transition-normal">
        <td class="token-name"><code>--cs-transition-normal</code></td>
        <td>Standard duration for typical state changes</td>
        <td><div tabindex="0" class="swatch transition-swatch" style="transition: width var(--cs-transition-normal) var(--cs-transition-easing)"></div></td>
      </tr>
      <tr id="token-cs-transition-slow">
        <td class="token-name"><code>--cs-transition-slow</code></td>
        <td>Slow duration for intentional, impactful state changes like opening a panel or checking a box</td>
        <td><div tabindex="0" class="swatch transition-swatch" style="transition: width var(--cs-transition-slow) var(--cs-transition-easing)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Easing

Easing controls the standard `transition-timing-function` used for transitions throughout Cornerstone.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-transition-easing">
        <td class="token-name"><code>--cs-transition-easing</code></td>
        <td>Timing function (<code>transition-timing-function</code>) used for all Cornerstone transitions</td>
        <td><div tabindex="0" class="swatch transition-swatch" style="transition: width 600ms var(--cs-transition-easing)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>
