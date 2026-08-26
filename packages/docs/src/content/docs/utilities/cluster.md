---
title: Cluster
description: 'Use the `cs-cluster` class to arrange elements inline with even spacing, allowing items to wrap when space is limited.'
tags: layoutUtilities
synonyms:
  - inline group
  - horizontal group
  - tag group
  - flow layout
use-cases:
  - button row
  - tag list
  - chip group
  - inline list
  - pill group
---

<style>
  /* The align-items demos need vertical room for start/end/center/stretch to differ — twice the
     height of a demo box. */
  .align-demo {
    min-block-size: calc(var(--cs-space-4xl) * 2);
  }

  :is(.cs-flank, .cs-grid, .cs-stack) > [class*='cs-cluster']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
    padding: var(--cs-space-s);
  }

  [class*='cs-cluster'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }
</style>

A cluster arranges its children inline with even spacing and wraps them onto a new line whenever the container runs out of room. Reach for it whenever you have a horizontal group of items of varying widths, like tag lists, button rows, inline metadata, or breadcrumb-style trails, and want the layout to stay tidy on every screen size without writing any media queries.

By default, cluster children are centered vertically. Pair `cs-cluster` with a [`cs-gap-*`](/utilities/gap) class to change the spacing and a [`cs-align-items-*`](/utilities/align-items) class to change how items align on the cross axis.

```html {.example}
<div class="cs-cluster">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>

<!-- We'll vary the div sizes to show the flow of cluster elements -->
<style>
  .cs-cluster div:empty:nth-child(3n) {
    min-inline-size: 6rem;
  }
  .cs-cluster div:empty:nth-child(3n + 2) {
    min-inline-size: 8rem;
  }
</style>
```

## Examples

Clusters are great for inline lists and aligning items of varying sizes.

```html {.example}
<div class="cs-cluster">
  <cs-icon name="web"></cs-icon>
  <a href="#">Components</a>
  <a href="#">Layout</a>
  <a href="#">Patterns</a>
  <a href="#">Theming</a>
</div>
```

```html {.example}
<div class="cs-stack">
  <h3 class="cs-heading-2xl">Withywindle Pub and Eatery</h3>
  <div class="cs-cluster cs-gap-xs">
    <cs-rating value="4.6" read-only></cs-rating>
    <strong>4.6</strong>
    <span>(419 reviews)</span>
  </div>
  <div class="cs-cluster cs-gap-xs">
    <div class="cs-cluster cs-gap-3xs">
      <cs-icon name="attach_money" style="color: var(--cs-color-green-60);"></cs-icon>
      <cs-icon name="attach_money" style="color: var(--cs-color-green-60);"></cs-icon>
      <cs-icon name="attach_money" style="color: var(--cs-color-green-60);"></cs-icon>
    </div>
    <span class="cs-caption-s">&bull;</span>
    <cs-tag size="s">Comfort Food</cs-tag>
    <cs-tag size="s">Gastropub</cs-tag>
    <cs-tag size="s">Cocktail Bar</cs-tag>
    <cs-tag size="s">Vegetarian</cs-tag>
    <cs-tag size="s">Gluten Free</cs-tag>
  </div>
</div>
```

## Align Items

By default, items are centered in the block direction of the `cs-cluster` container. Add any [`cs-align-items-*`](/utilities/align-items) class to change how items line up in the block direction.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-align-items-start align-demo">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-cluster cs-align-items-end align-demo">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-cluster cs-align-items-center align-demo">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-cluster cs-align-items-stretch align-demo">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```

## Gap

By default, the gap between cluster items uses `--cs-space-m` from your theme. Add any [`cs-gap-*`](/utilities/gap) class to change the spacing between items.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-gap-2xs">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-cluster cs-gap-2xl">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```
