---
title: Stack
description: 'Use `cs-stack` to arrange elements in the block direction with even spacing.'
tags: layoutUtilities
synonyms:
  - vertical stack
  - vstack
  - column layout
use-cases:
  - vertical spacing
  - stacked layout
  - card stack
  - vertical rhythm
---

<style>
  :is(.cs-flank, .cs-grid, .cs-stack) > [class*='cs-stack']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
    padding: var(--cs-space-s);
  }

  [class*='cs-stack'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }

  /* The align-items demos need children of differing width for the difference to be visible.
     These must come *after* the `div:empty` default above: `:empty` is a pseudo-class, so
     `div:empty` and `div.demo-w-1` are both 0,2,1 and the tie is broken by source order. The inline
     styles these replaced won automatically; a class has to be placed deliberately. */
  [class*='cs-stack'] div.demo-w-1 {
    min-inline-size: var(--cs-space-4xl);
  }

  [class*='cs-stack'] div.demo-w-2 {
    min-inline-size: calc(var(--cs-space-4xl) * 1.5);
  }

  [class*='cs-stack'] div.demo-w-3 {
    min-inline-size: calc(var(--cs-space-4xl) * 2);
  }
</style>

A stack arranges its children in a vertical column with an equal gap between each item, so you don't have to add top or bottom margins to every element you put into it. It's the go-to layout for forms, paragraphs of text, card bodies, and anywhere you want consistent vertical rhythm.

By default, items stretch to fill the stack's width. Pair `cs-stack` with a [`cs-gap-*`](/utilities/gap) class to control the spacing and a [`cs-align-items-*`](/utilities/align-items) class to change how children line up horizontally.

```html {.example}
<div class="cs-stack">
  <div></div>
  <div></div>
  <div></div>
</div>
```

## Examples

Stacks are well suited for forms, text, and ensuring consistent spacing between elements in the document flow.

```html {.example}
<div class="cs-stack">
  <cs-input label="Email">
    <cs-icon slot="start" name="mail"></cs-icon>
  </cs-input>
  <cs-input label="Password" type="password">
    <cs-icon slot="start" name="lock"></cs-icon>
  </cs-input>
  <cs-checkbox>Remember me on this device</cs-checkbox>
  <cs-button appearance="filled">Log In</cs-button>
</div>
```

```html {.example}
<div class="cs-stack cs-gap-2xl">
  <h3>Aragorn's Squash</h3>
  <p>
    Altogether unleash weasel mainly well-protected hiding Farthing excuse. Falling pits oil em Hasufel levels weight
    rides vagabonds? Gamgee hard-won thunder merrier forests treasury. Past birthday lasts lowly there'd woe Woodland pa
    sun's slaying most handling.
  </p>
  <p>
    Even the smallest person can change the course of the future. They tempted completely other caves cloven wisest
    draught scrumptious cook Undómiel friends. Dory crunchy huge sleepless. Unmade took nerves liquor defeated Arathorn.
  </p>
</div>
```

## Align Items

By default, items stretch to fill the inline size of the `cs-stack` container. Add any [`cs-align-items-*`](/utilities/align-items) class to change how items line up in the inline direction.

```html {.example}
<div class="cs-grid">
  <div class="cs-stack cs-align-items-start">
    <div class="demo-w-1"></div>
    <div class="demo-w-3"></div>
    <div class="demo-w-2"></div>
  </div>
  <div class="cs-stack cs-align-items-center">
    <div class="demo-w-1"></div>
    <div class="demo-w-3"></div>
    <div class="demo-w-2"></div>
  </div>
  <div class="cs-stack cs-align-items-end">
    <div class="demo-w-1"></div>
    <div class="demo-w-3"></div>
    <div class="demo-w-2"></div>
  </div>
</div>
```

## Gap

By default, the gap between stack items uses `--cs-space-m` from your theme. Add any [`cs-gap-*`](/utilities/gap) class to change the spacing between items.

```html {.example}
<div class="cs-grid">
  <div class="cs-stack cs-gap-2xs">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="cs-stack cs-gap-2xl">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
```
