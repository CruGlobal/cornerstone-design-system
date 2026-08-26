---
title: Shadows
description: Shadow tokens convey elevation and depth in Cornerstone components.
synonyms:
  - box shadow
  - elevation
  - depth
use-cases:
  - drop shadow
  - card shadow
  - overlay shadow
---

Shadow tokens indicate elevation and, often, interactivity. Cornerstone provides three size-based shadow shorthands built from modular offset, blur, and spread tokens. Together with [`--cs-color-shadow`](/tokens/color), these tokens create realistic drop shadows.

Larger shadows have greater offset and blur values to suggest greater distance from the surface below. Any shadow can also be used as an inner shadow with the `inset` keyword, e.g. `box-shadow: inset var(--cs-shadow-s)`.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-shadow-s">
        <td class="token-name"><code>--cs-shadow-s</code></td>
        <td>Small shadow for subtle elevation (e.g., cards, inputs)</td>
        <td><div class="swatch" style="box-shadow: var(--cs-shadow-s)"></div></td>
      </tr>
      <tr id="token-cs-shadow-m">
        <td class="token-name"><code>--cs-shadow-m</code></td>
        <td>Medium shadow for moderate elevation (e.g., dropdowns, popovers)</td>
        <td><div class="swatch" style="box-shadow: var(--cs-shadow-m)"></div></td>
      </tr>
      <tr id="token-cs-shadow-l">
        <td class="token-name"><code>--cs-shadow-l</code></td>
        <td>Large shadow for high elevation (e.g., dialogs, drawers)</td>
        <td><div class="swatch" style="box-shadow: var(--cs-shadow-l)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Horizontal Offset (X)

Offset-x tokens control a shadow's horizontal position relative to the element. Use `--cs-shadow-offset-x-scale` to change all offset-x tokens at once.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-shadow-offset-x-scale">
        <td class="token-name"><code>--cs-shadow-offset-x-scale</code></td>
        <td>Global multiplier for horizontal shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-x-s">
        <td class="token-name"><code>--cs-shadow-offset-x-s</code></td>
        <td>Small horizontal shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-x-m">
        <td class="token-name"><code>--cs-shadow-offset-x-m</code></td>
        <td>Medium horizontal shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-x-l">
        <td class="token-name"><code>--cs-shadow-offset-x-l</code></td>
        <td>Large horizontal shadow offset</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Vertical Offset (Y)

Offset-y tokens control a shadow's vertical position relative to the element. Use `--cs-shadow-offset-y-scale` to change all offset-y tokens at once.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-shadow-offset-y-scale">
        <td class="token-name"><code>--cs-shadow-offset-y-scale</code></td>
        <td>Global multiplier for vertical shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-y-s">
        <td class="token-name"><code>--cs-shadow-offset-y-s</code></td>
        <td>Small vertical shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-y-m">
        <td class="token-name"><code>--cs-shadow-offset-y-m</code></td>
        <td>Medium vertical shadow offset</td>
      </tr>
      <tr id="token-cs-shadow-offset-y-l">
        <td class="token-name"><code>--cs-shadow-offset-y-l</code></td>
        <td>Large vertical shadow offset</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Blur

Blur tokens control how soft or sharp the shadow edge is. Use `--cs-shadow-blur-scale` to change all blur tokens at once.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-shadow-blur-scale">
        <td class="token-name"><code>--cs-shadow-blur-scale</code></td>
        <td>Global multiplier for shadow blur radius. Also affects <code>--cs-color-shadow</code> opacity.</td>
      </tr>
      <tr id="token-cs-shadow-blur-s">
        <td class="token-name"><code>--cs-shadow-blur-s</code></td>
        <td>Small shadow blur radius</td>
      </tr>
      <tr id="token-cs-shadow-blur-m">
        <td class="token-name"><code>--cs-shadow-blur-m</code></td>
        <td>Medium shadow blur radius</td>
      </tr>
      <tr id="token-cs-shadow-blur-l">
        <td class="token-name"><code>--cs-shadow-blur-l</code></td>
        <td>Large shadow blur radius</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Spread

Spread tokens expand or contract the shadow shape. A negative spread (the default) contracts the shadow inward for a more natural look. Use `--cs-shadow-spread-scale` to change all spread tokens at once.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-shadow-spread-scale">
        <td class="token-name"><code>--cs-shadow-spread-scale</code></td>
        <td>Global multiplier for shadow spread. Negative values contract the shadow inward.</td>
      </tr>
      <tr id="token-cs-shadow-spread-s">
        <td class="token-name"><code>--cs-shadow-spread-s</code></td>
        <td>Small shadow spread</td>
      </tr>
      <tr id="token-cs-shadow-spread-m">
        <td class="token-name"><code>--cs-shadow-spread-m</code></td>
        <td>Medium shadow spread</td>
      </tr>
      <tr id="token-cs-shadow-spread-l">
        <td class="token-name"><code>--cs-shadow-spread-l</code></td>
        <td>Large shadow spread</td>
      </tr>
    </tbody>
  </table>
</cs-scroller>
