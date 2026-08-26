---
title: Badge
category: Feedback
synonyms:
  - chip
  - label
  - count
  - indicator
  - pill
use-cases:
  - notification count
  - status indicator
  - unread count
  - new indicator
description: "Badges draw attention to adjacent content by displaying a status, count, or label. Use them to highlight notifications, categorize items, or flag new activity."
---

```html {.example}
<cs-badge>New</cs-badge>
```

```html {.example .anatomy-only}
<cs-badge variant="brand">
  <cs-icon slot="start" name="star" variant="fill"></cs-icon>
  Featured
  <cs-icon slot="end" name="arrow_forward"></cs-icon>
</cs-badge>
```

## Examples

### Variant

Set the `variant` attribute to change the badge's variant.

```html {.example}
<cs-badge variant="brand">Brand</cs-badge>
<cs-badge variant="success">Success</cs-badge>
<cs-badge variant="neutral">Neutral</cs-badge>
<cs-badge variant="warning">Warning</cs-badge>
<cs-badge variant="danger">Danger</cs-badge>
```

### Appearance

Use the `appearance` attribute to change the badge's visual appearance.

```html {.example}
<div class="cs-stack">
  <div>
    <cs-badge appearance="accent" variant="neutral">Accent</cs-badge>
    <cs-badge appearance="filled-outlined" variant="neutral">Filled-Outlined</cs-badge>
    <cs-badge appearance="filled" variant="neutral">Filled</cs-badge>
    <cs-badge appearance="outlined" variant="neutral">Outlined</cs-badge>
  </div>
  <div>
    <cs-badge appearance="accent" variant="brand">Accent</cs-badge>
    <cs-badge appearance="filled-outlined" variant="brand">Filled-Outlined</cs-badge>
    <cs-badge appearance="filled" variant="brand">Filled</cs-badge>
    <cs-badge appearance="outlined" variant="brand">Outlined</cs-badge>
  </div>
  <div>
    <cs-badge appearance="accent" variant="success">Accent</cs-badge>
    <cs-badge appearance="filled-outlined" variant="success">Filled-Outlined</cs-badge>
    <cs-badge appearance="filled" variant="success">Filled</cs-badge>
    <cs-badge appearance="outlined" variant="success">Outlined</cs-badge>
  </div>
  <div>
    <cs-badge appearance="accent" variant="warning">Accent</cs-badge>
    <cs-badge appearance="filled-outlined" variant="warning">Filled-Outlined</cs-badge>
    <cs-badge appearance="filled" variant="warning">Filled</cs-badge>
    <cs-badge appearance="outlined" variant="warning">Outlined</cs-badge>
  </div>
  <div>
    <cs-badge appearance="accent" variant="danger">Accent</cs-badge>
    <cs-badge appearance="filled-outlined" variant="danger">Filled-Outlined</cs-badge>
    <cs-badge appearance="filled" variant="danger">Filled</cs-badge>
    <cs-badge appearance="outlined" variant="danger">Outlined</cs-badge>
  </div>
</div>
```

### Size

Badges are sized relative to the current font size. You can set `font-size` on any badge (or an ancestor element) to change it.

```html {.example}
<cs-badge variant="brand" style="font-size: var(--cs-font-size-xs);">Extra Small</cs-badge>
<cs-badge variant="brand" style="font-size: var(--cs-font-size-s);">Small</cs-badge>
<cs-badge variant="brand" style="font-size: var(--cs-font-size-m);">Medium</cs-badge>
<cs-badge variant="brand" style="font-size: var(--cs-font-size-l);">Large</cs-badge>
<cs-badge variant="brand" style="font-size: var(--cs-font-size-xl);">Extra Large</cs-badge>
```

### Pill

Use the `pill` attribute to give badges rounded edges.

```html {.example}
<cs-badge variant="brand" pill>Brand</cs-badge>
<cs-badge variant="success" pill>Success</cs-badge>
<cs-badge variant="neutral" pill>Neutral</cs-badge>
<cs-badge variant="warning" pill>Warning</cs-badge>
<cs-badge variant="danger" pill>Danger</cs-badge>
```

### Drawing Attention

Use the `attention` attribute to draw attention to the badge with a subtle animation. Supported effects are `bounce`, `pulse` and `none`.

```html {.example}
<div class="badge-attention">
  <cs-badge variant="brand" attention="pulse" pill>1</cs-badge>
  <cs-badge variant="success" attention="pulse" pill>1</cs-badge>
  <cs-badge variant="neutral" attention="pulse" pill>1</cs-badge>
  <cs-badge variant="warning" attention="pulse" pill>1</cs-badge>
  <cs-badge variant="danger" attention="pulse" pill>1</cs-badge>
</div>

<div class="badge-attention">
  <cs-badge variant="brand" attention="bounce" pill>1</cs-badge>
  <cs-badge variant="success" attention="bounce" pill>1</cs-badge>
  <cs-badge variant="neutral" attention="bounce" pill>1</cs-badge>
  <cs-badge variant="warning" attention="bounce" pill>1</cs-badge>
  <cs-badge variant="danger" attention="bounce" pill>1</cs-badge>
</div>

<style>
  .badge-attention {
    margin-block-end: var(--cs-space-m);

    cs-badge:not(:last-of-type) {
      margin-right: var(--cs-space-m);
    }
  }
</style>
```

Set the `--pulse-color` custom property to color the pulse independently of the badge's variant.

```html {.example}
<cs-badge variant="neutral" attention="pulse" pill style="--pulse-color: var(--cs-color-brand-fill-loud)">1</cs-badge>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` alongside the badge's label.

```html {.example}
<cs-badge>
  <cs-icon slot="start" name="eco"></cs-icon>
  Start
</cs-badge>
<cs-badge>
  <cs-icon slot="end" name="park" variant="fill"></cs-icon>
  End
</cs-badge>
<cs-badge>
  <cs-icon slot="start" name="pets"></cs-icon>
  <cs-icon slot="end" name="flare"></cs-icon>
  Both
</cs-badge>
```

### With Buttons

One of the most common use cases for badges is attaching them to buttons. To make this easier, badges will be automatically positioned at the top-right when they're a child of a button.

```html {.example}
<cs-button appearance="filled">
  Requests
  <cs-badge pill>30</cs-badge>
</cs-button>

<cs-button appearance="filled" style="margin-inline-start: 1rem;">
  Warnings
  <cs-badge variant="warning" pill>8</cs-badge>
</cs-button>

<cs-button appearance="filled" style="margin-inline-start: 1rem;">
  Errors
  <cs-badge variant="danger" pill>6</cs-badge>
</cs-button>
```
