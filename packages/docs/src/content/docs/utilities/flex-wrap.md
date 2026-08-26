---
title: Flex Wrap
description: Flex wrap utilities specify how items within flex containers wrap.
tags: layoutUtilities
synonyms:
  - wrapping
  - flow
  - line wrap
use-cases:
  - responsive wrap
  - multi-line flex
  - flex wrap reverse
  - nowrap
---

<style>
  .preview-wrapper {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 3em;
    max-inline-size: 6em;
    padding: var(--cs-space-2xs);

    counter-reset: item-counter;
  }
  
  .preview-block {
    aspect-ratio: 1 / 1;
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-s);
    min-block-size: 2em;

    display: flex;
    justify-content: center;
    align-items: center;

    &::before {
      counter-increment: item-counter;
      content: counter(item-counter);
      color: var(--cs-color-neutral-on-loud);
    }
  }
</style>

These utility classes control whether the items inside a flex container wrap onto a new line when they run out of horizontal space, and in which direction. Use them to force a [cluster](/utilities/cluster) or [split](/utilities/split) to stay on a single line regardless of width, or to flip the wrap direction so new rows appear above the previous one instead of below.

## Flex Wrap Classes

| Class Name             | `flex-wrap` Value | Preview                                                                                                                                                                           |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cs-flex-wrap`         | `wrap`            | <div class="cs-cluster cs-gap-2xs cs-flex-wrap preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>         |
| `cs-flex-nowrap`       | `nowrap`          | <div class="cs-cluster cs-gap-2xs cs-flex-nowrap preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div>       |
| `cs-flex-wrap-reverse` | `wrap-reverse`    | <div class="cs-cluster cs-gap-2xs cs-flex-wrap-reverse preview-wrapper"><div class="preview-block"></div><div class="preview-block"></div><div class="preview-block"></div></div> |
