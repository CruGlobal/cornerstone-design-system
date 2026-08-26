---
title: Switch
category: Forms
synonyms:
  - toggle
  - toggle switch
  - on off
use-cases:
  - boolean toggle
  - setting toggle
  - dark mode toggle
description: "Switches toggle a single setting on or off and apply the change immediately, without requiring a form submission."
---

```html {.example}
<cs-switch>Enable notifications</cs-switch>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Add label text as the switch's default content. For labels that contain HTML, slot the markup in directly.

```html {.example}
<cs-switch>Subscribe to the newsletter</cs-switch>
```

### Hint

Add descriptive hint to a switch with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example .anatomy}
<cs-switch hint="You can change this at any time in settings.">Email me about new releases</cs-switch>
```

### Initial Value

Use the `checked` attribute to activate the switch.

```html {.example}
<cs-switch checked>Remember this device</cs-switch>
```

:::info
<strong>`checked` sets the initial value, not the current state.</strong><br />
Consistent with native checkboxes, it doesn't reflect later changes. To toggle the checked state with JavaScript, use the `checked` property instead. To target checked switches with CSS, use the `:state(checked)` selector.
:::

### Disabled

Use the `disabled` attribute to disable the switch.

```html {.example}
<cs-switch disabled>Sync over cellular</cs-switch>
```

### Size

Use the `size` attribute to change a switch's size.

```html {.example}
<div class="cs-stack">
  <cs-switch size="xs">Extra Small</cs-switch>
  <cs-switch size="s">Small</cs-switch>
  <cs-switch size="m">Medium</cs-switch>
  <cs-switch size="l">Large</cs-switch>
  <cs-switch size="xl">Extra Large</cs-switch>
</div>
```

### Custom Properties

Use the available custom properties to change how the switch is styled.

```html {.example}
<cs-switch style="--width: 80px; --height: 40px; --thumb-size: 36px;">Really big</cs-switch>
```
