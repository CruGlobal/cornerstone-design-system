---
title: Radio Group
category: Forms
synonyms:
  - radio buttons
  - option group
  - button group
use-cases:
  - single select group
  - exclusive options
description: "Radio groups wrap a set of radios so they function as a single form control with one shared value. They handle keyboard navigation, labeling, and validation for the group as a whole."
---

```html {.example}
<cs-radio-group label="Coffee roast" name="roast" value="medium">
  <cs-radio value="light">Light roast</cs-radio>
  <cs-radio value="medium">Medium roast</cs-radio>
  <cs-radio value="dark">Dark roast</cs-radio>
</cs-radio-group>
```

## Examples

### Initial Value

Use the `value` attribute on the radio group to set the initially selected radio. Match it to the `value` of the radio that should start checked, just like native HTML.

```html {.example}
<cs-radio-group label="Coffee roast" name="roast" value="dark">
  <cs-radio value="light">Light roast</cs-radio>
  <cs-radio value="medium">Medium roast</cs-radio>
  <cs-radio value="dark">Dark roast</cs-radio>
</cs-radio-group>
```

:::info
To target checked radios with CSS, use the `:state(checked)` selector.
:::

### Hint

Add descriptive hint to a radio group with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example .anatomy}
<cs-radio-group label="Coffee roast" hint="Pick the roast we'll grind for your order." name="roast" value="medium">
  <cs-radio value="light">Light roast</cs-radio>
  <cs-radio value="medium">Medium roast</cs-radio>
  <cs-radio value="dark">Dark roast</cs-radio>
</cs-radio-group>
```

### Radio Buttons

Set the `appearance` attribute to `button` on all radios to render a radio button group.

```html {.example}
<div class="cs-stack">
  <cs-radio-group
    label="Color scheme"
    hint="Choose how the interface should appear."
    orientation="horizontal"
    name="scheme"
    value="auto"
  >
    <cs-radio appearance="button" value="light">Light</cs-radio>
    <cs-radio appearance="button" value="dark">Dark</cs-radio>
    <cs-radio appearance="button" value="auto">Auto</cs-radio>
  </cs-radio-group>

  <cs-radio-group
    label="Color scheme"
    hint="Choose how the interface should appear."
    orientation="vertical"
    name="scheme"
    value="auto"
    style="max-width: 300px;"
  >
    <cs-radio appearance="button" value="light">Light</cs-radio>
    <cs-radio appearance="button" value="dark">Dark</cs-radio>
    <cs-radio appearance="button" value="auto">Auto</cs-radio>
  </cs-radio-group>
</div>
```

### Disabled

To disable the entire radio group, add the `disabled` attribute to the radio group.

```html {.example}
<cs-radio-group label="Shipping speed" disabled>
  <cs-radio value="standard">Standard</cs-radio>
  <cs-radio value="express">Express</cs-radio>
  <cs-radio value="overnight">Overnight</cs-radio>
</cs-radio-group>
```

To disable individual options, add the `disabled` attribute to the respective options.

```html {.example}
<cs-radio-group label="Shipping speed">
  <cs-radio value="standard">Standard</cs-radio>
  <cs-radio value="express">Express</cs-radio>
  <cs-radio value="overnight" disabled>Overnight</cs-radio>
</cs-radio-group>
```

### Orientation

The default orientation for radio items is `vertical`. Set the `orientation` to `horizontal` to lay items out on the same row.

```html {.example}
<cs-radio-group
  label="Shipping speed"
  hint="Choose how fast you'd like your order."
  orientation="horizontal"
  name="shipping"
  value="standard"
>
  <cs-radio value="standard">Standard</cs-radio>
  <cs-radio value="express">Express</cs-radio>
  <cs-radio value="overnight">Overnight</cs-radio>
</cs-radio-group>
```

### Size

The size of radios will be determined by the Radio Group's `size` attribute.

```html {.example}
<div class="cs-stack">
  <cs-radio-group label="Extra small" size="xs" value="medium">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <cs-radio-group label="Small" size="s" value="medium">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <cs-radio-group label="Medium" size="m" value="medium">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <cs-radio-group label="Large" size="l" value="dark">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <cs-radio-group label="Extra large" size="xl" value="dark">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
</div>
```

If you need to have radios of varying sizes, place the `size` attribute on individual radio items instead.

```html {.example}
<cs-radio-group label="Mixed sizes" value="m">
  <cs-radio value="xs" size="xs">Extra Small</cs-radio>
  <cs-radio value="s" size="s">Small</cs-radio>
  <cs-radio value="m" size="m">Medium</cs-radio>
  <cs-radio value="l" size="l">Large</cs-radio>
  <cs-radio value="xl" size="xl">Extra Large</cs-radio>
</cs-radio-group>
```

### Validation

Set the `required` attribute to make selecting an option mandatory. If a value has not been selected, it will prevent the form from submitting and display an error message.

```html {.example}
<form class="validation">
  <cs-radio-group label="Coffee roast" name="roast" required>
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.validation');

  // Handle form submit
  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('All fields are valid!');
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html {.example}
<form class="custom-validity">
  <cs-radio-group label="Coffee roast" name="roast" value="light">
    <cs-radio value="light">Light roast</cs-radio>
    <cs-radio value="medium">Medium roast</cs-radio>
    <cs-radio value="dark">Dark roast</cs-radio>
  </cs-radio-group>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.custom-validity');
  const radioGroup = form.querySelector('cs-radio-group');
  const errorMessage = 'Sorry, we only have dark roast today';

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('cs-radio-group').then(() => {
    radioGroup.setCustomValidity(errorMessage);
  });

  // Update validity when a selection is made
  form.addEventListener('change', () => {
    const isValid = radioGroup.value === 'dark';
    radioGroup.setCustomValidity(isValid ? '' : errorMessage);
  });

  // Handle form submit
  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('All fields are valid!');
  });
</script>
```
