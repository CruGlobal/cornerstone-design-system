---
title: Rounding Utilities
description: Border radius utilities set an element's border radius property.
tags: styleUtilities
synonyms:
  - border radius
  - rounded corners
  - pill shape
use-cases:
  - rounded
  - circle
  - pill button
---

<style>
  .preview-block {
    background-color: var(--cs-color-neutral-fill-loud);
    min-block-size: 2em;
  }
</style>

These utility classes round the corners of any element using the radius tokens from your theme, so buttons, cards, images, and custom components can all share the same corner style without hard-coded values. Common uses include rounding an image inside a [frame](/utilities/frame), shaping an avatar into a circle, or giving a tag a pill silhouette.

Each class corresponds to one of the [`--cs-border-radius-*`](/tokens/borders/#radius) tokens in your theme, so the corner style you pick automatically updates if you adjust your theme's rounding scale.

## Rounding Classes

| Class Name                | `border-radius` Value       | Preview                                                                                 |
| ------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `cs-border-radius-s`      | `--cs-border-radius-s`      | <div class="preview-block" style="border-radius: var(--cs-border-radius-s)"></div>      |
| `cs-border-radius-m`      | `--cs-border-radius-m`      | <div class="preview-block" style="border-radius: var(--cs-border-radius-m)"></div>      |
| `cs-border-radius-l`      | `--cs-border-radius-l`      | <div class="preview-block" style="border-radius: var(--cs-border-radius-l)"></div>      |
| `cs-border-radius-pill`   | `--cs-border-radius-pill`   | <div class="preview-block" style="border-radius: var(--cs-border-radius-pill)"></div>   |
| `cs-border-radius-circle` | `--cs-border-radius-circle` | <div class="preview-block" style="border-radius: var(--cs-border-radius-circle)"></div> |
| `cs-border-radius-square` | `--cs-border-radius-square` | <div class="preview-block" style="border-radius: var(--cs-border-radius-square)"></div> |
