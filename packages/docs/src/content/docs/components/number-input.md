---
title: Number Input
category: Forms
synonyms:
  - numeric input
  - stepper
  - spin button
  - counter
use-cases:
  - quantity selector
  - increment decrement
  - numeric field
description: "Number inputs let users enter and edit numeric values, with optional stepper buttons for incrementing and decrementing. Use them for quantities, measurements, and other numeric form fields."
---

<style>
  /* Every example here is a single field, so each preview takes a field width rather than the whole
     column. Set once at page level rather than inline on all 23, which keeps the examples copy-pasteable
     — the width is scaffolding for the demo, not part of using the component.

     `ch` rather than a length: a number input is sized by the digits it has to hold, so a character
     measure is the honest unit. 26ch lands the default size on the 260px these examples used to hardcode,
     and the size variants now scale from it — where the flat cap clamped `xl` to the same width as `xs`,
     on the very example meant to show them differing. */
  cs-number-input {
    max-width: 26ch;
  }
</style>

```html {.example}
<cs-number-input label="Quantity" value="1"></cs-number-input>
```

```html {.example .anatomy-only}
<cs-number-input label="Tickets" hint="How many would you like?" value="2">
  <cs-icon slot="start" name="confirmation_number" variant="fill"></cs-icon>
</cs-number-input>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the input an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-number-input label="How many items?"></cs-number-input>
```

### Hint

Add descriptive hint to an input with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-number-input
  label="Order quantity"
  hint="Enter the number of items you'd like to order"
></cs-number-input>
```

### Placeholder

Use the `placeholder` attribute to add a placeholder.

```html {.example}
<cs-number-input placeholder="Enter a number"></cs-number-input>
```

### Appearance

Use the `appearance` attribute to change the input's visual appearance.

```html {.example}
<div class="cs-stack">
  <cs-number-input label="Outlined" appearance="outlined" value="42"></cs-number-input>
  <cs-number-input label="Filled" appearance="filled" value="42"></cs-number-input>
  <cs-number-input
    label="Filled Outlined"
    appearance="filled-outlined"
    value="42"
  ></cs-number-input>
</div>
```

### Disabled

Use the `disabled` attribute to disable an input.

```html {.example}
<cs-number-input label="Disabled" value="100" disabled></cs-number-input>
```

### Readonly

Use the `readonly` attribute to keep a value visible but uneditable. Unlike `disabled`, a readonly input stays focusable and its value is still submitted with the form.

```html {.example}
<cs-number-input label="Readonly" value="42" readonly></cs-number-input>
```

### Size

Use the `size` attribute to change an input's size.

```html {.example}
<div class="cs-stack">
  <cs-number-input label="Extra Small" size="xs" value="5"></cs-number-input>
  <cs-number-input label="Small" size="s" value="10"></cs-number-input>
  <cs-number-input label="Medium" size="m" value="20"></cs-number-input>
  <cs-number-input label="Large" size="l" value="30"></cs-number-input>
  <cs-number-input label="Extra Large" size="xl" value="40"></cs-number-input>
</div>
```

### Pill

Use the `pill` attribute to give inputs rounded edges.

```html {.example}
<cs-number-input label="Quantity" pill value="5"></cs-number-input>
```

### Min, Max & Step

Use the `min` and `max` attributes to set a minimum and maximum value. Use the `step` attribute to change the granularity the value must adhere to when using the stepper buttons or arrow keys.

```html {.example}
<cs-number-input
  label="Donation amount"
  hint="Amount in dollars (10-100, increments of 5)"
  min="10"
  max="100"
  step="5"
  value="25"
></cs-number-input>
```

### Hiding the Steppers

Add the `without-steppers` attribute to remove the increment and decrement buttons.

```html {.example}
<cs-number-input label="No steppers" value="50" without-steppers></cs-number-input>
```

:::info
<strong>The keyboard still works.</strong><br />
With the steppers hidden, the arrow keys can still increment and decrement the value.
:::

### Custom Stepper Icons

Use the `increment-icon` and `decrement-icon` slots to replace the default stepper button icons.

```html {.example}
<cs-number-input label="Custom icons" value="5">
  <cs-icon slot="increment-icon" name="add"></cs-icon>
  <cs-icon slot="decrement-icon" name="remove"></cs-icon>
</cs-number-input>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` within the input.

```html {.example}
<div class="cs-stack">
  <cs-number-input label="Price" value="100">
    <cs-icon slot="start" name="attach_money"></cs-icon>
  </cs-number-input>
  <cs-number-input label="Quantity" value="3">
    <cs-icon slot="end" name="shopping_cart"></cs-icon>
  </cs-number-input>
</div>
```

### Customizing Label Position

Use [CSS parts](#css-parts) to customize the way form controls are drawn. This example uses CSS grid to position the label to the left of the control, but the possible orientations are nearly endless. The same technique works for inputs, textareas, radio groups, and similar form controls.

```html {.example}
<div class="label-on-left">
  <cs-number-input label="Quantity" hint="How many do you need?" value="1"></cs-number-input>
  <cs-number-input label="Price" hint="Cost per unit" value="25"></cs-number-input>
</div>

<style>
  .label-on-left {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--cs-space-l);
    align-items: center;

    cs-number-input {
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

### Validation

Use the `required` attribute to make the field required. Combine with `min` and `max` for range validation.

```html {.example}
<form class="number-input-validation">
  <cs-number-input
    name="quantity"
    label="Quantity"
    hint="Enter a value between 1 and 10"
    min="1"
    max="10"
    required
  ></cs-number-input>
  <br />
  <cs-number-input
    name="price"
    label="Price"
    hint="Must be a multiple of 0.25"
    min="0"
    step="0.25"
    required
  ></cs-number-input>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
  <cs-button appearance="filled" type="reset" variant="neutral">Reset</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.number-input-validation');

  form.addEventListener('submit', event => {
    event.preventDefault();

    // Log data to the console for the demo
    console.log(...new FormData(form));
  });
</script>
```
