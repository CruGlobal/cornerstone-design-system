---
title: Error summary
description: One list at the top of a form that names every field that needs fixing, each linked to its field.
category: Feedback
synonyms:
  - validation summary
  - form errors
use-cases:
  - failed form submit
  - fix these fields
draft: true
---

```html {.example}
<cs-callout variant="danger" tabindex="-1">
  <cs-icon slot="icon" name="error" variant="fill"></cs-icon>
  <h2 class="cs-heading-s">Fix these fields</h2>
  <ul>
    <li><a href="#display-name">Enter a display name</a></li>
    <li><a href="#phone">Enter a phone number in the format 555-555-5555</a></li>
  </ul>
</cs-callout>
```

## Questions to ask first

- Does the form check its fields in the browser, with no page reload, or on the server, with a reload? Both
  need the summary, but they move focus to it differently: in the browser your submit handler calls
  `focus()` on it; after a reload the summary is on a new page.

## When to use

- A form submit fails because one or more fields need fixing.
- The form is long enough that some of those fields are out of view when the submit fails.

## When not to use

- **One field, right beside the button.** Use that field's own error message alone; see
  [form controls](/form-controls) for validating a field. A summary would repeat the one message the person
  can already see.
- **The save failed, not the fields.** Use a danger [`cs-callout`](/components/callout) with no links, because
  there is no field to send the person to.
- **You want to warn while someone types.** Build your own inline hint, because a summary that changes on
  every keystroke would have to move focus while they type, which pulls them out of the field.

## Why it works

People who just pressed submit on a long form need one place that tells them how much is wrong and where.
A single list answers both at once, so nobody scrolls the form hunting for red text they might miss.

Moving focus to the summary is what makes a failed submit noticeable at all for someone using a screen
reader or a keyboard. When the form checks itself in the browser and the page does not reload, nothing else
tells them the submit failed: the errors appear silently somewhere else on the page.

Each item is a link to its field, so a keyboard or screen reader user can get from the list to the problem
in one step instead of tabbing through every field before it.

## Rules

- **Move focus to the summary after every failed submit, never in response to typing.** Check by hand:
  submit with two required fields empty and confirm focus lands on the summary; submit again without fixing
  them and confirm it lands there again.
- **Each link's text matches the error message under its field, and its `href` is that field's `id`.**
  Check by hand: compare each link with the message under its field, then follow it.
- **Following a link puts the cursor in its field.** Check by hand: click each link and confirm you can type
  straight away. A link like `#phone` targets the `cs-input` element while the real input sits inside it, so
  following the link may scroll without placing the cursor. Cornerstone does not handle this for you yet, so
  check it in every browser you support.
- **Don't also add `role="alert"` or a toast for the same failure.** Check by hand: search the screen for
  `role="alert"` and for a toast raised by the submit. Either makes a screen reader say the failure twice.

## Sources

- [Decide whether cs-callout should take focus when it appears](https://github.com/CruGlobal/cornerstone-design-system/issues/233):
  why focus moves on every failed submit and never on show, and why this matters most when the page does not
  reload.
- [Decide where the error-link focus fix lives](https://github.com/CruGlobal/cornerstone-design-system/issues/238):
  why following a link does not yet put the cursor in its field, and how that will be fixed.
