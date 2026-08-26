---
title: Input
category: Forms
synonyms:
  - text field
  - text box
  - form field
  - text input
use-cases:
  - form input
  - search box
  - email field
  - password field
  - url field
description: "Inputs collect single-line data from the user, such as text, numbers, email addresses, and passwords. They support labels, hints, validation, and prefix or suffix slots."
---

```html {.example}
<cs-input label="Name"></cs-input>
```

```html {.example .anatomy-only}
<cs-input type="password" label="Password" hint="Must be at least 8 characters." value="correcthorse">
  <cs-icon slot="start" name="lock"></cs-icon>
</cs-input>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the input an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-input label="What is your name?"></cs-input>
```

### Hint

Add descriptive hint to an input with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-input label="Nickname" hint="What would you like people to call you?"></cs-input>
```

### Placeholder

Use the `placeholder` attribute to add a placeholder.

```html {.example}
<cs-input label="Search" placeholder="Search the docs"></cs-input>
```

### Clearable

Add the `with-clear` attribute to add a clear button when the input has content.

```html {.example}
<cs-input placeholder="Clearable" with-clear></cs-input>
```

### Toggle Password

Add the `password-toggle` attribute to add a toggle button that will show the password when activated.

```html {.example}
<cs-input type="password" placeholder="Password Toggle" password-toggle></cs-input>
```

### Appearance

Use the `appearance` attribute to change the input's visual appearance.

```html {.example}
<div class="cs-stack">
  <cs-input appearance="outlined" placeholder="outlined"></cs-input>
  <cs-input appearance="filled" placeholder="filled"></cs-input>
  <cs-input appearance="filled-outlined" placeholder="filled-outlined"></cs-input>
</div>
```

### Disabled

Use the `disabled` attribute to disable an input.

```html {.example}
<cs-input placeholder="Disabled" disabled></cs-input>
```

### Readonly

Use the `readonly` attribute to keep a value visible but uneditable. Unlike `disabled`, a readonly input stays focusable and its value is still submitted with the form.

```html {.example}
<cs-input label="Account ID" value="CS-2049" readonly></cs-input>
```

### Size

Use the `size` attribute to change an input's size.

```html {.example}
<div class="cs-stack">
  <cs-input size="xs" placeholder="Extra small"></cs-input>
  <cs-input size="s" placeholder="Small"></cs-input>
  <cs-input size="m" placeholder="Medium"></cs-input>
  <cs-input size="l" placeholder="Large"></cs-input>
  <cs-input size="xl" placeholder="Extra large"></cs-input>
</div>
```

### Pill

Use the `pill` attribute to give inputs rounded edges.

```html {.example}
<cs-input placeholder="Search" pill></cs-input>
```

### Input Types

The `type` attribute controls the type of input the browser renders.

```html {.example}
<div class="cs-stack">
  <cs-input type="email" placeholder="Email"></cs-input>
  <cs-input type="number" placeholder="Number"></cs-input>
  <cs-input type="date" placeholder="Date"></cs-input>
</div>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` within the input.

```html {.example}
<div class="cs-stack">
  <cs-input label="Search" placeholder="Search the docs">
    <cs-icon name="search" slot="start"></cs-icon>
  </cs-input>
  <cs-input label="Website" placeholder="example.com">
    <cs-icon name="public" slot="start"></cs-icon>
    <cs-icon name="info" slot="end" variant="fill"></cs-icon>
  </cs-input>
</div>
```

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the label to the left of the control, but the possible orientations are nearly endless. The same technique works for inputs, textareas, radio groups, and similar form controls.

```html {.example}
<div class="label-on-left">
  <cs-input label="Name" hint="Enter your name"></cs-input>
  <cs-input label="Email" type="email" hint="Enter your email"></cs-input>
  <cs-textarea label="Bio" hint="Tell us something about yourself"></cs-textarea>
</div>

<style>
  .label-on-left {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--cs-space-l);
    align-items: center;

    cs-input,
    cs-textarea {
      grid-column: 1 / -1;
      grid-row-end: span 2;
      display: grid;
      grid-template-columns: subgrid;
      gap: 0 var(--cs-space-l);
      align-items: center;
    }

    ::part(form-control-label) {
      text-align: right;
    }

    ::part(hint) {
      grid-column: 2;
    }
  }
</style>
```
