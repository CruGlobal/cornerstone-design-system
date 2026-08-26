---
title: OTP Input
category: Forms
synonyms:
  - passcode
  - one-time password
  - PIN
  - verification code
  - 2FA code
use-cases:
  - SMS verification
  - two-factor authentication
  - PIN entry
  - invite code
  - serial number
  - license key
  - gift card
  - device pairing
description: "OTP inputs collect one-time passcodes, PINs, and other fixed-length codes, one character per segment. Use them for SMS verification, two-factor authentication, and invite codes."
---

```html {.example}
<cs-otp-input label="Verification code"></cs-otp-input>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the field an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-otp-input label="Security code"></cs-otp-input>
```

### Hint

Add descriptive hint text with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-otp-input label="Sign-in code" hint="Check your email for a 6-digit code."></cs-otp-input>
```

### Length

Use the `length` attribute to change the number of segments. The default is 6.

```html {.example}
<div class="cs-stack">
  <cs-otp-input label="Card PIN" length="4"></cs-otp-input>
  <cs-otp-input label="Backup code" length="8"></cs-otp-input>
</div>
```

### Type

Use the `type` attribute to restrict which characters are accepted.

```html {.example}
<div class="cs-stack">
  <cs-otp-input label="Numeric" type="numeric"></cs-otp-input>
  <cs-otp-input label="Alpha" type="alpha"></cs-otp-input>
  <cs-otp-input label="Alphanumeric" type="alphanumeric"></cs-otp-input>
</div>
```

| Type                                                                                | Accepts            | Best for                     |
| ----------------------------------------------------------------------------------- | ------------------ | ---------------------------- |
| `numeric` <cs-badge appearance="outlined" variant="neutral" pill>default</cs-badge> | Digits 0–9         | SMS and 2FA codes, PINs      |
| `alpha`                                                                             | Letters A–Z        | Letter-only codes            |
| `alphanumeric`                                                                      | Letters and digits | Invite codes, serial numbers |

The `numeric` type also sets the `inputmode` attribute on the underlying input, so mobile devices show the numeric keyboard.

### Format

Use the `format` attribute to arrange segments into groups with literal separators. The `#` character marks a segment; any other character becomes a visual separator. Setting `format` overrides `length`, so there is no need to specify both.

```html {.example}
<div class="cs-stack">
  <!-- Two groups of three with a space: e.g. "ABC DEF" -->
  <cs-otp-input label="Invite code" type="alphanumeric" format="### ###"></cs-otp-input>
  <!-- Three groups of four joined by dashes: e.g. "1234-5678-9012" -->
  <cs-otp-input label="License key" type="alphanumeric" format="####-####-####"></cs-otp-input>
</div>
```

### Case

Use the `case` attribute to transform characters as they are entered. The default is `preserve`. Use `upper` to force uppercase or `lower` to force lowercase.

```html {.example}
<div class="cs-stack">
  <cs-otp-input label="Upper" type="alpha" case="upper"></cs-otp-input>
  <cs-otp-input label="Lower" type="alpha" case="lower"></cs-otp-input>
</div>
```

### Mask

Add the `mask` attribute to display entered characters using `--mask-char` (a bullet, `•`, by default) instead of their real value. The value remains accessible via the `value` property, masking is display-only, and only visual: screen readers still announce entered characters.

```html {.example}
<cs-otp-input label="PIN" mask length="4"></cs-otp-input>
```

Add the `with-mask` attribute to also show `--mask-char` as a hint in each empty segment, so the field reads like a password field even before anything is typed.

```html {.example}
<cs-otp-input label="PIN" mask with-mask length="4"></cs-otp-input>
```

Customize the character with the `--mask-char` custom property. It must be a quoted string.

```html {.example}
<cs-otp-input id="custom-mask-char" label="PIN" mask with-mask length="4"></cs-otp-input>

<style>
  #custom-mask-char {
    --mask-char: '*';
  }
</style>
```

### Appearance

Use the `appearance` attribute to change the visual style of the segments. The default is `outlined`.

```html {.example}
<div class="cs-stack">
  <cs-otp-input label="Outlined" appearance="outlined"></cs-otp-input>
  <cs-otp-input label="Filled" appearance="filled"></cs-otp-input>
  <cs-otp-input label="Filled outlined" appearance="filled-outlined"></cs-otp-input>
  <cs-otp-input label="Contained" appearance="contained"></cs-otp-input>
</div>
```

### Size

Use the `size` attribute to change the size of each segment. The default is `m`.

```html {.example}
<div class="cs-stack">
  <cs-otp-input label="Extra small" size="xs"></cs-otp-input>
  <cs-otp-input label="Small" size="s"></cs-otp-input>
  <cs-otp-input label="Medium" size="m"></cs-otp-input>
  <cs-otp-input label="Large" size="l"></cs-otp-input>
  <cs-otp-input label="Extra large" size="xl"></cs-otp-input>
</div>
```

### Disabled

Use the `disabled` attribute to prevent interaction.

```html {.example}
<cs-otp-input label="Verification code" disabled value="391824"></cs-otp-input>
```

### Readonly

Use the `readonly` attribute to display a value without allowing edits. Unlike `disabled`, a readonly field still receives focus and participates in form submission.

```html {.example}
<cs-otp-input label="Confirmation code" readonly value="483920"></cs-otp-input>
```

### Initial Value

Use the `value` attribute to prefill the segments — for example, when a code arrives in a link's query parameter.

```html {.example}
<cs-otp-input label="Magic link code" value="271828"></cs-otp-input>
```

### Pasting

Pasting a full code fills all segments in one step. Characters that don't match the `type` attribute are silently dropped, so pasting `"ABC-123"` into a `numeric` field produces `123`.

```html {.example}
<cs-copy-button value="314159">
  <cs-button appearance="filled">
    <cs-icon slot="start" name="content_paste"></cs-icon>
    Copy code: 314159
  </cs-button>
</cs-copy-button>

<cs-divider></cs-divider>

<cs-otp-input label="Paste your code below"></cs-otp-input>
```

### Autofill

The `autocomplete` attribute defaults to `one-time-code`, which tells browsers and operating systems to offer autofill for SMS-delivered verification codes. Set `autocomplete="off"` to disable this — for example, when the field is used for a PIN that shouldn't be suggested by the browser.

On Android, Chrome can also read the code from an incoming SMS with the [WebOTP API](https://developer.mozilla.org/en-US/docs/Web/API/WebOTP_API), no manual entry required. Feature-detect it and set the field's `value` from the result:

```html
<cs-otp-input id="sms-code" label="Verification code"></cs-otp-input>

<script>
  if ('OTPCredential' in window) {
    navigator.credentials
      .get({ otp: { transport: ['sms'] } })
      .then(otp => {
        document.getElementById('sms-code').value = otp.code;
      })
      .catch(() => {
        // The prompt was dismissed or timed out
      });
  }
</script>
```

### Autosubmit

Add the `autosubmit` attribute to submit the containing form automatically when the last segment is filled. The `cs-complete` event fires first and is cancelable — call `preventDefault()` to stop the submission.

```html {.example}
<form class="autosubmit">
  <cs-otp-input name="code" label="SMS verification code" autosubmit></cs-otp-input>
</form>

<script type="module">
  const form = document.querySelector('.autosubmit');

  form.addEventListener('submit', event => {
    event.preventDefault();
    alert(`Submitted code: ${new FormData(event.target).get('code')}`);
  });
</script>
```

To run your own logic on completion instead — verify the code over the network, unlock a button — listen for the `cs-complete` event without setting `autosubmit`.

### Validation

Add the `required` attribute to require a value before submission. A partial entry (some segments filled, but not all) is always invalid regardless of `required`, with the `tooShort` validity flag set.

```html {.example}
<form class="validation">
  <cs-otp-input name="code" label="Two-factor code" required></cs-otp-input>
  <br />
  <cs-button appearance="filled" type="submit">Continue</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.validation');

  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('Code accepted!');
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html {.example}
<form class="custom-validity">
  <cs-otp-input name="code" label="Verification code" hint="The correct code is 314159." required></cs-otp-input>
  <br />
  <cs-button appearance="filled" type="submit">Verify</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.custom-validity');
  const otp = form.querySelector('cs-otp-input');

  otp.addEventListener('input', () => {
    // Only flag complete entries — partial input is already invalid via tooShort
    const isValid = otp.value.length < otp.length || otp.value === '314159';
    otp.setCustomValidity(isValid ? '' : 'That code didn’t match. Check your device and try again.');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    alert('Code accepted!');
  });
</script>
```

### Customizing

Use the `--segment-size`, `--segment-gap`, and `--segment-border-radius` custom properties along with [CSS parts](#css-parts) to style the segments, including their border and background.

```html {.example}
<cs-otp-input id="styled-otp" label="Card PIN" length="4"></cs-otp-input>

<style>
  #styled-otp {
    --segment-size: 3.5rem;
    --segment-gap: 0.75rem;
    --segment-border-radius: 0.75rem;
  }

  #styled-otp::part(segment) {
    font-size: 1.5rem;
    font-weight: 700;
    background-color: var(--cs-color-brand-fill-quiet);
    border-color: var(--cs-color-brand-border-loud);
  }
</style>
```

Combine CSS parts with [custom states](/form-controls#custom-validation-styles) to react to what the control is doing. For example, coloring the segments green once the code is fully entered (`--filled`), or red while it's invalid (`invalid`). This example uses `invalid` rather than `user-invalid` so the customization is visible right away, without requiring you to interact with the field first. Type a full code to see it turn green instead:

```html {.example}
<cs-otp-input class="stateful-otp" label="Two-factor code" required></cs-otp-input>

<style>
  .stateful-otp:state(--filled)::part(segment) {
    background-color: var(--cs-color-success-fill-quiet);
    border-color: var(--cs-color-success-border-loud);
  }

  .stateful-otp:state(invalid)::part(segment) {
    border-color: var(--cs-color-danger-border-loud);
  }
</style>
```

## Accessibility Considerations

The component uses a single visually hidden `<input>` as the focus and form target — the visible segments are decorative. Screen readers announce it as one text field, named by the `label` attribute or slot. Always provide a label; without one, the field has no accessible name.

Keyboard interaction follows the single-input model:

| Key                       | Behavior                                                       |
| ------------------------- | -------------------------------------------------------------- |
| <kbd>←</kbd> <kbd>→</kbd> | Move between segments                                          |
| <kbd>Tab</kbd>            | Moves focus to the next form control                           |
| <kbd>Enter</kbd>          | Submits the containing form                                    |
| <kbd>Backspace</kbd>      | Clears the current segment and moves back (no character shift) |
| <kbd>Delete</kbd>         | Clears the current segment without moving                      |
