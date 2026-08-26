---
title: Skeleton
category: Feedback
synonyms:
  - placeholder
  - shimmer
  - loading placeholder
  - ghost
use-cases:
  - content loader
  - skeleton screen
  - loading state
description: "Skeletons show placeholder shapes where content will appear once it finishes loading, reducing perceived wait time and preventing layout shift."
---

```html {.example}
<div class="skeleton-overview">
  <header>
    <cs-skeleton effect="sheen"></cs-skeleton>
    <cs-skeleton effect="sheen"></cs-skeleton>
  </header>

  <cs-skeleton effect="sheen"></cs-skeleton>
  <cs-skeleton effect="sheen"></cs-skeleton>
  <cs-skeleton effect="sheen"></cs-skeleton>
</div>

<style>
  .skeleton-overview header {
    display: flex;
    align-items: center;
    margin-bottom: var(--cs-space-m);
  }

  .skeleton-overview header cs-skeleton:last-child {
    flex: 0 0 auto;
    width: 30%;
  }

  .skeleton-overview cs-skeleton {
    margin-bottom: var(--cs-space-m);
  }

  .skeleton-overview cs-skeleton:nth-child(1) {
    float: left;
    width: 3rem;
    height: 3rem;
    margin-right: var(--cs-space-m);
    vertical-align: middle;
  }

  .skeleton-overview cs-skeleton:nth-child(3) {
    width: 95%;
  }

  .skeleton-overview cs-skeleton:nth-child(4) {
    width: 80%;
  }
</style>
```

A single skeleton stands in for one line or shape. Because layouts vary endlessly, you'll usually combine several to mirror the content that's loading. If you reach for the same arrangement often, wrap it in a template that renders the skeletons with your spacing and styles.

## Examples

### Effect

Set the `effect` attribute to choose how the skeleton animates while content loads. Effects are intentionally subtle, since motion across many skeletons at once can distract.

| Effect                                                                                                                       | Behavior                            | Best for                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `none` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge> | Static, non-animated placeholder    | Dense layouts where motion would be noisy  |
| `sheen`                                                                                                                      | A light sweeps across the indicator | Signaling that content is actively loading |
| `pulse`                                                                                                                      | The indicator fades in and out      | A calmer alternative to `sheen`            |

```html {.example}
<div class="skeleton-effects">
  <cs-skeleton effect="none"></cs-skeleton>
  None

  <cs-skeleton effect="sheen"></cs-skeleton>
  Sheen

  <cs-skeleton effect="pulse"></cs-skeleton>
  Pulse
</div>

<style>
  .skeleton-effects {
    font-size: var(--cs-font-size-s);
  }

  .skeleton-effects cs-skeleton:not(:first-child) {
    margin-top: var(--cs-space-m);
  }
</style>
```

### Paragraphs

Stack several skeletons and vary their widths to stand in for a block of text.

```html {.example}
<div class="skeleton-paragraphs">
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
</div>

<style>
  .skeleton-paragraphs cs-skeleton {
    margin-bottom: var(--cs-space-m);
  }

  .skeleton-paragraphs cs-skeleton:nth-child(2) {
    width: 95%;
  }

  .skeleton-paragraphs cs-skeleton:nth-child(4) {
    width: 90%;
  }

  .skeleton-paragraphs cs-skeleton:last-child {
    width: 50%;
  }
</style>
```

### Avatars

Set a matching width and height to stand in for a circle, square, or rounded avatar.

```html {.example}
<div class="skeleton-avatars">
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
  <cs-skeleton></cs-skeleton>
</div>

<style>
  .skeleton-avatars cs-skeleton {
    display: inline-flex;
    width: 3rem;
    height: 3rem;
    margin-right: var(--cs-space-xs);
  }

  .skeleton-avatars cs-skeleton:nth-child(1)::part(indicator) {
    border-radius: 0;
  }

  .skeleton-avatars cs-skeleton:nth-child(2)::part(indicator) {
    border-radius: var(--cs-border-radius-m);
  }
</style>
```

### Shapes

Set a `border-radius` on the `indicator` part to make circles, squares, and rectangles. For more complex shapes, apply a `clip-path` to the `indicator` part. [Try Clippy](https://bennettfeely.com/clippy/) if you need help generating custom shapes.

```html {.example}
<div class="skeleton-shapes">
  <cs-skeleton class="square"></cs-skeleton>
  <cs-skeleton class="circle"></cs-skeleton>
  <cs-skeleton class="triangle"></cs-skeleton>
  <cs-skeleton class="cross"></cs-skeleton>
  <cs-skeleton class="comment"></cs-skeleton>
</div>

<style>
  .skeleton-shapes cs-skeleton {
    display: inline-flex;
    width: 50px;
    height: 50px;
  }

  .skeleton-shapes .square::part(indicator) {
    border-radius: var(--cs-border-radius-m);
  }

  .skeleton-shapes .circle::part(indicator) {
    border-radius: var(--cs-border-radius-circle);
  }

  .skeleton-shapes .triangle::part(indicator) {
    border-radius: 0;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
  }

  .skeleton-shapes .cross::part(indicator) {
    border-radius: 0;
    clip-path: polygon(
      20% 0%,
      0% 20%,
      30% 50%,
      0% 80%,
      20% 100%,
      50% 70%,
      80% 100%,
      100% 80%,
      70% 50%,
      100% 20%,
      80% 0%,
      50% 30%
    );
  }

  .skeleton-shapes .comment::part(indicator) {
    border-radius: 0;
    clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);
  }

  .skeleton-shapes cs-skeleton:not(:last-child) {
    margin-right: var(--cs-space-xs);
  }
</style>
```

### Colors

Set the `--color` and `--sheen-color` custom properties to tune the skeleton to your surface. `--sheen-color` is the highlight that sweeps across when `effect="sheen"`.

```html {.example}
<cs-skeleton effect="sheen" style="--color: var(--cs-color-brand-fill-loud); --sheen-color: var(--cs-color-brand-fill-quiet);"></cs-skeleton>
```
