---
title: Frame
description: 'Use the `cs-frame` class to create a responsive container with consistent proportions to enclose content.'
tags: layoutUtilities
synonyms:
  - aspect ratio
  - media frame
  - ratio box
use-cases:
  - video frame
  - image container
  - responsive embed
---

<style>
  [class*='cs-frame']:has(div:empty) {
    border: var(--cs-border-width-s) dashed var(--cs-color-neutral-border-normal);
    padding: var(--cs-space-s);
  }

  [class*='cs-frame'] div:empty {
    background-color: var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-m);
    min-block-size: 4rem;
    min-inline-size: 4rem;
  }
</style>

A frame is a box that keeps a fixed shape no matter how big or small it gets. Wrap an image, video, map, or placeholder in `cs-frame` and it stays a square by default, or a landscape, portrait, or any custom aspect ratio you specify, even as the surrounding layout resizes. That means no more letterboxing, no more collapsed boxes waiting on a slow image to load, and no more cards that end up different heights.

Pair `cs-frame` with one of the [`cs-border-radius-*`](/utilities/rounding) classes to round the corners without cropping the content inside.

```html {.example}
<div class="cs-frame" style="max-inline-size: 20rem;">
  <div></div>
</div>
```

## Examples

Frames are well-suited for images and image placeholders.

```html {.example}
<div class="cs-flank" style="--flank-size: 8rem;">
  <div class="cs-frame cs-border-radius-m">
    <img src="https://images.unsplash.com/photo-1523593288094-3ccfb6b2c192?q=20" alt="" />
  </div>
  <div class="cs-flank:end" style="--content-percentage: 70%">
    <div class="cs-stack cs-gap-xs">
      <h3>The Lord of the Rings: The Fellowship of the Ring</h3>
      <span>J.R.R. Tolkien</span>
    </div>
    <cs-button id="options-menu" appearance="plain">
      <cs-icon name="more_horiz" label="Options"></cs-icon>
    </cs-button>
    <cs-tooltip for="options-menu">Options</cs-tooltip>
  </div>
</div>
```

```html {.example}
<div class="cs-grid" style="--min-column-size: 25ch;">
  <cs-card>
    <div class="cs-frame:landscape" slot="media">
      <img src="https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=20" alt="Grey and white tabby kitten" />
    </div>
    <div class="cs-stack cs-gap-xs">
      <h3 class="cs-heading-m">White-socks</h3>
      <span class="cs-body-s">Kitten &bull; Male</span>
      <div class="cs-flank:end cs-gap-xs">
        <cs-button size="s" appearance="filled" variant="brand">Adopt this pet</cs-button>
        <cs-button id="fav-whitesocks" appearance="plain" size="s">
          <cs-icon name="favorite" label="Favorite"></cs-icon>
        </cs-button>
        <cs-tooltip for="fav-whitesocks">Favorite</cs-tooltip>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-frame:landscape" slot="header">
      <div class="cs-stack cs-align-items-center cs-gap-xs cs-caption-s">
        <cs-icon name="pets" variant="fill"></cs-icon>
        <span>Photo coming soon</span>
      </div>
    </div>
    <div class="cs-stack cs-gap-xs">
      <h3 class="cs-heading-m">Bumpkin</h3>
      <span class="cs-body-s">Adult &bull; Male</span>
      <div class="cs-flank:end cs-gap-xs">
        <cs-button size="s" appearance="filled" variant="brand">Adopt this pet</cs-button>
        <cs-button id="fav-bumpkin" appearance="plain" size="s">
          <cs-icon name="favorite" label="Favorite"></cs-icon>
        </cs-button>
        <cs-tooltip for="fav-bumpkin">Favorite</cs-tooltip>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-frame:landscape" slot="media">
      <img src="https://images.unsplash.com/photo-1445499348736-29b6cdfc03b9?q=20" alt="Diluted calico kitten" />
    </div>
    <div class="cs-stack cs-gap-xs">
      <h3 class="cs-heading-m">Swish-tail</h3>
      <span class="cs-body-s">Kitten &bull; Female</span>
      <div class="cs-flank:end cs-gap-xs">
        <cs-button size="s" appearance="filled" variant="brand">Adopt this pet</cs-button>
        <cs-button id="fav-swishtail" appearance="plain" size="s">
          <cs-icon name="favorite" label="Favorite"></cs-icon>
        </cs-button>
        <cs-tooltip for="fav-swishtail">Favorite</cs-tooltip>
      </div>
    </div>
  </cs-card>
  <cs-card>
    <div class="cs-frame:landscape" slot="media">
      <img src="https://images.unsplash.com/photo-1517451330947-7809dead78d5?q=20" alt="Short-haired tabby cat" />
    </div>
    <div class="cs-stack cs-gap-xs">
      <h3 class="cs-heading-m">Sharp-ears</h3>
      <span class="cs-body-s">Adult &bull; Female</span>
      <div class="cs-flank:end cs-gap-xs">
        <cs-button size="s" appearance="filled" variant="brand">Adopt this pet</cs-button>
        <cs-button id="fav-sharpears" appearance="plain" size="s">
          <cs-icon name="favorite" label="Favorite"></cs-icon>
        </cs-button>
        <cs-tooltip for="fav-sharpears">Favorite</cs-tooltip>
      </div>
    </div>
  </cs-card>
</div>
```

## Aspect Ratio

Frames have a square aspect ratio by default. You can append `:square` (1 / 1), `:landscape` (16 / 9), or `:portrait` (9 / 16) to the `cs-frame` class in your markup to specify an aspect ratio for the frame. Alternatively, you can define the `aspect-ratio` property to set a custom proportion.

```html {.example}
<div class="cs-grid">
  <div class="cs-frame:landscape">
    <div></div>
  </div>
  <div class="cs-frame:portrait">
    <div></div>
  </div>
  <div class="cs-frame" style="aspect-ratio: 4 / 3;">
    <div></div>
  </div>
</div>
```

## Border Radius

Frames have a square border radius by default. Add any [`cs-border-radius-*`](/utilities/rounding) class to round the corners, or define the `border-radius` property to set custom rounding.

```html {.example}
<div class="cs-grid">
  <div class="cs-frame cs-border-radius-l">
    <div></div>
  </div>
  <div class="cs-frame cs-border-radius-circle">
    <div></div>
  </div>
  <div class="cs-frame" style="border-radius: 50% 0%;">
    <div></div>
  </div>
</div>
```
