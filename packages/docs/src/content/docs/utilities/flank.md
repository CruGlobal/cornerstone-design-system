---
title: Flank
description: 'Use the `cs-flank` class to position two items side-by-side, with one item positioned alongside, or _flanking_, content that stretches to fill the available space.'
tags: layoutUtilities
synonyms:
  - media object
  - side by side
  - horizontal layout
use-cases:
  - icon and text
  - image and content
  - avatar with text
---

<style>
  /* The align-items demos need vertical room for start/end/center/stretch to differ — twice the
     height of a demo box. */
  .align-demo {
    min-block-size: calc(var(--cs-space-4xl) * 2);
  }

  :is(.cs-flank, .cs-grid, .cs-stack) > [class*='cs-flank']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    border-radius: var(--cs-border-radius-l);
    padding: var(--cs-space-s);
  }

  [class*='cs-flank'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }
</style>

A flank pairs two items side by side, where one item (the "flank") sits at its natural size while the other stretches to fill the remaining space. It's the right fit for any "small thing next to a larger thing" pattern: an avatar next to a name and bio, an icon beside a paragraph of text, an input followed by a submit button, or a sidebar alongside page content.

By default the first child is the flank, but you can pick either end with `cs-flank:start` or `cs-flank:end`. When the main content gets too narrow, the two items wrap onto separate lines automatically.

```html {.example}
<div class="cs-flank">
  <div></div>
  <div></div>
</div>
```

## Examples

Flanks work especially well for asides, inputs with adjacent buttons, and rich description lists.

```html {.example}
<div class="cs-flank:end cs-gap-xs">
  <cs-input>
    <cs-icon slot="start" name="search"></cs-icon>
  </cs-input>
  <cs-button appearance="filled">Search</cs-button>
</div>
```

```html {.example}
<div class="cs-stack cs-gap-xl">
  <div class="cs-flank cs-align-items-start">
    <cs-avatar
      image="https://images.unsplash.com/photo-1553284966-19b8815c7817?q=20"
      label="Gandalf's avatar"
    ></cs-avatar>
    <div class="cs-stack cs-gap-3xs">
      <strong>Gandalf</strong>
      <p class="cs-body-s">
        All we have to decide is what to do with the time that is given to us. There are other forces at work in this
        world, Frodo, besides the will of evil.
      </p>
    </div>
  </div>
  <div class="cs-flank cs-align-items-start">
    <cs-avatar
      image="https://images.unsplash.com/photo-1542403764-c26462c4697e?q=20"
      label="Boromir's avatar"
    ></cs-avatar>
    <div class="cs-stack cs-gap-3xs">
      <strong>Boromir</strong>
      <p class="cs-body-s">
        One does not simply walk into Mordor. Its Black Gates are guarded by more than just Orcs. There is evil there
        that does not sleep, and the Great Eye is ever watchful.
      </p>
    </div>
  </div>
  <div class="cs-flank cs-align-items-start">
    <cs-avatar
      image="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=20"
      label="Galadriel's avatar"
    ></cs-avatar>
    <div class="cs-stack cs-gap-3xs">
      <strong>Galadriel</strong>
      <p class="cs-body-s">
        The world is changed. I feel it in the water. I feel it in the earth. I smell it in the air. Much that once was
        is lost, for none now live who remember it.
      </p>
    </div>
  </div>
</div>
```

## Position

By default, the first item in the `cs-flank` container will flank the other content. You can specify whether the first or last item will flank the remaining content by appending `:start` or `:end` to the `cs-flank` class.

```html {.example}
<div class="cs-stack">
  <div class="cs-flank:start">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank:end">
    <div></div>
    <div></div>
  </div>
</div>
```

## Size

The flank's inline size is determined by the size of its content, but you can set a target size using the `--flank-size` custom property. When the flank wraps, it stretches to fill the inline size of the container.

```html {.example}
<div class="cs-stack">
  <div class="cs-flank" style="--flank-size: 200px;">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank" style="--flank-size: 6rem;">
    <div></div>
    <div></div>
  </div>
</div>
```

The main content fills the remaining inline space of the container. By default, the items wrap when the main content is less than 50% of the container. You can change the minimum size of the main content with the `--content-percentage` custom property.

```html {.example}
<div class="cs-stack">
  <div class="cs-flank" style="--content-percentage: 70%;">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank" style="--content-percentage: 85%;">
    <div></div>
    <div></div>
  </div>
</div>
```

## Align Items

By default, items are centered in the block direction of the `cs-flank` container. Add any [`cs-align-items-*`](/utilities/align-items) class to change how items line up in the block direction.

```html {.example}
<div class="cs-stack">
  <div class="cs-flank cs-align-items-start align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank cs-align-items-end align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank cs-align-items-center align-demo">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank cs-align-items-stretch align-demo">
    <div></div>
    <div></div>
  </div>
</div>
```

## Gap

By default, the gap between flank items uses `--cs-space-m` from your theme. Add any [`cs-gap-*`](/utilities/gap) class to change the spacing between items.

```html {.example}
<div class="cs-stack">
  <div class="cs-flank cs-gap-2xs">
    <div></div>
    <div></div>
  </div>
  <div class="cs-flank cs-gap-2xl">
    <div></div>
    <div></div>
  </div>
</div>
```
