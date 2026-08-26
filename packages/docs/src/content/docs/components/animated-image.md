---
title: Animated Image
category: Media
hasAnatomy: false
synonyms:
  - gif
  - webp
  - motion image
use-cases:
  - animated gif
  - play pause image
  - hover animation
description: "Animated images display GIFs and WEBPs with controls to play and pause them on demand. Use them when you want motion but need to give users control over when it plays."
---

```html {.example}
<cs-animated-image
  src="/assets/images/walk.gif"
  alt="Animation of untied shoes walking on pavement"
></cs-animated-image>
```

:::info
This component uses `<canvas>` to draw freeze frames, so images are subject to [cross-origin restrictions](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).
:::

## Examples

### Image Formats

Both GIF and WEBP images are supported.

```html {.example}
<cs-animated-image
  src="/assets/images/tie.webp"
  alt="Animation of a shoe being tied"
></cs-animated-image>
```

### Width & Height

To set a custom size, apply a width and/or height to the host element.

```html {.example}
<cs-animated-image
  src="/assets/images/walk.gif"
  alt="Animation of untied shoes walking on pavement"
  style="width: 150px; height: 200px;"
>
</cs-animated-image>
```

### Customizing the Control Box

You can change the appearance and location of the control box by targeting the `control-box` part in your styles.

```html {.example}
<cs-animated-image
  src="/assets/images/walk.gif"
  alt="Animation of untied shoes walking on pavement"
  class="animated-image-custom-control-box"
></cs-animated-image>

<style>
  .animated-image-custom-control-box::part(control-box) {
    top: auto;
    right: auto;
    bottom: 1rem;
    left: 1rem;
    background-color: deeppink;
    border: none;
    color: pink;
  }
</style>
```
