---
title: Spinner
category: Feedback
synonyms:
  - loading
  - loader
  - busy indicator
  - throbber
use-cases:
  - loading animation
  - indeterminate progress
  - ajax loader
description: "Spinners indicate that an operation is in progress when the duration is unknown. Use them for loading states where a determinate progress bar isn't practical."
---

```html {.example}
<cs-spinner></cs-spinner>
```

## Examples

### Size

Spinners are sized based on the current font size. To change the size, set `font-size` on the spinner itself or on a parent element.

```html {.example}
<cs-spinner></cs-spinner>
<cs-spinner class="cs-font-size-2xl"></cs-spinner>
<cs-spinner class="cs-font-size-4xl"></cs-spinner>
```

### Track Width

Use the `--track-width` custom property to change the thickness of the spinner's track.

```html {.example}
<cs-spinner class="cs-font-size-4xl" style="--track-width: 10px;"></cs-spinner>
```

### Colors

Use the `--track-color` and `--indicator-color` custom properties to recolor the spinner.

```html {.example}
<cs-spinner class="cs-font-size-4xl" style="--indicator-color: var(--cs-color-success-fill-loud); --track-color: var(--cs-color-success-fill-quiet);"></cs-spinner>
```

### Speed

Use the `--speed` custom property to set how long one full rotation takes.

```html {.example}
<cs-spinner class="cs-font-size-4xl" style="--speed: 4s;"></cs-spinner>
```
