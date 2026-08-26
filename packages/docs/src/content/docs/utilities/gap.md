---
title: Gap
description: Gap utilities set the gap property of flex and grid containers, like other Cornerstone layout utilities.
tags: layoutUtilities
synonyms:
  - spacing
  - gutter
  - margin
  - space between
use-cases:
  - flex gap
  - grid gap
  - element spacing
---

<style>
  .preview-wrapper {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 3em;
    min-inline-size: 5em;
    padding: var(--cs-space-2xs);
  }

  .preview-block {
    aspect-ratio: 1 / 1;
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-s);
    min-block-size: 1em;
  }
</style>

These utility classes set the space between items inside a flex or grid container. Pair them with a layout utility like [cluster](/utilities/cluster), [stack](/utilities/stack), [grid](/utilities/grid), or [split](/utilities/split) to override that layout's default spacing, or apply `cs-gap-*` to any `display: flex` or `display: grid` element of your own to get the same tokens without writing custom CSS.

Every class besides `cs-gap-0` corresponds to one of the [`--cs-space-*`](/tokens/space) tokens in your theme, so the spacing you pick stays in sync with the rest of your design system.

## Gap Classes

| Class Name   | `gap` Value      | Preview                                                                                                                     |
| ------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `cs-gap-0`   | `0`              | <div class="preview-wrapper cs-cluster cs-gap-0"><div class="preview-block"></div><div class="preview-block"></div></div>   |
| `cs-gap-3xs` | `--cs-space-3xs` | <div class="preview-wrapper cs-cluster cs-gap-3xs"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-gap-2xs` | `--cs-space-2xs` | <div class="preview-wrapper cs-cluster cs-gap-2xs"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-gap-xs`  | `--cs-space-xs`  | <div class="preview-wrapper cs-cluster cs-gap-xs"><div class="preview-block"></div><div class="preview-block"></div></div>  |
| `cs-gap-s`   | `--cs-space-s`   | <div class="preview-wrapper cs-cluster cs-gap-s"><div class="preview-block"></div><div class="preview-block"></div></div>   |
| `cs-gap-m`   | `--cs-space-m`   | <div class="preview-wrapper cs-cluster cs-gap-m"><div class="preview-block"></div><div class="preview-block"></div></div>   |
| `cs-gap-l`   | `--cs-space-l`   | <div class="preview-wrapper cs-cluster cs-gap-l"><div class="preview-block"></div><div class="preview-block"></div></div>   |
| `cs-gap-xl`  | `--cs-space-xl`  | <div class="preview-wrapper cs-cluster cs-gap-xl"><div class="preview-block"></div><div class="preview-block"></div></div>  |
| `cs-gap-2xl` | `--cs-space-2xl` | <div class="preview-wrapper cs-cluster cs-gap-2xl"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-gap-3xl` | `--cs-space-3xl` | <div class="preview-wrapper cs-cluster cs-gap-3xl"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-gap-4xl` | `--cs-space-4xl` | <div class="preview-wrapper cs-cluster cs-gap-4xl"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-gap-5xl` | `--cs-space-5xl` | <div class="preview-wrapper cs-cluster cs-gap-5xl"><div class="preview-block"></div><div class="preview-block"></div></div> |
