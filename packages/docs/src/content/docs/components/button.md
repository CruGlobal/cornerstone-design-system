---
title: Button
category: Actions
synonyms:
  - btn
  - action
  - CTA
  - submit
use-cases:
  - form submit
  - link button
  - icon button
  - loading button
description: "Buttons represent actions the user can take, such as submitting a form, opening a dialog, or navigating to another page."
---

```html {.example}
<cs-button>Save</cs-button>
```

```html {.example .anatomy-only}
<cs-button>
  <cs-icon slot="start" name="settings"></cs-icon>
  Settings
  <cs-icon slot="end" name="keyboard_arrow_right"></cs-icon>
</cs-button>
```

## Examples

### Variant

Use the `variant` attribute to set the button's [semantic variant](/theming-overview#variants).

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="neutral">Neutral</cs-button>
  <cs-button variant="brand">Brand</cs-button>
  <cs-button variant="success">Success</cs-button>
  <cs-button variant="warning">Warning</cs-button>
  <cs-button variant="danger">Danger</cs-button>
</div>
```

### Appearance

Use the `appearance` attribute to change the button's visual appearance. Pair it with any `variant` for the full matrix.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="neutral">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="neutral">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="neutral">Filled</cs-button>
    <cs-button appearance="outlined" variant="neutral">Outlined</cs-button>
    <cs-button appearance="plain" variant="neutral">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="brand">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="brand">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="brand">Filled</cs-button>
    <cs-button appearance="outlined" variant="brand">Outlined</cs-button>
    <cs-button appearance="plain" variant="brand">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="success">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="success">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="success">Filled</cs-button>
    <cs-button appearance="outlined" variant="success">Outlined</cs-button>
    <cs-button appearance="plain" variant="success">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="warning">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="warning">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="warning">Filled</cs-button>
    <cs-button appearance="outlined" variant="warning">Outlined</cs-button>
    <cs-button appearance="plain" variant="warning">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="danger">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="danger">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="danger">Filled</cs-button>
    <cs-button appearance="outlined" variant="danger">Outlined</cs-button>
    <cs-button appearance="plain" variant="danger">Plain</cs-button>
  </div>
</div>
```

### Size

Use the `size` attribute to change a button's size.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button size="xs">Extra Small</cs-button>
  <cs-button size="s">Small</cs-button>
  <cs-button size="m">Medium</cs-button>
  <cs-button size="l">Large</cs-button>
  <cs-button size="xl">Extra Large</cs-button>
</div>
```

### Pill

Use the `pill` attribute to give buttons rounded edges.

```html {.example}
<cs-button pill>Pill Button</cs-button>
```

### Link Button

Set the `href` attribute to render the button as an `<a>` under the hood. Provides all the browser's native link behavior (e.g. [[CMD/CTRL/SHIFT]] + [[CLICK]]) plus the `rel`, `target`, and `download` attributes.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button href="https://example.com/">Link</cs-button>
  <cs-button href="https://example.com/" target="_blank">New Window</cs-button>
  <cs-button href="/assets/images/cornerstone-mark.svg" download="cornerstone-mark.svg">Download</cs-button>
</div>
```

### Icon Button

When an [icon](/components/icon) is the only thing slotted into the label, the button becomes an icon button. Icon buttons work with any appearance or variant.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="neutral" appearance="accent"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="outlined"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="filled"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="plain"><cs-icon name="home" label="Home"></cs-icon></cs-button>
</div>
```

:::warning
<strong>Give icon-only buttons a label.</strong><br />
With no text to announce, a screen reader has nothing to read. Add `label` to the icon (`<cs-icon name="home" label="Home">`) so the button has an accessible name.
:::

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` beside the button label.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button>
    <cs-icon slot="start" name="settings"></cs-icon>
    Settings
  </cs-button>

  <cs-button>
    <cs-icon slot="end" name="undo"></cs-icon>
    Refresh
  </cs-button>

  <cs-button>
    <cs-icon slot="start" name="link"></cs-icon>
    <cs-icon slot="end" name="open_in_new"></cs-icon>
    Open
  </cs-button>
</div>
```

### Caret

Use the `with-caret` attribute to add a dropdown indicator when a button triggers a dropdown, menu, or popover.

```html {.example}
<cs-button with-caret>Options</cs-button>
```

### Loading

Use the `loading` attribute to put a button in a busy state. Its width stays the same, so adjacent elements don't shift.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="brand" loading>Brand</cs-button>
  <cs-button variant="success" loading>Success</cs-button>
  <cs-button variant="neutral" loading>Neutral</cs-button>
  <cs-button variant="warning" loading>Warning</cs-button>
  <cs-button variant="danger" loading>Danger</cs-button>
</div>
```

### Disabled

Use the `disabled` attribute to disable a button. It works on link buttons too.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-gap-2xs">
    <cs-button variant="brand" disabled>Brand</cs-button>
    <cs-button variant="success" disabled>Success</cs-button>
    <cs-button variant="neutral" disabled>Neutral</cs-button>
    <cs-button variant="warning" disabled>Warning</cs-button>
    <cs-button variant="danger" disabled>Danger</cs-button>
  </div>

  <div class="cs-cluster cs-gap-2xs">
    <cs-button href="https://example.com/" disabled>Link</cs-button>
    <cs-button href="https://example.com/" target="_blank" disabled>New Window</cs-button>
    <cs-button href="/assets/images/cornerstone-mark.svg" download="cornerstone-mark.svg" disabled>Download</cs-button>
  </div>
</div>
```

### Custom Width

Give a button a custom `width` to size it independently of its content — useful for making buttons span their container on smaller screens.

```html {.example}
<cs-button style="width: 100%;">Save</cs-button>
```

### Customizing

Target the `button` part to restyle a button from the outside. Use a custom class when you're adding a new variation; to retheme an existing one, target its `variant` attribute instead (e.g. `cs-button[variant="brand"]`).

Build the override out of [design tokens](/tokens) rather than literal values, as below — a hue's tint scale gives you coordinated light and dark edges for free, and the radius, border width and spacing all have a step on the scale. Tokens are also what keeps a customization working across themes and colour schemes.

```html {.example}
<cs-button class="pink">Pink Button</cs-button>

<style>
  cs-button.pink::part(button) {
    border-radius: var(--cs-border-radius-m);
    border: solid var(--cs-border-width-m);
    background: var(--cs-color-pink-40);
    border-top-color: var(--cs-color-pink-60);
    border-left-color: var(--cs-color-pink-60);
    border-bottom-color: var(--cs-color-pink-20);
    border-right-color: var(--cs-color-pink-20);
    color: var(--cs-color-pink-95);
    font-size: var(--cs-font-size-l);
    box-shadow: var(--cs-shadow-m) var(--cs-color-pink-20);
    transition: all var(--cs-transition-slow) var(--cs-transition-easing);
  }

  cs-button.pink::part(button):hover {
    transform: scale(1.05);
  }

  /* Swapping the light and dark edges is what makes it read as pressed. */
  cs-button.pink::part(button):active {
    border-top-color: var(--cs-color-pink-20);
    border-right-color: var(--cs-color-pink-60);
    border-bottom-color: var(--cs-color-pink-60);
    border-left-color: var(--cs-color-pink-20);
    transform: translateY(var(--cs-space-3xs));
  }

  cs-button.pink::part(button):focus-visible {
    outline: dashed var(--cs-border-width-m) var(--cs-color-pink-60);
    outline-offset: var(--cs-space-2xs);
  }
</style>
```
