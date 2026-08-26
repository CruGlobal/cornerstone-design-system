---
title: Color Variants
description: Color utilities allow you to apply the brand, neutral, success, warning, and danger colors from your theme to any element.
tags: styleUtilities
synonyms:
  - text color
  - foreground color
  - colour
  - color utility
  - semantic color
use-cases:
  - brand color
  - status color
  - theme color
  - background color
  - danger color
  - success color
---

Several Cornerstone components (like [`<cs-badge>`](/components/badge), [`<cs-button>`](/components/button), [`<cs-button-group>`](/components/button-group), [`<cs-callout>`](/components/callout), and [`<cs-tag>`](/components/tag)) accept a `variant` attribute to switch between your theme's brand, neutral, success, warning, and danger colors. The color variant utility classes bring that same expressiveness to any element: toggle a brand-colored alert, a warning-styled panel, or a success-tinted badge on your own markup without writing variant-specific CSS for each one.

## Variant Classes

Add one of these classes to any element to apply a semantic color:

| Class Name   | Best For                              |
| ------------ | ------------------------------------- |
| `cs-brand`   | Primary emphasis and brand color      |
| `cs-neutral` | Default, low-emphasis UI              |
| `cs-success` | Positive or confirming states         |
| `cs-warning` | Cautionary states that need attention |
| `cs-danger`  | Errors and destructive actions        |

## How Variants Work

The variant classes don't apply styles directly. Instead, each one points a generic set of color tokens (like `--cs-color-fill-loud` and `--cs-color-on-loud`) at the matching [semantic color](/tokens/color/#semantic-colors) group (`--cs-color-brand-fill-loud`, and so on). That means your own CSS can be written once, using the group-less tokens, and automatically pick up whatever variant is applied. When no variant class is set, the tokens fall back to `neutral`.

Cornerstone's [native styles](/utilities/native/) use this pattern wherever it made sense, which is how a native `<button>` can pick up a `.cs-success` class and just work.

## Custom Class with Variants

Here's a tiny `.callout` class that responds to every color variant without any extra selectors:

```html {.example}
<p class="callout">Neutral</p>
<p class="callout cs-brand">Brand</p>
<p class="callout cs-success">Success</p>
<p class="callout cs-warning">Warning</p>
<p class="callout cs-danger">Danger</p>

<style>
  .callout {
    background-color: var(--cs-color-fill-quiet);
    border: 1px solid var(--cs-color-border-quiet);
    color: var(--cs-color-on-quiet);
    padding: var(--cs-space-m) var(--cs-space-l);
  }
</style>
```
