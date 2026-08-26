---
title: Checkbox
category: Forms
synonyms:
  - check
  - tick
  - checkmark
use-cases:
  - boolean toggle
  - multi-select option
  - terms agreement
  - todo item
description: "Checkboxes let users toggle an option on or off, or select multiple items from a list. They also support an indeterminate state for partial selections in groups."
---

```html {.example}
<cs-checkbox>I agree to the terms and conditions</cs-checkbox>
```

```html {.example .anatomy-only}
<cs-checkbox checked hint="You can turn this off later in settings.">Remember me</cs-checkbox>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Initial Value

Use the `checked` attribute to activate the checkbox.

```html {.example}
<cs-checkbox checked>Remember me</cs-checkbox>
```

:::info
<strong>`checked` sets the initial value, not the current state.</strong><br />
Consistent with native checkboxes, it doesn't reflect later changes. To toggle the checked state with JavaScript, use the `checked` property instead. To target checked checkboxes with CSS, use the `:state(checked)` selector.
:::

### Hint

Add a descriptive hint with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-checkbox hint="You can turn this off later in settings.">Subscribe to the newsletter</cs-checkbox>
```

### Indeterminate

Use the `indeterminate` attribute to make the checkbox indeterminate. This is typically used for a "select all" control when its associated checkboxes have a mix of checked and unchecked states.

```html {.example}
<cs-checkbox indeterminate>Select all</cs-checkbox>
```

### Disabled

Use the `disabled` attribute to disable the checkbox.

```html {.example}
<cs-checkbox disabled>I accept marketing emails</cs-checkbox>
```

### Size

Use the `size` attribute to change a checkbox's size.

```html {.example}
<div class="cs-stack">
  <cs-checkbox size="xs">Extra Small</cs-checkbox>
  <cs-checkbox size="s">Small</cs-checkbox>
  <cs-checkbox size="m">Medium</cs-checkbox>
  <cs-checkbox size="l">Large</cs-checkbox>
  <cs-checkbox size="xl">Extra Large</cs-checkbox>
</div>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html {.example}
<form class="custom-validity">
  <cs-checkbox>Check me</cs-checkbox>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral" style="margin-top: 1rem;">Submit</cs-button>
</form>
<script>
  const form = document.querySelector('.custom-validity');
  const checkbox = form.querySelector('cs-checkbox');
  const errorMessage = `Don't forget to check me!`;

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('cs-checkbox').then(async () => {
    await checkbox.updateComplete;
    checkbox.setCustomValidity(errorMessage);
  });

  // Update validity on change
  checkbox.addEventListener('change', () => {
    checkbox.setCustomValidity(checkbox.checked ? '' : errorMessage);
  });

  // Handle submit
  customElements.whenDefined('cs-checkbox').then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```
