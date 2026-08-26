---
title: Divider
category: Layout
synonyms:
  - separator
  - rule
  - line
  - hr
  - horizontal rule
use-cases:
  - section divider
  - content separator
  - visual break
description: "Dividers visually separate or group adjacent elements with a horizontal or vertical line. Use them to establish rhythm and hierarchy within menus, toolbars, and layouts."
---

```html {.example}
<cs-divider></cs-divider>
```

## Examples

### Width

Use the `--width` custom property to change the width of the divider.

```html {.example}
<cs-divider style="--width: 4px;"></cs-divider>
```

### Color

Use the `--color` custom property to change the color of the divider.

```html {.example}
<cs-divider style="--color: var(--cs-color-brand-fill-loud);"></cs-divider>
```

### Spacing

Use the `--spacing` custom property to change the amount of space between the divider and its neighboring elements.

```html {.example}
<div class="cs-text-center">
  Above
  <cs-divider style="--spacing: 2rem;"></cs-divider>
  Below
</div>
```

### Orientation

The default orientation for dividers is `horizontal`. Set the `orientation` attribute to `vertical` to draw a vertical divider. The divider will span the full height of its [Flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) or [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid) container.

```html {.example}
<div class="cs-cluster cs-gap-0">
  First
  <cs-divider orientation="vertical"></cs-divider>
  Middle
  <cs-divider orientation="vertical"></cs-divider>
  Last
</div>
```

:::info
If your container isn't Flexbox or CSS Grid, you may need to set an explicit height for the divider.
:::

### Dropdown Dividers

Use dividers in [dropdowns](/components/dropdown) to visually group dropdown items.

```html {.example}
<cs-dropdown style="max-width: 200px;">
  <cs-button appearance="filled" slot="trigger" with-caret>Menu</cs-button>
  <cs-dropdown-item value="1">Option 1</cs-dropdown-item>
  <cs-dropdown-item value="2">Option 2</cs-dropdown-item>
  <cs-dropdown-item value="3">Option 3</cs-dropdown-item>
  <cs-divider></cs-divider>
  <cs-dropdown-item value="4">Option 4</cs-dropdown-item>
  <cs-dropdown-item value="5">Option 5</cs-dropdown-item>
  <cs-dropdown-item value="6">Option 6</cs-dropdown-item>
</cs-dropdown>
```
