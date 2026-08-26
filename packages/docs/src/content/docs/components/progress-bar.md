---
title: Progress Bar
category: Feedback
synonyms:
  - loading bar
  - progress indicator
  - status bar
use-cases:
  - upload progress
  - download progress
  - step progress
description: "Progress bars show how far along an ongoing operation is as a horizontal fill. Use them for file uploads, multi-step flows, or any task with measurable progress."
---

```html {.example}
<cs-progress-bar value="40"></cs-progress-bar>
```

## Examples

### Label

Use the `label` attribute to tell assistive devices how to announce the progress bar.

```html {.example}
<cs-progress-bar value="50" label="Upload progress"></cs-progress-bar>
```

### Indeterminate

Add the `indeterminate` attribute when an operation is pending but its progress can't be measured. In this state, `value` is ignored and the label, if present, isn't shown.

```html {.example}
<cs-progress-bar indeterminate></cs-progress-bar>
```

### Customizing

Set the `--track-height` custom property to change the bar's thickness, and `--track-color` / `--indicator-color` to recolor it.

```html {.example}
<cs-progress-bar
  value="60"
  style="
    --track-height: 1.5rem;
    --track-color: var(--cs-color-neutral-fill-quiet);
    --indicator-color: var(--cs-color-success-fill-loud);
  "
></cs-progress-bar>
```

### Showing Values

Use the default slot to show a value inside the bar.

```html {.example}
<div class="cs-stack">
  <cs-progress-bar value="50" id="progress-bar-demo">50%</cs-progress-bar>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <cs-button pill appearance="filled">
      <cs-icon name="remove" label="Decrease"></cs-icon>
    </cs-button>
    <cs-button pill appearance="filled">
      <cs-icon name="add" label="Increase"></cs-icon>
    </cs-button>
  </div>
</div>

<script>
  const progressBar = document.querySelector('#progress-bar-demo');
  const subtractButton = document.querySelector('cs-button:has(cs-icon[name="remove"])');
  const addButton = document.querySelector('cs-button:has(cs-icon[name="add"])');

  addButton.addEventListener('click', () => {
    const value = Math.min(100, progressBar.value + 10);
    progressBar.value = value;
    progressBar.textContent = `${value}%`;
  });

  subtractButton.addEventListener('click', () => {
    const value = Math.max(0, progressBar.value - 10);
    progressBar.value = value;
    progressBar.textContent = `${value}%`;
  });
</script>
```
