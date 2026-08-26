---
title: Select
category: Forms
synonyms:
  - dropdown select
  - combobox
  - picker
  - chooser
  - pulldown
use-cases:
  - form select
  - option picker
  - single select
  - multi select
description: "Selects let users choose one or more values from a dropdown list of predefined options. Use them in forms when a fixed set of choices needs to fit in limited space."
---

```html {.example}
<cs-select label="Coffee order" placeholder="How do you take it?">
  <cs-option value="espresso">Espresso</cs-option>
  <cs-option value="latte">Latte</cs-option>
  <cs-option value="cappuccino">Cappuccino</cs-option>
  <cs-option value="cold-brew">Cold brew</cs-option>
  <cs-option value="drip">Drip</cs-option>
</cs-select>
```

```html {.example .anatomy-only}
<cs-select label="Coffee order" hint="We'll grind it fresh to order." value="latte">
  <cs-icon slot="start" name="coffee" variant="fill"></cs-icon>
  <cs-option value="espresso">Espresso</cs-option>
  <cs-option value="latte">Latte</cs-option>
  <cs-option value="cappuccino">Cappuccino</cs-option>
  <cs-option value="cold-brew">Cold brew</cs-option>
  <cs-option value="drip">Drip</cs-option>
</cs-select>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the select an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-select label="Country">
  <cs-option value="us">United States</cs-option>
  <cs-option value="ca">Canada</cs-option>
  <cs-option value="mx">Mexico</cs-option>
</cs-select>
```

### Hint

Add a descriptive hint with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-select label="Experience" hint="Tell us how comfortable you are with the command line.">
  <cs-option value="1">Novice</cs-option>
  <cs-option value="2">Intermediate</cs-option>
  <cs-option value="3">Advanced</cs-option>
</cs-select>
```

### Placeholder

Use the `placeholder` attribute to show prompt text before a selection is made.

```html {.example}
<cs-select placeholder="Select one">
  <cs-option value="option-1">Option 1</cs-option>
  <cs-option value="option-2">Option 2</cs-option>
  <cs-option value="option-3">Option 3</cs-option>
</cs-select>
```

### Initial Value

Use the `selected` attribute on individual options to set the initial selection, just like native HTML.

```html {.example}
<cs-select label="Default branch">
  <cs-option value="main" selected>main</cs-option>
  <cs-option value="develop">develop</cs-option>
  <cs-option value="staging">staging</cs-option>
</cs-select>
```

When the `multiple` attribute is present, add `selected` to each option that should start selected.

```html {.example}
<cs-select label="Toppings" multiple>
  <cs-option value="mushrooms" selected>Mushrooms</cs-option>
  <cs-option value="olives" selected>Olives</cs-option>
  <cs-option value="peppers">Peppers</cs-option>
  <cs-option value="onions">Onions</cs-option>
</cs-select>
```

:::info
Framework users can bind directly to the `value` property for reactive data binding and form state management.
:::

### Appearance

Use the `appearance` attribute to change the select's visual style.

```html {.example}
<div class="cs-stack">
  <cs-select appearance="outlined" value="outlined">
    <cs-option value="outlined">outlined</cs-option>
  </cs-select>
  <cs-select appearance="filled" value="filled">
    <cs-option value="filled">filled</cs-option>
  </cs-select>
  <cs-select appearance="filled-outlined" value="filled-outlined">
    <cs-option value="filled-outlined">filled-outlined</cs-option>
  </cs-select>
</div>
```

### Pill

Use the `pill` attribute to give the select rounded edges.

```html {.example}
<cs-select pill placeholder="Select one">
  <cs-option value="option-1">Option 1</cs-option>
  <cs-option value="option-2">Option 2</cs-option>
  <cs-option value="option-3">Option 3</cs-option>
</cs-select>
```

### Size

Use the `size` attribute to change a select's size.

```html {.example}
<div class="cs-stack">
  <cs-select size="xs" placeholder="Extra small">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
  </cs-select>
  <cs-select size="s" placeholder="Small">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
  </cs-select>
  <cs-select size="m" placeholder="Medium">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
  </cs-select>
  <cs-select size="l" placeholder="Large">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
  </cs-select>
  <cs-select size="xl" placeholder="Extra large">
    <cs-option value="option-1">Option 1</cs-option>
    <cs-option value="option-2">Option 2</cs-option>
  </cs-select>
</div>
```

### Disabled

Use the `disabled` attribute to disable a select.

```html {.example}
<cs-select placeholder="Disabled" disabled>
  <cs-option value="option-1">Option 1</cs-option>
  <cs-option value="option-2">Option 2</cs-option>
  <cs-option value="option-3">Option 3</cs-option>
</cs-select>
```

### Clearable

Use the `with-clear` attribute to let people reset their choice. The clear button only appears once an option is selected.

```html {.example}
<cs-select with-clear value="option-1">
  <cs-option value="option-1">Option 1</cs-option>
  <cs-option value="option-2">Option 2</cs-option>
  <cs-option value="option-3">Option 3</cs-option>
</cs-select>
```

### Multiple

To let people choose more than one option, add the `multiple` attribute. Pair it with `with-clear` so a long selection is easy to reset.

```html {.example}
<cs-select label="Notify me about" multiple with-clear>
  <cs-option value="mentions" selected>Mentions</cs-option>
  <cs-option value="replies" selected>Replies</cs-option>
  <cs-option value="reactions">Reactions</cs-option>
  <cs-option value="follows">New followers</cs-option>
  <cs-option value="releases">Releases</cs-option>
</cs-select>
```

:::info
<strong>Multiple selections can grow the control vertically.</strong><br />
Use the `max-options-visible` attribute to cap how many tags show at once before the rest collapse into a count.
:::

### Grouping Options

Use `<cs-divider>` to separate groups of options visually. You can also add `<small>` labels, but note that most assistive technologies won't announce them.

```html {.example}
<cs-select label="Add a language" placeholder="Select one">
  <small>Frontend</small>
  <cs-option value="ts">TypeScript</cs-option>
  <cs-option value="css">CSS</cs-option>
  <cs-divider></cs-divider>
  <small>Backend</small>
  <cs-option value="go">Go</cs-option>
  <cs-option value="rust">Rust</cs-option>
  <cs-option value="python">Python</cs-option>
</cs-select>
```

### Placement

Set the `placement` attribute to control where the listbox opens. Valid placements are `bottom` (default) and `top`; the actual position may flip to keep the panel in the viewport.

```html {.example}
<cs-select placement="top" placeholder="Opens upward">
  <cs-option value="option-1">Option 1</cs-option>
  <cs-option value="option-2">Option 2</cs-option>
  <cs-option value="option-3">Option 3</cs-option>
</cs-select>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements such as `<cs-icon>` inside the combobox.

```html {.example}
<cs-select label="Destination" placeholder="Where to?" with-clear>
  <cs-icon slot="start" name="flight_takeoff"></cs-icon>
  <cs-option value="lax">Los Angeles</cs-option>
  <cs-option value="jfk">New York</cs-option>
  <cs-option value="nrt">Tokyo</cs-option>
</cs-select>
```

### Custom Tags

When multiple options can be selected, supply custom tags by passing a function to the `getTag` property. The function runs for each selected option and can return a string of HTML, a [Lit template](https://lit.dev/docs/templates/overview/), or an [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). Its first argument is the `<cs-option>` element and its second is the tag's index.

Because custom tags render in a shadow root, style them with the `style` attribute in your template, or add your own [parts](/usage/#css-parts) and target them with [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part).

```html {.example}
<cs-select placeholder="Select one" multiple with-clear class="custom-tag">
  <cs-option value="email" selected>
    <cs-icon slot="start" name="mail"></cs-icon>
    Email
  </cs-option>
  <cs-option value="phone" selected>
    <cs-icon slot="start" name="call" variant="fill"></cs-icon>
    Phone
  </cs-option>
  <cs-option value="chat">
    <cs-icon slot="start" name="chat_bubble"></cs-icon>
    Chat
  </cs-option>
</cs-select>

<script type="module">
  await customElements.whenDefined('cs-select');
  const select = document.querySelector('.custom-tag');
  await select.updateComplete;

  select.getTag = (option, index) => {
    // Reuse the icon from the matching cs-option
    const name = option.querySelector('cs-icon[slot="start"]').name;

    // Return a string, a Lit Template, or an HTMLElement.
    // Include data-value so the tag can be removed properly.
    return `
      <cs-tag with-remove data-value="${option.value}">
        <cs-icon name="${name}"></cs-icon>
        ${option.label}
      </cs-tag>
    `;
  };
</script>
```

:::warning
<strong>Only pass content you trust to `getTag()`.</strong><br />
Unsanitized user input rendered into a tag can result in XSS vulnerabilities.
:::

:::info
When using custom tags with `with-remove`, include the `data-value` attribute set to the option's value so the select knows which option to deselect when the tag's remove button is clicked.
:::

### Lazy Loading Options

The select handles options that arrive after the initial render, similar to a native `<select>`:

- **Empty select with a value:** a `<cs-select>` created without options but given a `value` starts with an empty value. When an option whose value matches is added later, the select updates to match.
- **Multiple select with partial options:** a `<cs-select multiple>` with an initial value respects only the options present in the DOM. When the remaining selected options load later — and the user hasn't changed the selection — they're added automatically.

```html {.example}
<form id="lazy-options-example">
  <div>
    <cs-select name="select-1" value="foo" label="Single select (with existing options)">
      <cs-option value="bar">Bar</cs-option>
      <cs-option value="baz">Baz</cs-option>
    </cs-select>

    <cs-divider></cs-divider>

    <cs-button appearance="filled" type="button">Add "foo" option</cs-button>
  </div>

  <br />

  <div>
    <cs-select name="select-2" value="foo" label="Single select (with no existing options)"> </cs-select>

    <cs-divider></cs-divider>

    <cs-button appearance="filled" type="button">Add "foo" option</cs-button>
  </div>

  <br />

  <div>
    <cs-select name="select-3" multiple label="Multiple select (with existing selected options)">
      <cs-option value="bar" selected>Bar</cs-option>
      <cs-option value="baz" selected>Baz</cs-option>
    </cs-select>

    <cs-divider></cs-divider>

    <cs-button appearance="filled" type="button">Add "foo" option (selected)</cs-button>
  </div>

  <br />

  <div>
    <cs-select name="select-4" value="foo" multiple label="Multiple select (with no existing options)"> </cs-select>

    <cs-divider></cs-divider>

    <cs-button appearance="filled" type="button">Add "foo" option</cs-button>
  </div>

  <br /><br />

  <div class="cs-cluster">
    <cs-button appearance="filled" type="reset">Reset</cs-button>
    <cs-button appearance="filled" type="submit" variant="neutral">Show FormData</cs-button>
  </div>

  <br />

  <pre hidden><code id="lazy-options-example-form-data"></code></pre>

  <br />
</form>

<script type="module">
  function addFooOption(e) {
    const addFooButton = e.target.closest("cs-button[type='button']");
    if (!addFooButton) {
      return;
    }
    const select = addFooButton.parentElement.querySelector('cs-select');

    if (select.querySelector("cs-option[value='foo']")) {
      // Foo already exists. no-op.
      return;
    }

    const option = document.createElement('cs-option');
    option.setAttribute('value', 'foo');
    option.selected = true;
    option.innerText = 'Foo';

    // For the multiple select with existing selected options, make the new option selected
    if (select.getAttribute('name') === 'select-3') {
      option.selected = true;
    }

    select.append(option);
  }

  function handleLazySubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const codeElement = document.querySelector('#lazy-options-example-form-data');

    const obj = {};
    for (const key of formData.keys()) {
      const val = formData.getAll(key).length > 1 ? formData.getAll(key) : formData.get(key);
      obj[key] = val;
    }

    codeElement.textContent = JSON.stringify(obj, null, 2);

    const preElement = codeElement.parentElement;
    preElement.removeAttribute('hidden');
  }

  const container = document.querySelector('#lazy-options-example');
  container.addEventListener('click', addFooOption);
  container.addEventListener('submit', handleLazySubmit);
</script>
```

Throughout, the select prioritizes user interactions and explicit selections over programmatic changes, keeping behavior predictable even with dynamically loaded content.
