---
title: Progress Ring
category: Feedback
synonyms:
  - circular progress
  - donut chart
  - radial progress
use-cases:
  - loading spinner
  - circular loader
  - completion ring
description: "Progress rings show how far along a determinate operation is using a circular indicator. Use them as a compact alternative to progress bars when horizontal space is limited."
---

```html {.example}
<cs-progress-ring value="25"></cs-progress-ring>
```

## Examples

### Label

Use the `label` attribute to tell assistive devices how to announce the progress ring.

```html {.example}
<cs-progress-ring value="25" label="Sync progress"></cs-progress-ring>
```

### Size

Use the `--size` custom property to set the diameter of the ring.

```html {.example}
<cs-progress-ring value="50" style="--size: 200px;"></cs-progress-ring>
```

### Track & Indicator Width

Use the `--track-width` and `--indicator-width` custom properties to set the width of the ring's track and indicator independently.

```html {.example}
<cs-progress-ring value="50" style="--track-width: 6px; --indicator-width: 12px;"></cs-progress-ring>
```

### Colors

Use the `--track-color` and `--indicator-color` custom properties to recolor the ring.

```html {.example}
<cs-progress-ring
  value="50"
  style="
    --track-color: var(--cs-color-success-fill-quiet);
    --indicator-color: var(--cs-color-success-fill-loud);
  "
></cs-progress-ring>
```

### Showing Values

Use the default slot to show a value inside the ring.

```html {.example}
<div class="progress-ring-overview">
  <cs-progress-ring value="50" class="progress-ring-values">50%</cs-progress-ring>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <cs-button appearance="filled" circle><cs-icon name="remove" label="Decrease"></cs-icon></cs-button>
    <cs-button appearance="filled" circle><cs-icon name="add" label="Increase"></cs-icon></cs-button>
  </div>
</div>

<script>
  const progressRing = document.querySelector('.progress-ring-values');
  const subtractButton = document.querySelector('.progress-ring-overview cs-button:has(cs-icon[name="remove"])');
  const addButton = document.querySelector('.progress-ring-overview cs-button:has(cs-icon[name="add"])');

  addButton.addEventListener('click', () => {
    const value = Math.min(100, progressRing.value + 10);
    progressRing.value = value;
    progressRing.textContent = `${value}%`;
  });

  subtractButton.addEventListener('click', () => {
    const value = Math.max(0, progressRing.value - 10);
    progressRing.value = value;
    progressRing.textContent = `${value}%`;
  });
</script>
```
