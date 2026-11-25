---
title: Date Input
category: Forms
synonyms:
  - date field
  - date picker input
  - datepicker
  - calendar input
  - segmented date input
  - due date input
use-cases:
  - enter a date in a form
  - type a date or pick one from a calendar
  - choose an appointment, booking or due date
  - block out dates that can't be booked
description: Date inputs let users type a date into month, day and year segments in their locale's order, or pick one from a calendar in a popup.
---

Date Input is a form control for one date. People type it into month, day and year segments, or pick it from a
[Date Picker](/components/date-picker) in a popup. It submits the date as `YYYY-MM-DD` whatever the locale. For a date
people already know by heart, such as a birthday, [Known Date](/components/known-date) is simpler. Its time-of-day
counterpart is [Time Input](/components/time-input).

```html {.example}
<cs-date-input label="Due date"></cs-date-input>
```

Type digits to fill the focused segment. Focus moves on when a segment can take no more digits, or when you type a
separator such as `/`. The arrow keys step a segment, and Alt+Down Arrow opens the calendar. The whole field is one tab
stop.

## Examples

### Initial Value

Set `value` to a date as `YYYY-MM-DD`. A value that isn't a real date, such as `2026-02-30`, leaves the field empty.

```html {.example}
<cs-date-input label="Due date" value="2026-05-11"></cs-date-input>
```

### Label

Use the `label` attribute to give the date input an accessible label. For labels that contain HTML, use the `label`
slot instead.

```html {.example}
<cs-date-input label="When does the trip start?"></cs-date-input>
```

### Hint

Add a hint with the `hint` attribute. For a hint that contains HTML, use the `hint` slot instead. Empty segments show
dashes rather than a format, and each segment's name is read out to screen readers, so the hint is the place for
anything else people need to know about the date.

```html {.example}
<cs-date-input label="Start date" hint="The first day you can volunteer."></cs-date-input>
```

### Min & Max

Use `min` and `max` to limit the date, both as `YYYY-MM-DD` and both included. The calendar crosses out days outside
them. A typed date outside them makes the field invalid with `rangeUnderflow` or `rangeOverflow`.

```html {.example}
<cs-date-input label="Arrival" min="2026-05-08" max="2026-06-12" value="2026-05-15"></cs-date-input>
```

### Disabling Dates

Use `disabled-dates` to block out single dates, as a whitespace-separated list of `YYYY-MM-DD` dates, and
`disabled-days-of-week` to block out weekdays, as a space-separated list of `sun`, `mon`, `tue`, `wed`, `thu`, `fri` and
`sat`. The calendar crosses them out and skips them.

```html {.example}
<cs-date-input
  label="Delivery day"
  disabled-dates="2026-12-24 2026-12-25 2026-12-31"
  disabled-days-of-week="sat sun"
  value="2026-12-15"
></cs-date-input>
```

A blocked date can still be typed. It stays in `value`, as a date outside `min` and `max` does, and the field is
invalid with `badInput` until it changes, so the form won't submit it.

### Today

The calendar underlines today, and an empty segment steps from today's month, day or year. By default today comes from
the user's clock and time zone. Set `today` to a `YYYY-MM-DD` date when your app's day follows another time zone, or so
a page rendered on the server marks the same day the browser will.

```html {.example}
<cs-date-input label="Event date" today="2026-07-04"></cs-date-input>
```

### First Day of the Week

Use `first-day-of-week` to choose the calendar's first column instead of taking it from the locale. It takes `sun`,
`mon`, `tue`, `wed`, `thu`, `fri`, `sat` or the default, `auto`.

```html {.example}
<cs-date-input label="Week of" first-day-of-week="mon" value="2026-05-11"></cs-date-input>
```

### Localization

The order of the segments and the separators between them come from the inherited `lang`, and so does the calendar.
Set `locale` to a BCP-47 tag to use another locale for both. The value is always `YYYY-MM-DD`.

```html {.example}
<div class="cs-stack">
  <cs-date-input lang="en-US" label="English (US)" value="2026-05-11"></cs-date-input>
  <cs-date-input lang="en-GB" label="English (UK)" value="2026-05-11"></cs-date-input>
  <cs-date-input lang="de" label="Deutsch" value="2026-05-11"></cs-date-input>
  <cs-date-input lang="ja" label="日本語" value="2026-05-11"></cs-date-input>
</div>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` inside the input.

```html {.example}
<div class="cs-stack">
  <cs-date-input label="Departure">
    <cs-icon slot="start" name="flight_takeoff"></cs-icon>
  </cs-date-input>
  <cs-date-input label="Return">
    <cs-icon slot="end" name="flight_land"></cs-icon>
  </cs-date-input>
</div>
```

### Clearable

Add `with-clear` to show a clear button once anything has been typed or picked. It clears every segment, emits
`cs-clear`, `input` and `change`, and puts focus on the first segment.

```html {.example}
<cs-date-input label="Follow-up" with-clear value="2026-05-11"></cs-date-input>
```

### Size

Use `size` to match the date input to the form controls around it. The calendar in the popup scales with it.

```html {.example}
<div class="cs-stack">
  <cs-date-input size="xs" label="Extra small"></cs-date-input>
  <cs-date-input size="s" label="Small"></cs-date-input>
  <cs-date-input size="m" label="Medium"></cs-date-input>
  <cs-date-input size="l" label="Large"></cs-date-input>
  <cs-date-input size="xl" label="Extra large"></cs-date-input>
</div>
```

### Appearance

Use `appearance` to switch between the default outlined input, a filled background, or a filled input with an
outlined border.

```html {.example}
<div class="cs-stack">
  <cs-date-input appearance="outlined" label="Outlined"></cs-date-input>
  <cs-date-input appearance="filled" label="Filled"></cs-date-input>
  <cs-date-input appearance="filled-outlined" label="Filled outlined"></cs-date-input>
</div>
```

### Pill

Use `pill` to give the input fully rounded edges.

```html {.example}
<cs-date-input pill label="Pill"></cs-date-input>
```

### Disabled

Use `disabled` to turn the date input off. It can't be focused, its popup can't open, and it doesn't submit a value.

```html {.example}
<cs-date-input label="Disabled" value="2026-05-11" disabled></cs-date-input>
```

### Readonly

Use `readonly` to show a date that can't be changed. The segments can still be focused, the value still submits, and
the expand button still opens the calendar for browsing.

```html {.example}
<cs-date-input label="Read-only" value="2026-05-11" readonly></cs-date-input>
```

### Popup Placement

The popup opens below the field, aligned to its start (`placement="bottom-start"`), and flips above it when there isn't
room. Use `placement` to prefer another side, and `distance` to set the gap in pixels.

```html {.example}
<cs-date-input label="Above the field" placement="top-start" distance="4"></cs-date-input>
```

## Form Submission

The date input submits its date under its `name`, as `YYYY-MM-DD`, whatever the locale or the order of the segments.

| Entry                                | Form value                                     |
| ------------------------------------ | ---------------------------------------------- |
| A complete date                      | `YYYY-MM-DD`, such as `2026-05-11`             |
| Empty                                | Nothing: the field leaves the form data        |
| Partly filled, or not a real date    | Nothing, and the field is invalid (`badInput`) |

Submit the form below and the result shows what it sent.

```html {.example}
<form class="date-input-form cs-stack">
  <cs-date-input name="due_on" label="Due date" required value="2026-05-11"></cs-date-input>
  <div><cs-button type="submit">Submit</cs-button></div>
  <p>Submitted: <output></output></p>
</form>

<script type="module">
  const form = document.querySelector('.date-input-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.querySelector('output').textContent = new URLSearchParams(new FormData(form)).toString();
  });
</script>
```

## Validation

Validity surfaces through the browser's own constraint validation, the same way a native `<input type="date">` does:
submitting the form shows the browser's message on the field.

| The field holds                                         | Validity flag     | `value`        |
| ------------------------------------------------------- | ----------------- | -------------- |
| Nothing, with `required`                                | `valueMissing`    | Empty          |
| Some segments but not all, or a date such as 31 April   | `badInput`        | Empty          |
| A date before `min`                                     | `rangeUnderflow`  | The date       |
| A date after `max`                                      | `rangeOverflow`   | The date       |
| A date on `disabled-dates` or `disabled-days-of-week`   | `badInput`        | The date       |

A year is held until it has four digits, so `2`, `20` and `202` never reach `value`. A shorter year commits when focus
leaves the segment, so typing `26` and moving on gives the year 0026.

## Keyboard

| Key                         | In a segment                                                    |
| --------------------------- | --------------------------------------------------------------- |
| 0 to 9                      | Types into the segment, then moves on when it is full           |
| Up Arrow / Down Arrow       | Steps the segment, wrapping without changing the others         |
| Left Arrow / Right Arrow    | Moves to the previous or next segment                           |
| Home / End                  | Moves to the first or last segment                              |
| Backspace / Delete          | Clears the segment                                              |
| `/`, `.`, `-` or space      | Moves to the next segment                                       |
| Alt+Down Arrow              | Opens the calendar and moves focus onto its selected day        |
| Alt+Up Arrow / Escape       | Closes the calendar                                             |
| Enter                       | Commits what has been typed and closes the calendar             |

In the calendar, the keys follow [Date Picker](/components/date-picker#keyboard). Enter or Space picks the focused day,
which sets the value, closes the popup and puts focus back in the field. Escape and Alt+Up Arrow close the popup the same
way, and Tab out of the calendar closes it too.

## Listening for Changes

The date input emits `input` on every edit, including a day picked from the calendar and a clear, even while the date is
incomplete. It emits `change` when the value changes: once a typed date is complete, when a day is picked, and when an
edit or a clear empties a complete date. Read the date from `value`, or from `valueAsDate`, a `Date` at local midnight.

```html {.example}
<div class="date-input-events cs-stack">
  <cs-date-input label="Due date"></cs-date-input>
  <p>Value: <output>(empty)</output></p>
</div>

<script type="module">
  const container = document.querySelector('.date-input-events');
  const input = container.querySelector('cs-date-input');

  input.addEventListener('change', () => {
    container.querySelector('output').textContent = input.value || '(empty)';
  });
</script>
```

The popup emits `cs-show`, `cs-after-show`, `cs-hide` and `cs-after-hide`. Cancel `cs-show` or `cs-hide` to keep it
closed or open.
