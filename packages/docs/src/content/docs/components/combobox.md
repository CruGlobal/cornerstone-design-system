---
title: Combobox
category: Forms
synonyms:
  - autocomplete
  - typeahead
  - filterable select
  - searchable select
  - tag input
use-cases:
  - pick from a long list
  - search as you type
  - multi pick with tags
  - options loaded from a server
description: "Comboboxes pair a text field with a list of options, so people can type to narrow a long list and then pick one or more values."
---

```html {.example}
<cs-combobox label="Country" placeholder="Start typing a country">
  <cs-option value="ar">Argentina</cs-option>
  <cs-option value="au">Australia</cs-option>
  <cs-option value="br">Brazil</cs-option>
  <cs-option value="ca">Canada</cs-option>
  <cs-option value="gh">Ghana</cs-option>
  <cs-option value="in">India</cs-option>
  <cs-option value="ke">Kenya</cs-option>
  <cs-option value="mx">Mexico</cs-option>
  <cs-option value="ng">Nigeria</cs-option>
  <cs-option value="ph">Philippines</cs-option>
  <cs-option value="za">South Africa</cs-option>
  <cs-option value="us">United States</cs-option>
</cs-combobox>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

:::caution
`<cs-combobox>` is experimental. Its API can still change in a minor release.
:::

### Combobox or select?

Reach for a combobox when the list is long enough that people would rather type than scroll, when the options come from a server, or when people may add a value the list doesn't have. Reach for [`<cs-select>`](/components/select) when the list is short and fixed, so people can see every choice at a glance. A select never asks anyone to type, which suits touch screens and short lists better.

## Examples

### Label

Use the `label` attribute to give the combobox an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-combobox label="Language">
  <cs-option value="en">English</cs-option>
  <cs-option value="es">Spanish</cs-option>
  <cs-option value="fr">French</cs-option>
  <cs-option value="pt">Portuguese</cs-option>
</cs-combobox>
```

### Hint

Add a descriptive hint with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-combobox label="Campus" hint="Type part of the campus name.">
  <cs-option value="asu">Arizona State University</cs-option>
  <cs-option value="osu">Ohio State University</cs-option>
  <cs-option value="ucf">University of Central Florida</cs-option>
  <cs-option value="ut">University of Texas</cs-option>
</cs-combobox>
```

### Initial Value

Add `selected` to an option, or set `value` on the combobox, to start with a pick. Its label shows in the field.

```html {.example}
<cs-combobox label="Time zone">
  <cs-option value="america/chicago">Central Time</cs-option>
  <cs-option value="america/denver">Mountain Time</cs-option>
  <cs-option value="america/new_york" selected>Eastern Time</cs-option>
  <cs-option value="america/los_angeles">Pacific Time</cs-option>
</cs-combobox>
```

### How Filtering Works

Typing narrows the list to the options whose label contains what was typed, ignoring case. The first match is highlighted, and Enter, Tab or a tap picks it. Opened with nothing typed, the list shows every option, with a check on the current pick. When nothing matches, the list stays open and says so.

Only a picked option's value is ever submitted. If someone types and then leaves the field without picking, the field shows the last pick again. Emptying the field and leaving it clears the value. Closing the list any other way, with the chevron, Alt+Up Arrow or `hide()`, does the same as leaving. Only Escape always throws away what was typed and puts back the last pick's label.

When the field gains focus with a pick in it, its label is selected, so typing replaces it rather than adding to it.

`input` and `change` fire when the value changes, not on each keystroke. Read `inputValue` for the text in the field.

### Custom Filter

Set the `filter` property to change how options match. It receives the option and the typed text, and returns `true` to show the option. This one matches the start of the label only.

```html {.example}
<cs-combobox label="Fruit" class="prefix-filter">
  <cs-option value="apple">Apple</cs-option>
  <cs-option value="banana">Banana</cs-option>
  <cs-option value="grape">Grape</cs-option>
  <cs-option value="pineapple">Pineapple</cs-option>
</cs-combobox>

<script type="module">
  await customElements.whenDefined('cs-combobox');
  const combobox = document.querySelector('.prefix-filter');

  // Typing "ap" shows Apple, but not Grape or Pineapple
  combobox.filter = (option, query) => option.label.toLowerCase().startsWith(query.toLowerCase());
</script>
```

### Multiple

Add the `multiple` attribute to let people pick more than one option. Picks become tags, the field clears after each pick so the next search starts fresh, and Backspace in an empty field removes the last tag.

```html {.example}
<cs-combobox label="Ministries" placeholder="Add a ministry" multiple with-clear>
  <cs-option value="athletes">Athletes in Action</cs-option>
  <cs-option value="campus" selected>Campus</cs-option>
  <cs-option value="familylife">FamilyLife</cs-option>
  <cs-option value="jesus-film" selected>Jesus Film</cs-option>
  <cs-option value="military">Military</cs-option>
</cs-combobox>
```

:::info
Use the `max-options-visible` attribute to cap how many tags show before the rest collapse into a count.
:::

### Custom Values

Add `allow-custom-value` to keep typed text that matches no option as the value. Nothing is highlighted while typing, so Enter, Tab, leaving the field or closing the list keeps exactly what was typed. Escape throws it away. Text that equals an option's label picks that option. This works with a single value only, and is ignored when `multiple` is set.

```html {.example}
<cs-combobox label="Job title" allow-custom-value>
  <cs-option value="Campus Staff">Campus Staff</cs-option>
  <cs-option value="Team Leader">Team Leader</cs-option>
  <cs-option value="Regional Director">Regional Director</cs-option>
</cs-combobox>
```

### Creating Options

Add `allow-create` to offer a create option when what was typed matches nothing. Picking it emits `cs-create`, then adds a `<cs-option>` with the typed text as its value and label, and picks it. Call `preventDefault()` on the event to check, change or save the new value yourself first. If a framework renders the options, do that and add the option through the framework, so its next render keeps it. A value already picked stays picked: typing it again does not create it twice.

```html {.example}
<cs-combobox label="Tags" multiple allow-create class="create-example">
  <cs-option value="prayer">prayer</cs-option>
  <cs-option value="outreach">outreach</cs-option>
  <cs-option value="follow-up">follow-up</cs-option>
</cs-combobox>

<script type="module">
  await customElements.whenDefined('cs-combobox');
  const combobox = document.querySelector('.create-example');

  combobox.addEventListener('cs-create', (event) => {
    // Keep tags lowercase: stop the default, then add and pick the cleaned-up value
    event.preventDefault();
    const value = event.detail.inputValue.toLowerCase();
    const option = document.createElement('cs-option');
    option.value = value;
    option.textContent = value;
    combobox.append(option);
    combobox.value = [...combobox.value, value];
  });
</script>
```

### Grouping Options

Use `<cs-divider>` to separate groups of options visually. You can also add `<small>` labels, but most assistive technologies won't announce them. Dividers and labels hide while the list is filtered.

```html {.example}
<cs-combobox label="Role">
  <small>Students</small>
  <cs-option value="freshman">Freshman</cs-option>
  <cs-option value="senior">Senior</cs-option>
  <cs-divider></cs-divider>
  <small>Staff</small>
  <cs-option value="intern">Intern</cs-option>
  <cs-option value="director">Director</cs-option>
</cs-combobox>
```

### Status Messages

The list shows a status row in place of options: `empty` when there are no options and nothing was typed, and `no-results` when nothing matches. In server mode it can also show `loading` and `error`. Slot your own text into any of them. Keep it short and plain, with no links or buttons, since it is also read aloud.

```html {.example}
<cs-combobox label="Saved search" placeholder="Search your saved searches">
  <cs-option value="spring">Spring outreach</cs-option>
  <cs-option value="fall">Fall retreat</cs-option>
  <span slot="no-results">No saved search by that name</span>
</cs-combobox>
```

### Server Mode

Set the `dataSource` property to load options from a server as people type. When an answer lands, it replaces the options, dividers and group labels in the list, and leaves everything else inside the combobox alone, such as a slotted label or hint. It is called with the typed text and an `AbortSignal`: when the list opens, right away, and after typing pauses for `filter-debounce` milliseconds (250 by default). A newer request aborts the one before it, so pass the signal on to `fetch()`. `loading` is true from the keystroke that schedules a request, so while the answer for new text is on its way the list says it is loading rather than showing results for older text. The combobox stops filtering on its own and shows what the server returns. A failed request shows the `error` row in place of whatever was showing, so nothing from an older answer can be picked, and tries again on the next open or keystroke.

Return option data such as `{ value, label, disabled }`, real DOM nodes such as `<cs-option>` and `<cs-divider>`, or a [Lit template](https://lit.dev/docs/templates/overview/).

```html {.example}
<cs-combobox label="City" placeholder="Search cities" class="server-example"></cs-combobox>

<script type="module">
  await customElements.whenDefined('cs-combobox');
  const combobox = document.querySelector('.server-example');
  const cities = ['Accra', 'Bangkok', 'Bogotá', 'Cairo', 'Lagos', 'Lima', 'Manila', 'Nairobi', 'Orlando', 'Seoul'];

  // Stands in for `fetch(url, { signal })`
  combobox.dataSource = (query, signal) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const matches = cities.filter((city) => city.toLowerCase().includes(query.toLowerCase()));
        resolve(matches.map((city) => ({ value: city.toLowerCase(), label: city })));
      }, 400);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(signal.reason);
      });
    });
</script>
```

:::warning
<strong>The combobox never parses HTML.</strong><br />
A `dataSource` that returns a string is refused: the request fails and the `error` row shows. This is on purpose, so text from a server can't inject markup into the page. Return option data, DOM nodes or a Lit template instead.
:::

Call `reload()` to request options again for what is in the field, for example after saving something new on the server. With a `dataSource`, it resolves once the new options are in the list.

### Server Mode with Events

When your framework renders the options itself, set the `server` attribute instead of a `dataSource`. The combobox stops filtering and emits `cs-options-request` with the query and an `AbortSignal`. Replace the options for that query, then set `loading` back to `false`. Skip the update when the signal is already aborted.

```html {.example}
<cs-combobox label="Team member" server class="event-example"></cs-combobox>

<script type="module">
  await customElements.whenDefined('cs-combobox');
  const combobox = document.querySelector('.event-example');
  const people = ['Abena Mensah', 'Samuel Okafor', 'Grace Kim', 'Luis Ortega', 'Priya Nair'];

  combobox.addEventListener('cs-options-request', ({ detail: { query, signal } }) => {
    setTimeout(() => {
      if (signal.aborted) {
        return;
      }
      const matches = people.filter((name) => name.toLowerCase().includes(query.toLowerCase()));

      // Replace only the options, so a slotted label, hint or icon stays
      combobox.querySelectorAll(':scope > cs-option, :scope > cs-divider').forEach((el) => el.remove());
      combobox.append(
        ...matches.map((name) => {
          const option = document.createElement('cs-option');
          option.value = name;
          option.textContent = name;
          return option;
        }),
      );
      combobox.loading = false;
    }, 300);
  });
</script>
```

### Custom Tags

When `multiple` is set, pass a function to the `getTag` property to render each tag yourself. It receives the `<cs-option>` and the tag's index, and can return a Lit template, an `HTMLElement`, or a string. A string is shown as plain text. It is never parsed as HTML.

```html {.example}
<cs-combobox label="Contact by" multiple class="custom-tags">
  <cs-option value="email" selected>Email</cs-option>
  <cs-option value="phone" selected>Phone</cs-option>
  <cs-option value="text">Text message</cs-option>
</cs-combobox>

<script type="module">
  await customElements.whenDefined('cs-combobox');
  const combobox = document.querySelector('.custom-tags');

  combobox.getTag = (option) => {
    const tag = document.createElement('cs-tag');
    tag.withRemove = true;
    // data-value tells the combobox which option the remove button removes
    tag.dataset.value = option.value;
    tag.textContent = `✓ ${option.label}`;
    return tag;
  };
</script>
```

### Appearance

Use the `appearance` attribute to change the combobox's visual style.

```html {.example}
<div class="cs-stack">
  <cs-combobox appearance="outlined" placeholder="outlined">
    <cs-option value="one">One</cs-option>
  </cs-combobox>
  <cs-combobox appearance="filled" placeholder="filled">
    <cs-option value="one">One</cs-option>
  </cs-combobox>
  <cs-combobox appearance="filled-outlined" placeholder="filled-outlined">
    <cs-option value="one">One</cs-option>
  </cs-combobox>
</div>
```

### Pill

Use the `pill` attribute to give the combobox rounded edges.

```html {.example}
<cs-combobox pill placeholder="Search">
  <cs-option value="one">One</cs-option>
  <cs-option value="two">Two</cs-option>
</cs-combobox>
```

### Size

Use the `size` attribute to change a combobox's size.

```html {.example}
<div class="cs-stack">
  <cs-combobox size="xs" placeholder="Extra small"><cs-option value="one">One</cs-option></cs-combobox>
  <cs-combobox size="s" placeholder="Small"><cs-option value="one">One</cs-option></cs-combobox>
  <cs-combobox size="m" placeholder="Medium"><cs-option value="one">One</cs-option></cs-combobox>
  <cs-combobox size="l" placeholder="Large"><cs-option value="one">One</cs-option></cs-combobox>
  <cs-combobox size="xl" placeholder="Extra large"><cs-option value="one">One</cs-option></cs-combobox>
</div>
```

### Disabled

Use the `disabled` attribute to disable a combobox.

```html {.example}
<cs-combobox placeholder="Disabled" disabled>
  <cs-option value="one">One</cs-option>
</cs-combobox>
```

### Clearable

Use the `with-clear` attribute to add a clear button. It appears once there is a pick or text in the field.

```html {.example}
<cs-combobox label="Country" with-clear value="ca">
  <cs-option value="ca">Canada</cs-option>
  <cs-option value="mx">Mexico</cs-option>
  <cs-option value="us">United States</cs-option>
</cs-combobox>
```

### Placement

Set the `placement` attribute to control where the list opens. Valid placements are `bottom` (default) and `top`; the actual position may flip to keep the list in the viewport.

```html {.example}
<cs-combobox placement="top" placeholder="Opens upward">
  <cs-option value="one">One</cs-option>
  <cs-option value="two">Two</cs-option>
</cs-combobox>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements such as `<cs-icon>` inside the combobox.

```html {.example}
<cs-combobox label="Search people" placeholder="Name or email">
  <cs-icon slot="start" name="search"></cs-icon>
  <cs-option value="abena">Abena Mensah</cs-option>
  <cs-option value="grace">Grace Kim</cs-option>
</cs-combobox>
```

## Keyboard and Screen Readers

The combobox follows the ARIA Authoring Practices pattern for an editable combobox with list autocomplete. Focus stays in the text field the whole time.

| Key | What it does |
| --- | --- |
| Typing | Opens the list and narrows it. The first match is highlighted. |
| Down Arrow / Up Arrow | Opens the list, or moves the highlight. Disabled options are skipped. |
| Home / End | Moves the caret to the start or end of the text. If you had arrowed into the list, the highlight goes back to the first match of what you typed, or is cleared when nothing is typed. |
| Enter | Picks the highlighted option, or creates the typed value when the create option is highlighted. With the list closed, submits the form. |
| Tab | Picks or creates the highlighted option if you typed or moved to it, then moves on. |
| Escape | Closes the list, throws away what was typed and puts back the last pick's label. |
| Alt+Down Arrow / Alt+Up Arrow | Opens the list without moving the highlight / closes it, keeping the text as leaving the field does. |
| Backspace | In an empty field with `multiple`, removes the last tag. |

The text field points at the highlighted option through `aria-activedescendant`, which the combobox sets with element reflection because the field and the options sit on opposite sides of a shadow root. A polite live region reads the result count as the list narrows, and each status message: empty, no results, loading and error. Where a browser lacks element reflection, the live region also reads the highlighted option. No screen reader test of this component is recorded yet.
