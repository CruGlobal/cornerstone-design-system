---
title: Form Controls
description: Using Cornerstone form controls.
synonyms:
  - forms
  - form elements
  - validation
use-cases:
  - form handling
  - form data
  - constraint validation
---

Cornerstone form controls are form-associated custom elements, meaning they will submit with forms just like native `<form>` controls. They also support constraint validation, which is the platform's version of client-side form validation.

## Constraint Validation

Client-side validation can be enabled through the browser's [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) for Cornerstone form controls. You can activate it using attributes such as `required`, `pattern`, `minlength`, `maxlength`, etc. Cornerstone implements many of the same attributes as native form controls, but check the documentation for a list of supported properties for each component.

If you don't want to use client-side validation, you can suppress this behavior by adding `novalidate` to the surrounding `<form>` element.

And if this syntax looks unfamiliar, don't worry! Most of what you're learning on this page is platform knowledge that applies to native form controls, too.

:::warning
Client-side validation can be used to improve the UX of forms, but it is not a replacement for server-side validation. You should always validate and sanitize user input on the server!
:::

### Required Fields

To make a field required, use the `required` attribute. Required fields will automatically receive an asterisk after their labels. The form will not be submitted if a required field is incomplete.

```html {.example}
<form class="input-validation-required">
  <cs-input name="name" label="Name" required></cs-input>
  <br />
  <cs-select label="Favorite Animal" with-clear required>
    <cs-option value="birds">Birds</cs-option>
    <cs-option value="cats">Cats</cs-option>
    <cs-option value="dogs">Dogs</cs-option>
    <cs-option value="other">Other</cs-option>
  </cs-select>
  <br />
  <cs-textarea name="comment" label="Comment" required></cs-textarea>
  <br />
  <cs-checkbox required>Check me before submitting</cs-checkbox>
  <br /><br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.input-validation-required');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('cs-button'),
    customElements.whenDefined('cs-checkbox'),
    customElements.whenDefined('cs-input'),
    customElements.whenDefined('cs-option'),
    customElements.whenDefined('cs-select'),
    customElements.whenDefined('cs-textarea'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

#### Styling the Required Indicator

The asterisk is drawn with three [design tokens](/tokens/component-groups#form-controls). Override them to change the character, its color, and the space between it and the label.

- [`--cs-form-control-required-content`](/tokens/component-groups#token-cs-form-control-required-content) - the content appended to the label, e.g. `'*'`
- [`--cs-form-control-required-content-color`](/tokens/component-groups#token-cs-form-control-required-content-color) - the indicator's color
- [`--cs-form-control-required-content-offset`](/tokens/component-groups#token-cs-form-control-required-content-offset) - the inline space between the label and the indicator

```html {.example}
<form class="custom-required-indicator">
  <cs-input name="name" label="Name" required></cs-input>
</form>

<style>
  .custom-required-indicator {
    --cs-form-control-required-content: '(required)';
    --cs-form-control-required-content-color: var(--cs-color-danger-on-quiet);
    --cs-form-control-required-content-offset: 0.5em;
  }
</style>
```

Set `--cs-form-control-required-content` to `''` to remove the indicator.

### Input Patterns

To restrict a value to a specific [pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern), use the `pattern` attribute. This example only allows the letters A-Z, so the form will not submit if a number or symbol is entered. This only works with `<cs-input>` elements.

```html {.example}
<form class="input-validation-pattern">
  <cs-input name="letters" required label="Letters" pattern="[A-Za-z]+"></cs-input>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
  <cs-button appearance="filled" type="reset" variant="neutral">Reset</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.input-validation-pattern');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([customElements.whenDefined('cs-button'), customElements.whenDefined('cs-input')]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Input Types

Some input types will automatically trigger constraints, such as `email` and `url`.

```html {.example}
<form class="input-validation-type">
  <cs-input type="email" label="Email" placeholder="you@example.com" required></cs-input>
  <br />
  <cs-input type="url" label="URL" placeholder="https://example.com/" required></cs-input>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
  <cs-button appearance="filled" type="reset" variant="neutral">Reset</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.input-validation-type');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([customElements.whenDefined('cs-button'), customElements.whenDefined('cs-input')]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Custom Error Messages

To create a custom validation error, pass a non-empty string to the `setCustomValidity()` method. This will override any existing validation constraints. The form will not be submitted when a custom validity is set and the browser will show a validation error when the containing form is submitted. To make the input valid again, call `setCustomValidity()` again with an empty string.

```html {.example}
<form class="input-validation-custom">
  <cs-input label="Type cornerstone" required></cs-input>
  <br />
  <cs-button appearance="filled" type="submit" variant="neutral">Submit</cs-button>
  <cs-button appearance="filled" type="reset" variant="neutral">Reset</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.input-validation-custom');
  const input = form.querySelector('cs-input');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([customElements.whenDefined('cs-button'), customElements.whenDefined('cs-input')]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });

    input.addEventListener('input', () => {
      if (input.value === 'cornerstone') {
        input.setCustomValidity('');
      } else {
        input.setCustomValidity("Hey, you're supposed to type 'cornerstone' before submitting this!");
      }
    });
  });
</script>
```

:::info
Custom validation can be applied to any form control that supports the `setCustomValidity()` method. It is not limited to inputs and textareas.
:::

## Custom Validation Styles

Due to the many ways form controls are used, Cornerstone doesn't provide out of the box validation styles for form controls as part of its default theme.

Instead, the following [custom states](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states) will be applied to reflect a control's validity as users interact with it. You can use them to create custom styles for any of the validation states you're interested in.

- `:state(required)` - the form control is required
- `:state(optional)` - the form control is optional
- `:state(invalid)` - the form control is invalid
- `:state(valid)` - the form control is valid
- `:state(user-invalid)` - the form control is invalid and the user has interacted with it
- `:state(user-valid)` - the form control is valid and the user has interacted with it

These custom states work alongside the browser's built-in pseudo classes for validation: [`:required`](https://developer.mozilla.org/en-US/docs/Web/CSS/:required), [`:optional`](https://developer.mozilla.org/en-US/docs/Web/CSS/:optional), [`:invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:invalid), [`:valid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:valid), [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid), and [`:user-valid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-valid).
