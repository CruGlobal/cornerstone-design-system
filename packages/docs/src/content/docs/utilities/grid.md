---
title: Grid
description: 'Use the `cs-grid` class to arrange elements into rows and columns that automatically adapt to the available space.'
tags: layoutUtilities
synonyms:
  - columns
  - layout grid
  - css grid
use-cases:
  - responsive grid
  - card grid
  - auto grid
  - masonry
---

<style>
  :is(.cs-flank, .cs-grid, .cs-stack) > [class*='cs-grid']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
    padding: var(--cs-space-s);
  }

  [class*='cs-grid'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }
</style>

A grid places its children in evenly-sized columns that shrink, grow, and reflow as the container resizes, without any breakpoints to manage. Drop any number of items into `cs-grid` and the utility figures out how many fit on each row based on the container's width and the minimum column size you've asked for. It's the quickest way to build card galleries, product listings, dashboards, and any content that should adapt from one column on a phone to several on a desktop.

Set `--min-column-size` to change the threshold at which items start to wrap, pair `cs-grid` with a [`cs-gap-*`](/utilities/gap) class to adjust the spacing between cells, or add `cs-span-grid` to an individual item to make it span every column.

```html {.example}
<div class="cs-grid">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
```

## Examples

Grids work especially well for card lists and content designed for browsing.

```html {.example}
<div class="cs-grid">
  <div class="cs-stack cs-gap-s">
    <div class="cs-frame cs-border-radius-l">
      <img src="https://images.unsplash.com/photo-1520763185298-1b434c919102?q=20" alt="" />
    </div>
    <h3 class="cs-heading-m">Tulip</h3>
    <em>Tulipa gesneriana</em>
  </div>
  <div class="cs-stack cs-gap-s">
    <div class="cs-frame cs-border-radius-l">
      <img src="https://images.unsplash.com/photo-1591767134492-338e62f7b5a2?q=20" alt="" />
    </div>
    <h3 class="cs-heading-m">Peony</h3>
    <em>Paeonia officinalis</em>
  </div>
  <div class="cs-stack cs-gap-s">
    <div class="cs-frame cs-border-radius-l">
      <img src="https://images.unsplash.com/photo-1590872000386-4348c6393115?q=20" alt="" />
    </div>
    <h3 class="cs-heading-m">Poppy</h3>
    <em>Papaver rhoeas</em>
  </div>
  <div class="cs-stack cs-gap-s">
    <div class="cs-frame cs-border-radius-l">
      <img src="https://images.unsplash.com/photo-1516723338795-324c7c33f700?q=20" alt="" />
    </div>
    <h3 class="cs-heading-m">Sunflower</h3>
    <em>Helianthus annuus</em>
  </div>
  <div class="cs-stack cs-gap-s">
    <div class="cs-frame cs-border-radius-l">
      <img src="https://images.unsplash.com/photo-1563601841845-74a0a8ab7c8a?q=20" alt="" />
    </div>
    <h3 class="cs-heading-m">Daisy</h3>
    <em>Bellis perennis</em>
  </div>
</div>
```

```html {.example}
<div class="cs-grid" style="--min-column-size: 30ch;">
  <cs-card>
    <div class="cs-flank">
      <cs-avatar shape="rounded">
        <cs-icon slot="icon" name="public"></cs-icon>
      </cs-avatar>
      <div class="cs-stack cs-gap-3xs">
        <span class="cs-caption-xs">Population (Zion)</span>
        <span class="cs-cluster cs-gap-xs">
          <span class="cs-heading-2xl">251,999</span>
          <cs-badge variant="danger">-3%&nbsp;<cs-icon name="trending_down"></cs-icon></cs-badge>
        </span>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-flank">
      <cs-avatar shape="rounded">
        <cs-icon slot="icon" name="memory"></cs-icon>
      </cs-avatar>
      <div class="cs-stack cs-gap-3xs">
        <span class="cs-caption-xs">Minds Freed</span>
        <span class="cs-cluster cs-gap-xs">
          <span class="cs-heading-2xl">0.36%</span>
          <cs-badge variant="success">+0.03%&nbsp;<cs-icon name="trending_up"></cs-icon></cs-badge>
        </span>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-flank">
      <cs-avatar shape="rounded">
        <cs-icon slot="icon" name="smart_toy"></cs-icon>
      </cs-avatar>
      <div class="cs-stack cs-gap-3xs">
        <span class="cs-caption-xs">Agents Discovered</span>
        <span class="cs-cluster cs-gap-xs">
          <span class="cs-heading-2xl">3</span>
          <cs-badge variant="neutral">±0%&nbsp;<cs-icon name="remove"></cs-icon></cs-badge>
        </span>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-flank">
      <cs-avatar shape="rounded">
        <cs-icon slot="icon" name="raven"></cs-icon>
      </cs-avatar>
      <div class="cs-stack cs-gap-3xs">
        <span class="cs-caption-xs">Sentinels Controlled</span>
        <span class="cs-cluster cs-gap-xs">
          <span class="cs-heading-2xl">208</span>
          <cs-badge variant="success">+1%&nbsp;<cs-icon name="trending_up"></cs-icon></cs-badge>
        </span>
      </div>
    </div>
  </cs-card>
</div>

<style>
  cs-badge > cs-icon {
    color: color-mix(in oklab, currentColor, transparent 40%);
  }
</style>
```

## Size

By default, grid items will wrap when the grid's column size is less than `20ch`, but you can set a custom minimum column size using the `--min-column-size` custom property.

```html {.example}
<div class="cs-stack">
  <div class="cs-grid" style="--min-column-size: 200px;">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-grid" style="--min-column-size: 6rem;">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```

## Gap

By default, the gap between grid items uses `--cs-space-m` from your theme. Add any [`cs-gap-*`](/utilities/gap) class to change the spacing between cells.

```html {.example}
<div class="cs-stack">
  <div class="cs-grid cs-gap-2xs">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-grid cs-gap-2xl">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```

## Span Grid

You can add `cs-span-grid` to any grid item to allow it to span all grid columns. With this, the grid item occupies its own grid row.

```html {.example}
<div class="cs-grid">
  <div></div>
  <div></div>
  <div class="cs-span-grid"></div>
  <div></div>
  <div></div>
</div>
```
