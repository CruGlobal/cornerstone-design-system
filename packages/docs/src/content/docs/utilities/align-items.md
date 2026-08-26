---
title: Align Items
description: Control cross-axis alignment in flex and grid containers with align-items and align-self utility classes.
tags: layoutUtilities
synonyms:
  - vertical align
  - cross axis
  - align
use-cases:
  - flex align
  - grid align
  - center vertically
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

These utility classes control how flex and grid items line up across the container's [cross axis](#whats-the-cross-axis), which is the axis perpendicular to the one its children flow along. Reach for them any time the default alignment of a [cluster](/utilities/cluster), [stack](/utilities/stack), [flank](/utilities/flank), [split](/utilities/split), or [grid](/utilities/grid) doesn't match what you're after: centering icons next to text, making all cards in a row share the same height, or pinning form labels to the top of each row.

| Class Name                | `align-items` Value | Preview                                                                                                                                             |
| ------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cs-align-items-baseline` | `baseline`          | <div class="cs-cluster cs-gap-2xs cs-align-items-baseline preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-align-items-center`   | `center`            | <div class="cs-cluster cs-gap-2xs cs-align-items-center preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>   |
| `cs-align-items-end`      | `flex-end`          | <div class="cs-cluster cs-gap-2xs cs-align-items-end preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>      |
| `cs-align-items-start`    | `flex-start`        | <div class="cs-cluster cs-gap-2xs cs-align-items-start preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>    |
| `cs-align-items-stretch`  | `stretch`           | <div class="cs-cluster cs-gap-2xs cs-align-items-stretch preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>  |

## Override with Align Self

When you need a flex or grid item to deviate from the `align-items` property of its container, use the `cs-align-self-*` classes to set the item's `align-self` property and individually change its alignment on the container's [cross axis](#whats-the-cross-axis).

| Class Name               | `align-self` Value | Preview                                                                                                                                            |
| ------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cs-align-self-center`   | `center`           | <div class="cs-cluster cs-gap-2xs preview-wrapper"><div class="preview-block de-emphasize"></div><div class="preview-block cs-align-self-center"></div><div class="preview-block de-emphasize"></div></div>   |
| `cs-align-self-baseline` | `baseline`         | <div class="cs-cluster cs-gap-2xs preview-wrapper"><div class="preview-block de-emphasize"></div><div class="preview-block cs-align-self-baseline"></div><div class="preview-block de-emphasize"></div></div> |
| `cs-align-self-end`      | `flex-end`         | <div class="cs-cluster cs-gap-2xs preview-wrapper"><div class="preview-block de-emphasize"></div><div class="preview-block cs-align-self-end"></div><div class="preview-block de-emphasize"></div></div>      |
| `cs-align-self-start`    | `flex-start`       | <div class="cs-cluster cs-gap-2xs preview-wrapper"><div class="preview-block de-emphasize"></div><div class="preview-block cs-align-self-start"></div><div class="preview-block de-emphasize"></div></div>    |
| `cs-align-self-stretch`  | `stretch`          | <div class="cs-cluster cs-gap-2xs preview-wrapper"><div class="preview-block de-emphasize"></div><div class="preview-block cs-align-self-stretch"></div><div class="preview-block de-emphasize"></div></div>  |

## What's the Cross Axis?

The cross axis runs perpendicular to a container's content direction. For containers where `flex-direction` is `row` and content flows in the inline direction, the cross axis runs in the block direction. For containers where `flex-direction` is `column` and content flows in the block direction, the cross axis runs in the inline direction.
