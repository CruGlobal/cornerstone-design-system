---
title: Color
description: Color tokens provide a full palette, semantic variants, and themed element colors with readable contrast.
synonyms:
  - palette
  - color system
  - color tokens
use-cases:
  - theme colors
  - brand palette
  - semantic colors
---

<style>
  /* Palette swatches */
  .palette-swatches {
    display: grid;
    grid-template-columns: repeat(11, 1fr);
    gap: var(--cs-space-3xs);
    margin-block-start: var(--cs-space-l);
    margin-block-end: var(--cs-space-m);
  }
  .palette-swatch {
    display: block;
    position: relative;
    aspect-ratio: 1.5 / 1;
  }
  @media (max-width: 576px) {
    .palette-swatches {
      grid-template-columns: repeat(6, 1fr);
      gap: var(--cs-space-2xs);
      row-gap: var(--cs-space-l);
    }
    .palette-swatch {
      &::before {
        font-size: var(--cs-font-size-2xs);
        top: calc(-1 * var(--cs-space-m));
      }
    }
  }

  .color-mix-example {
    background-image:
      linear-gradient(
        to right,
        color-mix(in oklab, transparent, var(--mix-color)) 25%,
        color-mix(in oklab, var(--cs-color-brand-fill-loud), var(--mix-color)) 25%,
        color-mix(in oklab, var(--cs-color-brand-fill-loud), var(--mix-color)) 75%,
        var(--cs-color-brand-fill-loud) 75%
      );
    border: none;
    color: var(--cs-color-brand-on-loud);
    text-align: center;
  }
</style>

Cornerstone's color system is made up of three layers: a [color palette](/color-palettes) that gives you a full spectrum of hues, [variant colors](#variant-colors) that define semantic color variations (like success and danger), and [colors for themed elements](#color-for-themed-elements) that apply specific tints from your palette and variant colors to the elements that make up a theme.

For an overview of how theming works across the library, see [Theming <cs-icon name="arrow_forward"></cs-icon>](/theming-overview).

## Color Palette

[Color palettes](/color-palettes) give you a full spectrum of colors to use in your project and are the lowest-level color tokens. Each brand's palette names its own hues, and each hue has 11 numeric tints that make up a color scale from light to dark: `95` is near white, and `05` is near black.

These numeric tints help ensure accessible color contrast per [WCAG 2.1 success criteria](https://www.w3.org/TR/WCAG21/#contrast-minimum):

- A difference of 40 provides a minimum 3:1 contrast ratio, suitable for large text and icons (AA)
- A difference of 50 provides a minimum 4.5:1 contrast ratio, suitable for normal text (AA) and large text (AAA)
- A difference of 60 provides a minimum 7:1 contrast ratio, suitable for all text (AAA)

::color-scales

### Core Colors

In addition to numeric tints, each hue has a _core color_ — the most colorful, vibrant tint in the scale. The exact tint varies by palette. Use `--cs-color-{hue}` when you want a representative color for a hue without specifying a tint.

The tint for each core color is stored as an integer in `--cs-color-{hue}-key`. These tokens are used internally to determine a compatible text color when using the core color as a background and are not used directly by components.

Using this key, the color system derives a paired _on color_ guaranteed to meet WCAG 2.1 AA contrast when placed on top of the corresponding core color. If the core tint is light (≥ 60), the on color is a dark shade of that hue; otherwise it is white. Use `--cs-color-{hue}-on` any time you render text or icons on a core color background.

::core-colors

## Variant Colors

Variant colors are aliases for specific hues in your color palette to give them an extra layer of semantic meaning. These variants are familiar, meaningful hues that reinforce a specific message or intended use. Each theme picks its own default hue for each variant. The table shows the defaults in Cru's theme and in FamilyLife's. Only the loaded theme's column has swatches, because a page holds one theme's colors at a time. On this site, the header menu picks the theme.

| Variant | Use | Cru default | FamilyLife default |
| --- | --- | --- | --- |
| Brand | Product recognition | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-yellow);" variant="fill"></cs-icon> yellow | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-dark-green);" variant="fill"></cs-icon> dark-green |
| Neutral | Generic and ordinary content | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-gray);" variant="fill"></cs-icon> gray | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-off-white);" variant="fill"></cs-icon> off-white |
| Highlight | Emphasis without a status meaning | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-purple);" variant="fill"></cs-icon> purple | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-yellow);" variant="fill"></cs-icon> yellow |
| Information | Neutral, informative messages | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-turquoise);" variant="fill"></cs-icon> turquoise | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-blue);" variant="fill"></cs-icon> blue |
| Success | Validity or confirmation | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-green);" variant="fill"></cs-icon> green | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-mint);" variant="fill"></cs-icon> mint |
| Warning | Caution or uncertainty | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-orange);" variant="fill"></cs-icon> orange | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-orange);" variant="fill"></cs-icon> orange |
| Danger | Errors or risk | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-cerise);" variant="fill"></cs-icon> cerise | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-ruby);" variant="fill"></cs-icon> ruby |
| Link | Hyperlinks | <cs-icon name="square" data-brand-only="cru" style="color: var(--cs-color-cyan);" variant="fill"></cs-icon> cyan | <cs-icon name="square" data-brand-only="fl" style="color: var(--cs-color-blue);" variant="fill"></cs-icon> blue |

Brand and neutral are used by nearly every element, component, and pattern across the library. Success, warning and danger are used selectively by components that could benefit from semantic reinforcement, such as buttons and callouts. Highlight, information and link are this library's own additions to the set, and both brand themes set all eight.

Each variant color is an alias for a palette color and follows the same token format: `--cs-color-{variant}-{tint}`.

::color-scales{scales="brand neutral highlight information success warning danger link"}

### Core Colors

Just like the hues in your color palette, each variant has a _core color_ — an alias for the most colorful, vibrant tint in the color scale selected for your variant. Use `--cs-color-{variant}` when you want a representative color for a variant without specifying a tint.

Each core color also has a paired _on color_ (`--cs-color-{variant}-on`) guaranteed to meet WCAG 2.1 AA contrast when placed on top of it. Use on color tokens any time you render text or icons on a core color background.

::variant-colors

### Changing Variant Colors

Any hue from your color palette can be assigned to any variant without redefining the tokens in your own stylesheet. To use a different hue, apply the `cs-{variant}-{hue}` class to the `<html>` element.

```html
<html class="cs-brand-purple cs-success-cyan"></html>
```

Every hue in the palette is available for every variant — the scales above are the full list.

## Color for Themed Elements

These tokens apply specific tints from your color palette and variant colors to the elements and components that make up a theme. They're named for the role they play rather than their appearance, and adapt to light and dark modes.

### Surfaces

Surfaces are background layers that content rests on. They convey elevation hierarchy — `raised` is closest to the user (e.g., dialogs) and `lowered` is farthest away (e.g., wells).

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr>
        <th>Custom Property</th>
        <th>Description</th>
        <th>Preview</th>
      </tr>
    </thead>
    <tbody>
      <tr id="token-cs-color-surface-raised">
        <td class="token-name"><code>--cs-color-surface-raised</code></td>
        <td>Background for elevated surfaces like dialogs and dropdown menus</td>
        <td><div class="swatch" style="background-color: var(--cs-color-surface-raised); box-shadow: var(--cs-shadow-s)"></div></td>
      </tr>
      <tr id="token-cs-color-surface-default">
        <td class="token-name"><code>--cs-color-surface-default</code></td>
        <td>Default page or container background</td>
        <td><div class="swatch" style="background-color: var(--cs-color-surface-default)"></div></td>
      </tr>
      <tr id="token-cs-color-surface-lowered">
        <td class="token-name"><code>--cs-color-surface-lowered</code></td>
        <td>Background for recessed surfaces like wells and code blocks</td>
        <td><div class="swatch" style="background-color: var(--cs-color-surface-lowered); box-shadow: inset var(--cs-shadow-s)"></div></td>
      </tr>
      <tr id="token-cs-color-surface-border">
        <td class="token-name"><code>--cs-color-surface-border</code></td>
        <td>Border color used to delineate surface areas</td>
        <td><div class="swatch" style="border-color: var(--cs-color-surface-border)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

### Text

Text colors are used for readable content and should meet a minimum 4.5:1 contrast ratio against surface colors.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr>
        <th>Custom Property</th>
        <th>Description</th>
        <th>Preview</th>
      </tr>
    </thead>
    <tbody>
      <tr id="token-cs-color-text-normal">
        <td class="token-name"><code>--cs-color-text-normal</code></td>
        <td>Primary text color for most content</td>
        <td><div style="color: var(--cs-color-text-normal); font-weight: var(--cs-font-weight-semibold)">AaBb</div></td>
      </tr>
      <tr id="token-cs-color-text-quiet">
        <td class="token-name"><code>--cs-color-text-quiet</code></td>
        <td>Subdued text for hints, captions, and other secondary content</td>
        <td><div style="color: var(--cs-color-text-quiet); font-weight: var(--cs-font-weight-semibold)">AaBb</div></td>
      </tr>
      <tr id="token-cs-color-text-link">
        <td class="token-name"><code>--cs-color-text-link</code></td>
        <td>Color for hyperlinks</td>
        <td><div style="color: var(--cs-color-text-link); font-weight: var(--cs-font-weight-semibold)">AaBb</div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

### Overlays

Overlays provide a backdrop that isolates content, often with some transparency so background context shows through.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr>
        <th>Custom Property</th>
        <th>Description</th>
        <th>Preview</th>
      </tr>
    </thead>
    <tbody>
      <tr id="token-cs-color-overlay-modal">
        <td class="token-name"><code>--cs-color-overlay-modal</code></td>
        <td>Semi-transparent backdrop behind modal dialogs</td>
        <td><div class="swatch" style="background-color: var(--cs-color-overlay-modal)"></div></td>
      </tr>
      <tr id="token-cs-color-overlay-inline">
        <td class="token-name"><code>--cs-color-overlay-inline</code></td>
        <td>Subtle overlay for inline highlights or dimmed regions</td>
        <td><div class="swatch" style="background-color: var(--cs-color-overlay-inline)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

### Shadow

A single color is used for all drop shadows. Use it alongside the [shadow tokens](/tokens/shadows) to construct realistic shadows.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr>
        <th>Custom Property</th>
        <th>Description</th>
        <th>Preview</th>
      </tr>
    </thead>
    <tbody>
      <tr id="token-cs-color-shadow">
        <td class="token-name"><code>--cs-color-shadow</code></td>
        <td>Color used for all component drop shadows</td>
        <td><div class="swatch" style="background-color: var(--cs-color-surface-raised); box-shadow: var(--cs-shadow-l)"></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

### Interactions

These tokens power the consistent hover, active, and focus feedback you see across interactive components. The `--cs-color-focus` token sets the color of the keyboard focus ring. The `--cs-color-mix-hover` and `--cs-color-mix-active` tokens are overlays — they're mixed into a component's background via [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) to subtly shift it on hover and press, so every interactive component reacts consistently without each one defining its own hover/active palette.

<cs-scroller>
  <table class="token-table cs-hover-rows">
    <thead>
      <tr>
        <th>Custom Property</th>
        <th>Description</th>
        <th>Preview</th>
      </tr>
    </thead>
    <tbody>
      <tr id="token-cs-color-focus">
        <td class="token-name"><code>--cs-color-focus</code></td>
        <td>Outline color for keyboard focus rings. Used alongside <a href="/tokens/focus">focus tokens</a>.</td>
        <td><div class="swatch" style="outline: var(--cs-focus-ring)"></div></td>
      </tr>
      <tr id="token-cs-color-mix-hover">
        <td class="token-name"><code>--cs-color-mix-hover</code></td>
        <td>Color blended into a component's fill on hover</td>
        <td><div class="swatch color-mix-example" style="--mix-color: var(--cs-color-mix-hover)"><small>mix</small></div></td>
      </tr>
      <tr id="token-cs-color-mix-active">
        <td class="token-name"><code>--cs-color-mix-active</code></td>
        <td>Color blended into a component's fill on press</td>
        <td><div class="swatch color-mix-example" style="--mix-color: var(--cs-color-mix-active)"><small>mix</small></div></td>
      </tr>
    </tbody>
  </table>
</cs-scroller>

### Semantic Variants

Semantic variants use the `--cs-color-{variant}-{tint}` tokens from your [variant colors](#variant-colors) to power the `variant=""` attribute shared by buttons, badges, callouts, and many other components. Each variant is a complete, self-contained color system defining fills, borders, and on colors at three attention levels. Seven of the eight have them: `link` has a color scale but no attention levels, because it colors hyperlinks rather than backing a `variant=""`.

Tokens follow the format `--cs-color-{variant}-{role}-{attention}`. The three **roles** are:

- **Fill** for backgrounds or areas larger than a few pixels
- **Border** for borders, dividers, and strokes
- **On** for content displayed _on top of_ a fill (pair `on-loud` with `fill-loud`)

The three **attention** levels are `quiet`, `normal`, and `loud` — from least to most visually prominent.

::variant-matrix
