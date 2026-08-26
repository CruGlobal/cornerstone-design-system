---
title: Visually Hidden
description: The visually hidden utility makes content accessible to assistive devices without displaying it on the screen.
tags: styleUtilities
synonyms:
  - screen reader only
  - sr-only
  - accessible hide
use-cases:
  - a11y hide
  - skip link
  - assistive text
---

Add the `cs-visually-hidden` class to any element to remove it from the page visually while keeping it available to screen readers and other assistive technologies. That's what you want for skip links, invisible labels on icon-only buttons, and any text that describes something a sighted user already understands from context.

> "There are real world situations where visually hiding content may be appropriate, while the content should remain available to assistive technologies, such as screen readers. For instance, hiding a search field's label as a common magnifying glass icon is used in its stead."
> — [The A11Y Project](https://www.a11yproject.com/posts/2013-01-11-how-to-hide-content/)

Since visually hidden content can receive focus when tabbing, the element becomes visible again as soon as something inside it receives focus. That behavior is intentional: sighted keyboard users need to see where the focus indicator is.

```html {.example}
<div style="min-height: 1.875rem;">
  <a href="#" class="cs-visually-hidden">Skip to main content</a>
</div>
```

## Examples

### Links That Open in New Windows

In this example, the link will open a new window. Screen readers will announce "opens in a new window" even though the text content isn't visible to sighted users.

```html {.example}
<a href="https://example.com/" target="_blank">
  Visit External Page
  <cs-icon name="open_in_new"></cs-icon>
  <span class="cs-visually-hidden">opens in a new window</span>
</a>
```

### Content Conveyed by Context

Adding a label may seem redundant at times, but labels are very helpful for unsighted users. Rather than omit them, you can provide context with visually hidden content that will be announced by assistive devices such as screen readers.

```html {.example}
<cs-card style="width: 100%; max-width: 360px;">
  <header class="cs-visually-hidden">Personal Info</header>
  <cs-input label="Name" style="margin-bottom: .5rem;"></cs-input>
  <cs-input label="Email" type="email"></cs-input>
</cs-card>
```

### Visually Hidden Input Parts

Sometimes you want a form control to have a cleaner, more minimal appearance by hiding the `label` or `hint` visually. However, removing these elements entirely would make the form inaccessible to users with assistive devices.

Instead, you can hide them visually while keeping them available to screen readers by adding the `cs-visually-hidden-label` or `cs-visually-hidden-hint` class.

```html {.example}
<div class="cs-stack">
  <cs-input
    label="Search Articles"
    type="search"
    placeholder="Search for..."
    class="cs-visually-hidden-label"
  >
    <cs-icon slot="start" name="search"></cs-icon>
  </cs-input>

  <cs-input
    label="Phone Number"
    type="tel"
    hint="We'll send you a verification code"
    placeholder="(555) 867-5309"
    class="cs-visually-hidden-hint"
  >
    <cs-icon slot="start" name="call" variant="fill"></cs-icon>
  </cs-input>

  <cs-select
    label="Country"
    hint="Select your country for shipping calculations"
    class="cs-visually-hidden-hint"
  >
    <cs-option value="us">United States</cs-option>
    <cs-option value="ca">Canada</cs-option>
    <cs-option value="mx">Mexico</cs-option>
    <cs-option value="uk">United Kingdom</cs-option>
    <cs-option value="de">Germany</cs-option>
    <cs-option value="fr">France</cs-option>
    <cs-option value="wakanda">Wakanda</cs-option>
    <cs-option value="genovia">Genovia</cs-option>
    <cs-option value="elbonia">Elbonia</cs-option>
    <cs-icon slot="start" name="public"></cs-icon>
  </cs-select>

  <cs-input
    label="Email Address"
    type="email"
    hint="We'll never share your email or secret identity"
    placeholder="e.g. miles.morales@brooklynvisions.edu"
    class="cs-visually-hidden-label cs-visually-hidden-hint"
  >
    <cs-icon slot="start" name="mail"></cs-icon>
  </cs-input>
</div>
```

### Force Visually Hidden

There are cases where you want to _always_ visually hide certain content, even when it's focused.
For example when hiding a checkbox to render a custom one:

```html {.example}
<label>
  <span class="checkbox">
    <input type="checkbox" class="cs-visually-hidden-force" />
  </span>
  I have read the terms and conditions
</label>

<style>
  .checkbox {
    display: flex;
    vertical-align: middle;
    width: var(--cs-font-size-l);
    height: var(--cs-font-size-l);
    background: var(--cs-color-neutral-fill-quiet);
    color: var(--cs-color-neutral-on-quiet);
    border-radius: var(--cs-border-radius-s);
    margin-inline-end: var(--cs-space-xs);

    &::after {
      content: '✓' / '';
      margin: auto;
      transition: opacity var(--cs-transition-slow) var(--cs-transition-easing);
    }

    &:has(:checked) {
      background: var(--cs-color-brand-fill-loud);
      color: var(--cs-color-brand-on-loud);
    }

    &:not(:has(:checked)) {
      &::after {
        opacity: 0;
      }
    }

    &:focus-within {
      outline: var(--cs-focus-ring);
      outline-offset: var(--cs-focus-ring-offset);
    }
  }
</style>
```
