---
title: Card
category: Layout
synonyms:
  - tile
  - panel
  - content box
  - surface
use-cases:
  - product card
  - info card
  - media card
  - feature card
description: "Cards group related content and actions inside a bordered container. Use them to present products, articles, user profiles, or any self-contained unit of information."
---

```html {.example}
<cs-card class="card-overview">
  <img
    slot="media"
    src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
    alt="A kitten sits patiently between a terracotta pot and decorative grasses."
  />

  <strong>Mittens</strong><br />
  This kitten is as cute as he is playful. Bring him home today!<br />
  <small class="cs-caption-s">6 weeks old</small>

  <cs-button slot="footer" variant="brand" pill>More Info</cs-button>
  <cs-rating slot="footer-actions" label="Rating"></cs-rating>
</cs-card>

<style>
  .card-overview {
    width: 300px;
  }
</style>
```

```html {.example .anatomy-only}
<cs-card>
  <img
    slot="media"
    src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
    alt="A kitten between a terracotta pot and decorative grasses."
  />
  <strong slot="header">Mittens</strong>
  This kitten is as cute as he is playful. Bring him home today!
  <cs-button slot="footer" variant="brand" pill>More Info</cs-button>
  <cs-button slot="actions" variant="neutral" appearance="plain">
    <cs-icon name="more_horiz" label="Actions"></cs-icon>
  </cs-button>
</cs-card>
```

## Examples

### Basic Card

A card can hold any content. Media, a header, and a footer are all optional.

```html {.example}
<cs-card class="card-basic">
  This is just a basic card. No media, no header, and no footer. Just your content.
</cs-card>

<style>
  .card-basic {
    max-width: 300px;
  }
</style>
```

### Header

Headers can be used to display titles and more.
If using SSR, you need to also use the `has-header` attribute to add a header to the card (if not, it is added automatically).

```html {.example}
<cs-card class="card-header">
  <h3 slot="header">Header Title</h3>
  This card has a header. You can put all sorts of things in it!
  <cs-button appearance="plain" slot="header-actions">
    <cs-icon name="settings" label="Settings"></cs-icon>
  </cs-button>
</cs-card>

<style>
  .card-header {
    max-width: 300px;
  }

  .card-header h3 {
    margin: 0;
  }
</style>
```

### Footer

Footers can be used to display actions, summaries, or other relevant content.
If using SSR, you need to also use the `has-footer` attribute to add a footer to the card (if not, it is added automatically).

```html {.example}
<cs-card class="card-footer">
  This card has a footer. You can put all sorts of things in it!

  <cs-rating slot="footer"></cs-rating>

  <cs-button slot="footer-actions" variant="brand">Preview</cs-button>
</cs-card>

<style>
  .card-footer {
    max-width: 300px;
  }
</style>
```

### Media

Card media is displayed atop the card and will stretch to fit.
If using SSR, you need to also use the `has-media` attribute to add a media section to the card (if not, it is added automatically).

```html {.example}
<div class="cs-grid">
  <cs-card class="card-media">
    <div slot="media" class="cs-frame:landscape">
      <img
        src="https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=80"
        alt="A kitten walks towards camera on top of pallet."
      />
    </div>
    This card has an image of a kitten walking along a pallet.
  </cs-card>
  <cs-card class="card-media">
    <video slot="media" controls>
      <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
      <p>Your browser doesn't support HTML video</p>
    </video>
    This card has a video of a dog wearing shades.
  </cs-card>
</div>

<style>
  .card-media {
    max-width: 300px;
  }
</style>
```

### Appearance

Use the `appearance` attribute to change the card's visual appearance.

```html {.example}
<div class="cs-grid">
  <cs-card>
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    Outlined (default)
  </cs-card>
  <cs-card appearance="filled-outlined">
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    Filled-Outlined
  </cs-card>
  <cs-card appearance="plain">
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    Plain
  </cs-card>
  <cs-card appearance="filled">
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    Filled
  </cs-card>
  <cs-card appearance="accent">
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    Accent
  </cs-card>
</div>
```

### Orientation

Set the `orientation` attribute to `horizontal` to create a card with a horizontal, side-by-side layout. Make sure to set a width or maximum width for the media slot. Horizontal cards do not currently contain the header and footer slots.

:::info
The `actions` slot is only available for the horizontal orientation.
:::

```html {.example}
<div class="cs-grid">
  <cs-card orientation="horizontal" class="horizontal-card">
    <img
      slot="media"
      src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    This card has a horizontal orientation with media, body, and actions arranged side-by-side.
    <cs-button slot="actions" variant="neutral" appearance="plain"
      ><cs-icon name="more_horiz" label="actions"></cs-icon
    ></cs-button>
  </cs-card>
</div>

<style>
  .horizontal-card {
    img[slot='media'] {
      max-width: 300px;
    }
  }
</style>
```
