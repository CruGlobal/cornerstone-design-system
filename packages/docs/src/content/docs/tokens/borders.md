---
title: Borders
description: Border tokens define the edges and corners of Cornerstone components.
synonyms:
  - border
  - outline
  - stroke
use-cases:
  - border width
  - border style
  - border color
---

<style>
  .swatch {
    border-color: var(--cs-color-neutral-border-normal);
  }
</style>

Border tokens define the edges and corners of Cornerstone components. They use `rem` units so they scale with root font size. You can adjust individual tokens or use scale multipliers to change all widths or radii at once.

## Border Style

A single style token controls the line type used for all component borders throughout the library.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-border-style">
        <td class="token-name"><code>--cs-border-style</code></td>
        <td>Standard border line style used across all components</td>
        <td><div class="swatch" style="border-style: var(--cs-border-style)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Border Width

Border width tokens use `rem` units and are scaled by `--cs-border-width-scale`. Values below `1` make all borders thinner; values above `1` make them thicker.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-border-width-scale">
        <td class="token-name"><code>--cs-border-width-scale</code></td>
        <td>Global multiplier for all border width calculations</td>
        <td>—</td>
      </tr>
      <tr id="token-cs-border-width-s">
        <td class="token-name"><code>--cs-border-width-s</code></td>
        <td>Thin border, used for most component outlines</td>
        <td><div class="swatch" style="border-width: var(--cs-border-width-s)"></div></td>
      </tr>
      <tr id="token-cs-border-width-m">
        <td class="token-name"><code>--cs-border-width-m</code></td>
        <td>Medium border, used for emphasized borders</td>
        <td><div class="swatch" style="border-width: var(--cs-border-width-m)"></div></td>
      </tr>
      <tr id="token-cs-border-width-l">
        <td class="token-name"><code>--cs-border-width-l</code></td>
        <td>Thick border, used for prominent outlines</td>
        <td><div class="swatch" style="border-width: var(--cs-border-width-l)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

## Border Radius

Border radius tokens control the corner rounding of components. Size-based tokens use `rem` units and scale with `--cs-border-radius-scale`. Values below `1` make corners sharper; values above `1` make them rounder. Shape tokens provide fixed shapes regardless of the scale.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr><th>Custom Property</th><th>Description</th><th>Preview</th></tr>
    </thead>
    <tbody>
      <tr id="token-cs-border-radius-scale">
        <td class="token-name"><code>--cs-border-radius-scale</code></td>
        <td>Global multiplier for all border radius calculations</td>
        <td>—</td>
      </tr>
      <tr id="token-cs-border-radius-s">
        <td class="token-name"><code>--cs-border-radius-s</code></td>
        <td>Small corner rounding, for compact components like badges and checkboxes</td>
        <td><div class="swatch" style="border-radius: var(--cs-border-radius-s)"></div></td>
      </tr>
      <tr id="token-cs-border-radius-m">
        <td class="token-name"><code>--cs-border-radius-m</code></td>
        <td>Medium corner rounding, the default for most inputs and buttons</td>
        <td><div class="swatch" style="border-radius: var(--cs-border-radius-m)"></div></td>
      </tr>
      <tr id="token-cs-border-radius-l">
        <td class="token-name"><code>--cs-border-radius-l</code></td>
        <td>Large corner rounding, for cards and panels</td>
        <td><div class="swatch" style="border-radius: var(--cs-border-radius-l)"></div></td>
      </tr>
      <tr id="token-cs-border-radius-pill">
        <td class="token-name"><code>--cs-border-radius-pill</code></td>
        <td>Fully rounded ends, creating a pill shape regardless of element size</td>
        <td><div class="swatch" style="border-radius: var(--cs-border-radius-pill)"></div></td>
      </tr>
      <tr id="token-cs-border-radius-circle">
        <td class="token-name"><code>--cs-border-radius-circle</code></td>
        <td>Perfectly circular shape; element must have a 1:1 aspect ratio</td>
        <td><div class="swatch" style="aspect-ratio: 1 / 1; border-radius: var(--cs-border-radius-circle)"></div></td>
      </tr>
      <tr id="token-cs-border-radius-square">
        <td class="token-name"><code>--cs-border-radius-square</code></td>
        <td>No corner rounding; sharp, square corners</td>
        <td><div class="swatch" style="border-radius: var(--cs-border-radius-square)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>
