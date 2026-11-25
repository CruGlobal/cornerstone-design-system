---
title: Date Picker
category: Forms
synonyms:
  - calendar
  - datepicker
  - inline calendar
  - month view
  - day picker
use-cases:
  - pick one date from a calendar
  - choose an appointment, event or due date
  - show a month people can browse
  - block out dates that can't be booked
description: Date pickers show a month as a grid of days, so people can browse the calendar and pick one date.
---

Date Picker is an inline calendar. It always shows a month, and it is not a form control, so it does not submit
with a form on its own (see [Submitting With a Form](#submitting-with-a-form)). For a date people already know, such
as a birthday, use [Known Date](/components/known-date) instead.

```html {.example}
<cs-date-picker></cs-date-picker>
```

## Examples

### Initial Value

Set `value` to a date as `YYYY-MM-DD`. The picker opens on that date's month. A value that isn't a real date, such as
`2026-02-30`, shows no selection.

```html {.example}
<cs-date-picker value="2026-05-11"></cs-date-picker>
```

`value` reflects to the attribute, so the attribute always holds the date the user picked.

### Listening for Changes

The picker emits `cs-change` when the user picks a date. Read the new date from the picker's `value`. Moving between
days and months does not emit it, and neither does picking the date that is already selected.

```html {.example}
<div class="date-picker-change">
  <cs-date-picker value="2026-05-11"></cs-date-picker>
  <p>Picked: <output>2026-05-11</output></p>
</div>

<script type="module">
  const container = document.querySelector('.date-picker-change');
  const picker = container.querySelector('cs-date-picker');
  const output = container.querySelector('output');

  picker.addEventListener('cs-change', () => {
    output.textContent = picker.value;
  });
</script>
```

### Min & Max

Use `min` and `max` to limit which dates can be picked. Both are `YYYY-MM-DD` and both are included. Days outside them
are crossed out and skipped by the keyboard, and the navigation buttons stop at their months.

```html {.example}
<cs-date-picker min="2026-05-08" max="2026-06-12" value="2026-05-15"></cs-date-picker>
```

### Disabling Dates

Use `disabled-dates` to block out single dates, such as holidays. It takes a whitespace-separated list of `YYYY-MM-DD`
dates, so one per line works too. Entries that aren't dates are ignored.

```html {.example}
<cs-date-picker value="2026-12-15" disabled-dates="2026-12-24 2026-12-25 2026-12-31"></cs-date-picker>
```

### Disabling Days of the Week

Use `disabled-days-of-week` to block out weekdays. It takes a space-separated list of `sun`, `mon`, `tue`, `wed`,
`thu`, `fri` and `sat`, in any order.

```html {.example}
<cs-date-picker disabled-days-of-week="sat sun" value="2026-05-15"></cs-date-picker>
```

A value that falls on a blocked date still shows as selected, so the picker never hides what it holds.

### Today

The picker underlines today. By default today comes from the user's own clock and time zone. Set `today` to a
`YYYY-MM-DD` date when your app's day follows another time zone, such as the one a booking is for, or so a page
rendered on the server marks the same day the browser will.

```html {.example}
<cs-date-picker today="2026-07-04"></cs-date-picker>
```

### Localization

Month and weekday names, digits and the first day of the week come from the inherited `lang`. Set `locale` to a
BCP-47 tag to format the calendar in another locale. The navigation buttons' labels follow `lang`. In a
right-to-left page the grid runs right to left and the arrow keys follow it.

```html {.example}
<cs-date-picker lang="de" value="2026-05-11"></cs-date-picker>
<cs-date-picker locale="ar-EG" dir="rtl" value="2026-05-11"></cs-date-picker>
```

Where a locale's short weekday names are whole words, as Arabic's are, the column headers show its narrow names
instead. Screen readers hear the full name either way.

### First Day of the Week

Use `first-day-of-week` to choose the first column instead of taking it from the locale. It takes `sun`, `mon`,
`tue`, `wed`, `thu`, `fri`, `sat` or the default, `auto`.

```html {.example}
<cs-date-picker first-day-of-week="mon" value="2026-05-11"></cs-date-picker>
```

### Size

Use `size` to scale the picker. Every dimension inside it grows with the font size.

```html {.example}
<div class="cs-cluster" style="align-items: flex-start">
  <cs-date-picker size="s" value="2026-05-11"></cs-date-picker>
  <cs-date-picker size="m" value="2026-05-11"></cs-date-picker>
  <cs-date-picker size="l" value="2026-05-11"></cs-date-picker>
</div>
```

`xs` and `xl` are available too.

### Disabled

Use `disabled` to turn the whole picker off. No day can be focused or picked and the month can't change.

```html {.example}
<cs-date-picker disabled value="2026-05-11"></cs-date-picker>
```

### Readonly

Use `readonly` to show a date without letting it change. Days stay focusable and the month can still change, so
people can still browse the calendar with the keyboard.

```html {.example}
<cs-date-picker readonly value="2026-05-11"></cs-date-picker>
```

## Submitting With a Form

The picker is not form-associated. To send the date with a form, copy `value` into a hidden input when `cs-change`
fires.

```html {.example}
<form class="date-picker-form cs-stack">
  <cs-date-picker value="2026-05-11"></cs-date-picker>
  <input type="hidden" name="due_on" value="2026-05-11" />
  <div><cs-button type="submit">Save</cs-button></div>
  <p>Submitted: <output></output></p>
</form>

<script type="module">
  const form = document.querySelector('.date-picker-form');
  const picker = form.querySelector('cs-date-picker');
  const input = form.querySelector('input[name="due_on"]');

  picker.addEventListener('cs-change', () => {
    input.value = picker.value;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.querySelector('output').textContent = `due_on=${new FormData(form).get('due_on')}`;
  });
</script>
```

## Keyboard

The grid follows the [WAI-ARIA date picker pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
It is one tab stop, after the previous and next month buttons. Focus lands on the selected day, else today, else the
first day that can be picked.

| Key                         | Moves focus to                                       |
| --------------------------- | ---------------------------------------------------- |
| Right Arrow / Left Arrow    | The next or previous day                             |
| Down Arrow / Up Arrow       | The same day next or last week                       |
| Home / End                  | The first or last day of the week                    |
| Page Down / Page Up         | The same day next or last month                      |
| Shift+Page Down / Page Up   | The same day next or last year                       |
| Enter / Space               | Picks the focused day                                |

Moving to a day the month doesn't have lands on its last day, so Page Down from 31 January lands on 28 or 29
February. Days that can't be picked are skipped, and focus stops at `min` and `max`. In a right-to-left page, Left
Arrow moves to the next day. When a key moves to another month, the new month and year are announced.

## Inside a Popover or Dialog

The picker leaves Escape and Tab alone, so a [Popover](/components/popover) or [Dialog](/components/dialog) around it
closes and traps focus as usual. The keys the grid handles don't scroll the page or reach anything around the picker.
Keys held with Alt, Ctrl or Command pass through untouched.

```html {.example}
<cs-button class="date-picker-dialog-open">Choose a date</cs-button>

<cs-dialog class="date-picker-dialog" label="Choose a date">
  <cs-date-picker value="2026-05-11"></cs-date-picker>
</cs-dialog>

<script type="module">
  const dialog = document.querySelector('.date-picker-dialog');
  const picker = dialog.querySelector('cs-date-picker');

  document.querySelector('.date-picker-dialog-open').addEventListener('click', () => {
    dialog.open = true;
  });

  dialog.addEventListener('cs-after-show', () => picker.focus());
  picker.addEventListener('cs-change', () => {
    dialog.open = false;
  });
</script>
```

Call `focus()` to move focus into the grid, onto the day that takes it.

## Server Rendering and Page Morphs

Everything the picker shows comes from its attributes, so a page refresh that morphs the page (such as a Turbo
morph) leaves it correct:

- A morph that sets a new `value` moves the picker to that date's month.
- A morph that sets the same `value` changes nothing, so the month the user browsed to stays on show.
- A morph that removes `value` clears the selection.

The picker keeps no listeners outside its own shadow root, so an element that is removed and inserted again works as
before. When the server renders the picker, set `today` so the server and the browser mark the same day.

## Theming

The picker has no custom properties of its own. It reads the theme's tokens, so it follows the theme, the brand and
light or dark mode with no extra work. Restyle it by changing these tokens on a section of the page, or by styling its
[CSS parts](#css-parts).

| Token                                                  | What it styles                                       |
| ------------------------------------------------------ | ---------------------------------------------------- |
| `--cs-color-text-normal`                               | The month title and the day numbers                  |
| `--cs-color-text-quiet`                                | The weekday names and days that can't be picked      |
| `--cs-color-neutral-fill-quiet`                        | The hover fill on days and navigation buttons        |
| `--cs-color-brand-fill-loud`                           | The selected day's fill                              |
| `--cs-color-brand-on-loud`                             | The selected day's number                            |
| `--cs-color-brand-on-quiet`                            | The ring around the selected day                     |
| `--cs-focus-ring`, `--cs-focus-ring-offset`            | The focus indicator on days and navigation buttons   |
| `--cs-border-width-m`                                  | The width of the ring around the selected day        |
| `--cs-border-radius-m`                                 | The corners of days and navigation buttons           |
| `--cs-font-weight-semibold`, `--cs-font-weight-bold`   | The title, weekday names and selected day; today     |
| `--cs-font-size-xs` to `--cs-font-size-xl`             | The picker's size, through `size`                    |

The selected day is a filled day inside a ring. The ring takes the brand's foreground colour rather than its fill,
so the selection stays visible where the fill is close to the page colour, as Cru's yellow is on white.
