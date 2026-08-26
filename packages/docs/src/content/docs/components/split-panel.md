---
title: Split Panel
category: Layout
synonyms:
  - resizable panels
  - pane splitter
  - split view
  - splitter
use-cases:
  - code editor layout
  - side by side
  - resizable columns
description: "Split panels display two adjacent panels separated by a draggable divider, letting users resize each side to suit their workflow."
---

```html {.example .anatomy}
<cs-split-panel>
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>

<style>
  .split-demo {
    height: 200px;
    background: var(--cs-color-surface-lowered);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
</style>
```

## Examples

### Initial Position

Set the `position` attribute to change the divider's starting position, given as a percentage of the available space (`50` by default). To set it in pixels instead, use the `position-in-pixels` attribute.

<style>
  /* A vertical split panel has no intrinsic height, so the demos give it one: five of the largest space
     step, which is exactly the 400px these examples used to hardcode. The select is sized by its label. */
  .panel-demo {
    block-size: calc(var(--cs-space-5xl) * 5);
  }

  .panel-select {
    max-inline-size: 20ch;
  }
</style>

```html {.example}
<cs-split-panel position="75">
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>
```

```html {.example}
<cs-split-panel position-in-pixels="150">
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>
```

### Orientation

Set the `orientation` attribute to `vertical` and provide a height to render the split panel in a vertical orientation where the start and end panels are stacked.

```html {.example}
<cs-split-panel orientation="vertical" class="panel-demo">
  <div slot="start" class="split-demo" style="height: 100%;">
    Start
  </div>
  <div slot="end" class="split-demo" style="height: 100%;">
    End
  </div>
</cs-split-panel>
```

### Snapping

To snap panels at specific positions while dragging, add the `snap` attribute with one or more space-separated values. Values must be in pixels or percentages. For example, to snap the panel at `100px` and `50%`, use `snap="100px 50%"`. You can also customize how close the divider must be before snapping with the `snap-threshold` attribute.

```html {.example}
<div class="split-panel-snapping">
  <cs-split-panel snap="100px 50%">
    <div slot="start" class="split-demo">
      Start
    </div>
    <div slot="end" class="split-demo">
      End
    </div>
  </cs-split-panel>

  <div class="split-panel-snapping-dots"></div>
</div>

<style>
  .split-panel-snapping {
    position: relative;
  }

  .split-panel-snapping-dots::before,
  .split-panel-snapping-dots::after {
    content: '';
    position: absolute;
    bottom: -12px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cs-color-neutral-fill-loud);
    transform: translateX(-3px);
  }

  .split-panel-snapping-dots::before {
    left: 100px;
  }

  .split-panel-snapping-dots::after {
    left: 50%;
  }
</style>
```

### Disabled

Add the `disabled` attribute to prevent the divider from being repositioned.

```html {.example}
<cs-split-panel disabled>
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>
```

### Primary Panel

By default, both panels will grow or shrink proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the secondary panel will grow or shrink to fit the remaining space. You can set the primary panel to `start` or `end` using the `primary` attribute.

Try resizing the example below with each option and notice how the panels respond.

```html {.example}
<div class="split-panel-primary">
  <cs-split-panel>
    <div slot="start" class="split-demo">
      Start
    </div>
    <div slot="end" class="split-demo">
      End
    </div>
  </cs-split-panel>

  <cs-divider></cs-divider>

  <cs-select label="Primary Panel" class="panel-select">
    <cs-option value="" selected>None</cs-option>
    <cs-option value="start">Start</cs-option>
    <cs-option value="end">End</cs-option>
  </cs-select>
</div>

<script>
  const container = document.querySelector('.split-panel-primary');
  const splitPanel = container.querySelector('cs-split-panel');
  const select = container.querySelector('cs-select');

  select.addEventListener('change', () => (splitPanel.primary = select.value));
</script>
```

### Min & Max

To set a minimum or maximum size of the primary panel, use the `--min` and `--max` custom properties. Since the secondary panel is flexible, size constraints can only be applied to the primary panel. If no primary panel is designated, these constraints will be applied to the `start` panel.

This examples demonstrates how you can ensure both panels are at least 150px using `--min`, `--max`, and the `calc()` function.

```html {.example}
<cs-split-panel style="--min: 150px; --max: calc(100% - 150px);">
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>
```

### Nested Split Panels

Create complex layouts that can be repositioned independently by nesting split panels.

```html {.example}
<cs-split-panel>
  <div slot="start" class="split-demo panel-demo">
    Start
  </div>
  <div slot="end">
    <cs-split-panel orientation="vertical" class="panel-demo">
      <div slot="start" class="split-demo" style="height: 100%;">
        Top
      </div>
      <div slot="end" class="split-demo" style="height: 100%;">
        Bottom
      </div>
    </cs-split-panel>
  </div>
</cs-split-panel>
```

### Customizing the Divider

You can target the `divider` part to apply CSS properties to the divider. To add a custom handle, slot an icon into the `divider` slot. When customizing the divider, make sure to think about focus styles for keyboard users.

```html {.example}
<cs-split-panel style="--divider-width: 20px;">
  <cs-icon slot="divider" name="drag_indicator"></cs-icon>
  <div slot="start" class="split-demo">
    Start
  </div>
  <div slot="end" class="split-demo">
    End
  </div>
</cs-split-panel>
```

Here's a more elaborate example that changes the divider's color and width and adds a styled handle.

```html {.example}
<div class="split-panel-divider">
  <cs-split-panel>
    <cs-icon slot="divider" name="drag_indicator"></cs-icon>
    <div slot="start" class="split-demo">
      Start
    </div>
    <div slot="end" class="split-demo">
      End
    </div>
  </cs-split-panel>
</div>

<style>
  .split-panel-divider cs-split-panel {
    --divider-width: 4px;
  }

  .split-panel-divider cs-split-panel::part(divider) {
    background-color: var(--cs-color-cerise-50);
  }

  .split-panel-divider cs-icon {
    position: absolute;
    border-radius: var(--cs-border-radius-l);
    background: var(--cs-color-cerise-50);
    color: white;
    padding: var(--cs-space-xs) var(--cs-space-2xs);
  }

  .split-panel-divider cs-split-panel::part(divider):focus-visible {
    background-color: var(--cs-color-sky-50);
  }

  .split-panel-divider cs-split-panel:focus-within cs-icon {
    background-color: var(--cs-color-sky-50);
    color: white;
  }
</style>
```
