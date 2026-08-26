---
title: Justify Content
description: Justify content utilities determine how space is distributed between items in flex and grid containers.
tags: layoutUtilities
synonyms:
  - horizontal align
  - main axis
  - distribute
use-cases:
  - flex justify
  - space between
  - center horizontally
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

These utility classes control how space is distributed between items along a flex or grid container's [main axis](#whats-the-main-axis), which is the axis its children flow along. Reach for them when you want to push items to one end of a [cluster](/utilities/cluster) or [stack](/utilities/stack), center a row of buttons, or spread a set of navigation links evenly across a header.

| Class Name                         | `justify-content` Value | Preview                                                                                                                                                      |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cs-justify-content-start`         | `flex-start`            | <div class="cs-cluster cs-gap-2xs cs-justify-content-start preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div>         |
| `cs-justify-content-end`           | `flex-end`              | <div class="cs-cluster cs-gap-2xs cs-justify-content-end preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div>           |
| `cs-justify-content-center`        | `center`                | <div class="cs-cluster cs-gap-2xs cs-justify-content-center preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div>        |
| `cs-justify-content-space-around`  | `space-around`          | <div class="cs-cluster cs-gap-2xs cs-justify-content-space-around preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div>  |
| `cs-justify-content-space-between` | `space-between`         | <div class="cs-cluster cs-gap-2xs cs-justify-content-space-between preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div> |
| `cs-justify-content-space-evenly`  | `space-evenly`          | <div class="cs-cluster cs-gap-2xs cs-justify-content-space-evenly preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div></div>  |

## What's the Main Axis?

The main axis runs parallel to a container's content direction. For grid containers and flex containers where `flex-direction` is `row`, the main axis runs in the inline direction. For containers where `flex-direction` is `column`, the main axis runs in the block direction.
