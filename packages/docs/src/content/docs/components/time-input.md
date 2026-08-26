---
title: Time Input
category: Forms
synonyms:
  - time input
  - clock input
  - timepicker
  - time field
  - time of day input
  - clock picker
use-cases:
  - enter a time of day in a form
  - pick a time from a column-roulette popup
  - meeting time selection
  - appointment time entry
  - scheduled event time
description: "Time pickers let users enter a time through a segmented field or select one visually from a popup column picker. They support 12- and 24-hour formats, optional seconds, and locale-aware segment order."
---

Time Input is the time-of-day counterpart to [Date Input](/components/date-input). It renders a segmented input with hour, minute, optional seconds, and optional AM/PM spinbutton segments in the user's locale order, alongside a popup column picker modeled on Chrome's native time UI.

Type digits to fill the focused segment (focus auto-advances when a segment can accept no further digit), use the arrow keys to step through values, and press `Alt+Down Arrow` to open the popup. The entire segmented input is one tab stop.

```html {.example}
<cs-time-input label="Pick a time"></cs-time-input>
```

```html {.example .anatomy-only}
<cs-time-input label="Meeting time" hint="Choose a time that works for you." value="14:30">
  <cs-icon slot="start" name="schedule"></cs-icon>
</cs-time-input>
```

## Form Submission

The hidden form value is canonical 24-hour time, regardless of the user's locale or `hour-format`:

| Input                        | Form value | Notes                                                           |
| ---------------------------- | ---------- | --------------------------------------------------------------- |
| Whole-minute steps (default) | `HH:mm`    | `step="60"` or any multiple; e.g. `14:30`                       |
| Sub-minute steps             | `HH:mm:ss` | When `step` < 60 and the seconds segment shows; e.g. `14:30:15` |
| 12-hour UI                   | 24-hour    | `2:30 PM` submits as `14:30`                                    |
| Partial input                | _(empty)_  | Until every required segment is filled                          |

The example below renders a working form. Submit it (or change the time) and watch the console. The time input submits its value just like a native `<input type="time">`, regardless of how the user typed or what locale they used.

```html {.example}
<form id="tp-form-demo">
  <cs-time-input name="meeting_time" label="Meeting time" required value="14:30"></cs-time-input>
  <br />
  <cs-button type="submit" appearance="filled" variant="neutral">Submit</cs-button>
</form>
<pre id="tp-form-demo-output"></pre>
<style>
  #tp-form-demo-output {
    margin-block-start: var(--cs-space-m);
    margin-block-end: 0;
    padding: var(--cs-space-s);
    background: var(--cs-color-surface-lowered);
    border-radius: var(--cs-border-radius-m);
    font-size: 0.875em;
  }

  #tp-form-demo-output:empty {
    display: none;
  }
</style>

<script>
  const form = document.getElementById('tp-form-demo');
  const output = document.getElementById('tp-form-demo-output');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const entries = Object.fromEntries(data.entries());
    const formatted = JSON.stringify(entries, null, 2);
    console.log('Submitted FormData:', entries);
    output.textContent = 'Submitted FormData:\n' + formatted;
  });
</script>
```

## Examples

### Initial Value

Set the `value` attribute to a time string to pre-populate the input.

```html {.example}
<cs-time-input label="Meeting time" value="14:30"></cs-time-input>
```

### Label

Use the `label` attribute to give the time input an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-time-input label="What time works for you?"></cs-time-input>
```

### Hint

Add descriptive hint to a time input with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-time-input label="Wake up" hint="Set the time your alarm should go off."></cs-time-input>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` inside the input.

```html {.example}
<div class="cs-stack">
  <cs-time-input label="Start">
    <cs-icon name="hourglass_top" slot="start"></cs-icon>
  </cs-time-input>
  <cs-time-input label="End">
    <cs-icon name="hourglass_bottom" slot="end"></cs-icon>
  </cs-time-input>
</div>
```

### Clearable

Add the `with-clear` attribute to let users wipe their selection in a single click. The clear button only appears once a value is set.

```html {.example}
<cs-time-input label="Alarm" with-clear value="07:00"></cs-time-input>
```

### Min & Max

Constrain the selectable range. The picker delegates reversed-range (overnight) semantics to the native `<input type="time">`, so `min="22:00" max="06:00"` represents an overnight range.

```html {.example}
<cs-time-input label="Office hours" min="09:00" max="17:00"></cs-time-input>
```

### Step

The `step` attribute is in **seconds**, matching the HTML spec. The default is `60` (one minute). Set `step` below `60` to expose a seconds segment; set it to a multiple of `60` to populate the minute column at that stride.

```html {.example}
<div class="cs-stack">
  <cs-time-input label="Every 5 minutes" step="300"></cs-time-input>
  <cs-time-input label="With seconds" step="1"></cs-time-input>
</div>
```

### 12-Hour vs 24-Hour

By default, `hour-format="auto"` follows the resolved locale. Pass `hour-format="12"` or `hour-format="24"` to override.

```html {.example}
<div class="cs-stack">
  <cs-time-input label="12-hour" hour-format="12" value="09:00"></cs-time-input>
  <cs-time-input label="24-hour" hour-format="24" value="09:00"></cs-time-input>
</div>
```

### Localized

The segment order, separators, and AM/PM strings all derive from the page's locale. Set the `lang` attribute on the host (or an ancestor) to change locales.

```html {.example}
<div class="cs-stack">
  <cs-time-input lang="en-US" label="English (US)" value="14:30"></cs-time-input>
  <cs-time-input lang="en-GB" label="English (UK)" value="14:30"></cs-time-input>
  <cs-time-input lang="de-DE" label="German" value="14:30"></cs-time-input>
</div>
```

### "Now" Button

Add a quick-pick "Now" button in the popup footer with `with-now`.

```html {.example}
<cs-time-input label="When?" with-now></cs-time-input>
```

### Size

Use the `size` attribute to match the time input to surrounding form controls.

```html {.example}
<div class="cs-stack">
  <cs-time-input size="xs" label="Extra small"></cs-time-input>
  <cs-time-input size="s" label="Small"></cs-time-input>
  <cs-time-input size="m" label="Medium"></cs-time-input>
  <cs-time-input size="l" label="Large"></cs-time-input>
  <cs-time-input size="xl" label="Extra large"></cs-time-input>
</div>
```

### Appearance

Use the `appearance` attribute to switch between the default outlined input, a filled background, or a filled input with an outlined border.

```html {.example}
<div class="cs-stack">
  <cs-time-input appearance="outlined" label="Outlined"></cs-time-input>
  <cs-time-input appearance="filled" label="Filled"></cs-time-input>
  <cs-time-input appearance="filled-outlined" label="Filled outlined"></cs-time-input>
</div>
```

### Pill

Use the `pill` attribute to give the input fully rounded edges.

```html {.example}
<cs-time-input pill label="Pill"></cs-time-input>
```

### Disabled

Use the `disabled` attribute to disable the time input entirely. Disabled time inputs don't accept input, are skipped during tabbing, and don't submit a value with the form.

```html {.example}
<cs-time-input label="Disabled" value="09:00" disabled></cs-time-input>
```

### Readonly

Use the `readonly` attribute to make the time input non-editable while still allowing it to be focused and to submit its value with the form. The popup still opens for browsing.

```html {.example}
<cs-time-input label="Read-only" value="09:00" readonly></cs-time-input>
```
