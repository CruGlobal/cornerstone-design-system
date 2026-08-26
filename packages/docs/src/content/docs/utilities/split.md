---
title: Split
description: 'Use the `cs-split` class to distribute two or more items evenly across available space, either in a row or a column.'
tags: layoutUtilities
synonyms:
  - holy grail
  - sidebar layout
  - main aside
use-cases:
  - two column
  - content sidebar
  - layout split
---

<style>
  /* Vertical room for the align-items demos to differ — twice a demo box, and four times for the
     taller flank example. */
  .align-demo {
    min-block-size: calc(var(--cs-space-4xl) * 2);
  }

  .tall-demo {
    block-size: calc(var(--cs-space-4xl) * 4);
  }

  :is(.cs-flank, .cs-grid, .cs-stack) > [class*='cs-split']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
    padding: var(--cs-space-s);
  }

  [class*='cs-split'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }
</style>

A split pushes its children to opposite ends of the container, filling the space between them. It's what you want whenever you need a logo on one side and navigation on the other, a section heading paired with an action button, or a list item whose label and value sit at opposite ends of the row. Any number of children work: the first one hugs the start, the last one hugs the end, and anything in between is evenly distributed.

By default a split runs horizontally; append `:column` to stack items vertically instead. When the container gets too narrow for everything to fit on one row, the items wrap automatically.

```html {.example}
<div class="cs-split">
  <div></div>
  <div></div>
</div>
```

## Examples

Splits are especially helpful for navigation, header, and footer layouts.

```html {.example}
<div class="cs-flank">
  <div class="cs-split:column">
    <div class="cs-stack">
      <cs-button appearance="plain">
        <cs-icon name="home" label="Home"></cs-icon>
      </cs-button>
      <cs-button appearance="plain">
        <cs-icon name="calendar_today" label="Calendar"></cs-icon>
      </cs-button>
      <cs-button appearance="plain">
        <cs-icon name="mail" label="Mail"></cs-icon>
      </cs-button>
    </div>
    <div class="cs-stack">
      <cs-divider></cs-divider>
      <cs-button appearance="plain">
        <cs-icon name="logout" label="Sign Out"></cs-icon>
      </cs-button>
    </div>
  </div>
  <div class="placeholder"></div>
</div>

<style>
  .placeholder {
    min-block-size: 300px;
    background-color: var(--cs-color-neutral-fill-quiet);
    border: dashed var(--cs-border-width-s) var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
  }
</style>
```

```html {.example}
<div class="cs-stack">
  <div class="cs-split">
    <cs-icon name="web" label="Cornerstone" class="cs-font-size-xl"></cs-icon>
    <div class="cs-cluster">
      <cs-button appearance="filled">Sign Up</cs-button>
      <cs-button appearance="outlined">Log In</cs-button>
    </div>
  </div>
  <div class="placeholder"></div>
</div>

<style>
  .placeholder {
    min-block-size: 300px;
    background-color: var(--cs-color-neutral-fill-quiet);
    border: dashed var(--cs-border-width-s) var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
  }
</style>
```

## Direction

Items can be split across a row or a column by appending `:row` or `:column` to the `cs-split` class.

```html {.example}
<div class="cs-flank cs-align-items-start tall-demo">
  <div class="cs-split:column">
    <div></div>
    <div></div>
  </div>
  <div class="cs-split:row">
    <div></div>
    <div></div>
  </div>
</div>
```

## Align Items

By default, items are centered on the cross axis of the `cs-split` container. Add any [`cs-align-items-*`](/utilities/align-items) class to change how items line up: in the block direction for `cs-split:row` and in the inline direction for `cs-split:column`.

```html {.example}
<div class="cs-stack">
  <div class="cs-split cs-align-items-start align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-split cs-align-items-end align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-split cs-align-items-center align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-split cs-align-items-stretch align-demo">
    <div></div>
    <div></div>
  </div>
</div>
```

## Gap

A split's gap determines how close items can be before they wrap. By default, the gap between split items uses `--cs-space-m` from your theme. Add any [`cs-gap-*`](/utilities/gap) class to change the spacing between items.

```html {.example}
<div class="cs-stack">
  <div class="cs-split cs-gap-3xs">
    <div></div>
    <div></div>
  </div>
  <div class="cs-split cs-gap-3xl">
    <div></div>
    <div></div>
  </div>
</div>
```
