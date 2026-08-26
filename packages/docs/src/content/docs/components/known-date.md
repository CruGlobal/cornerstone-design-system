---
title: Known Date
category: Forms
hasAnatomy: false
synonyms:
  - dmy input
  - birthday input
  - date fields
  - split date input
  - gov.uk date input
  - manual date entry
use-cases:
  - capture birthdays
  - capture passport and document dates
  - capture any date the user already knows
  - issue date entry
  - expiration date entry
description: "Known dates let users enter dates they already know - birthdays, expirations, document dates - through three separate day, month, and year fields shown in the locale's natural order."
---

Known Date collects a date the user already knows — a birthday, a passport issue date, an expiration — through three separate fields for day, month, and year. It follows the [UK Government Design System date input pattern](https://design-system.service.gov.uk/components/date-input/): a labeled `<fieldset>` wraps three plain `<input>` elements, the user types each part themselves, and the host submits a single canonical ISO date.

```html {.example}
<cs-known-date label="When was your passport issued?"></cs-known-date>
```

:::info
<strong>Need a calendar, ranges, or browsing?</strong><br />
Known Date is intentionally simple: no popup calendar, no auto-advance between fields, and no clever parsing. For anything richer, pair a native `<input type="date">` with the field or reach for a dedicated date picker.
:::

## Form Submission

The hidden form value is canonical ISO 8601 (`YYYY-MM-DD`), regardless of the locale used to render the fields:

| Entry                           | Form value                         |
| ------------------------------- | ---------------------------------- |
| Complete, valid date            | `YYYY-MM-DD` (e.g. `2007-03-27`)   |
| Partial (one or two fields)     | _(empty)_ — omitted from form data |
| Invalid date (e.g. 30 February) | _(empty)_                          |

```html {.example}
<form id="kd-form-demo">
  <cs-known-date name="dob" label="Date of birth" required value="2007-03-27"></cs-known-date>
  <br />
  <cs-button type="submit" appearance="filled" variant="neutral">Submit</cs-button>
</form>

<pre id="kd-form-demo-output"></pre>

<style>
  #kd-form-demo-output {
    margin-block-start: var(--cs-space-m);
    margin-block-end: 0;
    padding: var(--cs-space-s);
    background: var(--cs-color-surface-lowered);
    border-radius: var(--cs-border-radius-m);
    font-size: 0.875em;
  }

  #kd-form-demo-output:empty {
    display: none;
  }
</style>

<script>
  const form = document.getElementById('kd-form-demo');
  const output = document.getElementById('kd-form-demo-output');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const entries = Object.fromEntries(data.entries());
    const formatted = JSON.stringify(entries, null, 2);
    output.textContent = 'Submitted FormData:\n' + formatted;
  });
</script>
```

## Examples

### Initial Value

Set the `value` attribute to an ISO date to pre-fill the three fields.

```html {.example}
<cs-known-date label="Date of birth" value="1990-04-15"></cs-known-date>
```

### Hint

Use the `hint` attribute (or slot) to show an example value. The hint is associated with each field via `aria-describedby`, so screen readers announce it when any field receives focus.

```html {.example}
<cs-known-date label="When was your passport issued?" hint="For example, 27 3 2007"></cs-known-date>
```

### Locale-Aware Field Order

The three fields render in the natural order for the inherited `lang` (or the explicit `locale` attribute). The labels stay the same; only the position changes.

```html {.example}
<div class="cs-stack">
  <cs-known-date label="UK order" lang="en-GB"></cs-known-date>
  <cs-known-date label="US order" lang="en-US"></cs-known-date>
  <cs-known-date label="Japanese order" lang="ja-JP"></cs-known-date>
</div>
```

### Min & Max

Constrain the accepted range with `min` and `max`. Values outside the range are reported as invalid.

```html {.example}
<cs-known-date label="Birthday" min="1900-01-01" max="2099-12-31"></cs-known-date>
```

### Required

Set `required` to make the date input required for form submission. Like other form controls, validation surfaces through the browser's native constraint validation flow: submitting a form with an empty or partially filled date input prevents submission and shows the browser's validation message. No error appears while the user is simply filling in or tabbing between the fields.

```html {.example}
<form>
  <cs-known-date label="Date of birth" required></cs-known-date>
  <br />
  <cs-button type="submit" appearance="filled" variant="neutral">Submit</cs-button>
</form>
```

### Disabled

Use the `disabled` attribute to disable a date field.

```html {.example}
<cs-known-date label="Birthday" value="2007-03-27" disabled></cs-known-date>
```

### Readonly

Use the `readonly` attribute to keep a value visible but uneditable. Unlike `disabled`, a readonly date field stays focusable and its value is still submitted with the form.

```html {.example}
<cs-known-date label="Member since" value="2007-03-27" readonly></cs-known-date>
```

### Autocomplete

Set `autocomplete="bday"` to enable browser autofill for birthdays. The host expands the family into per-field tokens (`bday-day`, `bday-month`, `bday-year`).

```html {.example}
<cs-known-date label="Date of birth" autocomplete="bday"></cs-known-date>
```

### Size

```html {.example}
<div class="cs-stack">
  <cs-known-date label="Extra small" size="xs"></cs-known-date>
  <cs-known-date label="Small" size="s"></cs-known-date>
  <cs-known-date label="Medium (default)" size="m"></cs-known-date>
  <cs-known-date label="Large" size="l"></cs-known-date>
  <cs-known-date label="Extra large" size="xl"></cs-known-date>
</div>
```

### Appearance

```html {.example}
<div class="cs-stack">
  <cs-known-date label="Outlined (default)" appearance="outlined"></cs-known-date>
  <cs-known-date label="Filled" appearance="filled"></cs-known-date>
  <cs-known-date label="Filled outlined" appearance="filled-outlined"></cs-known-date>
</div>
```

### Pill

Use the `pill` attribute to give each field rounded edges.

```html {.example}
<cs-known-date label="Pill" pill></cs-known-date>
```

<!-- Demo styles -->
<style>
  cs-known-date {
    max-width: 360px;
  }
</style>
