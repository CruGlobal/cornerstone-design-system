---
title: Comparison
category: Media
synonyms:
  - before after
  - image compare
  - diff slider
use-cases:
  - image diff
  - visual comparison
  - slider comparison
description: "Comparisons show the visual differences between two pieces of similar content using a draggable divider. Use them for before/after images, design revisions, or side-by-side previews."
---

Compare two pieces of content with a divider users can drag across them. It's most often used for before/after images — for best results, the two sides should share the same dimensions. Any content works, though; see the [theme page](/themes) for a full-UI example.

```html {.example .anatomy}
<cs-comparison>
  <img
    slot="before"
    src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80&sat=-100&bri=-5"
    alt="Grayscale version of kittens in a basket looking around."
  />
  <img
    slot="after"
    src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"
    alt="Color version of kittens in a basket looking around."
  />
</cs-comparison>
```

:::info
<strong>The divider is keyboard accessible.</strong><br />
Focus it and use the arrow keys — shift + arrow moves in larger steps, and home / end jump to either end.
:::

## Examples

### Initial Position

Use the `position` attribute to set the initial position of the slider. This is a percentage from `0` to `100`.

```html {.example}
<cs-comparison position="25">
  <img
    slot="before"
    src="https://images.unsplash.com/photo-1520903074185-8eca362b3dce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1200&q=80"
    alt="A person sitting on bricks wearing untied boots."
  />
  <img
    slot="after"
    src="https://images.unsplash.com/photo-1520640023173-50a135e35804?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80"
    alt="A person sitting on a yellow curb tying shoelaces on a boot."
  />
</cs-comparison>
```
