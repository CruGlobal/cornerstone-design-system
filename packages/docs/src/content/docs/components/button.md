---
title: Button
category: Actions
synonyms:
  - btn
  - action
  - CTA
  - submit
use-cases:
  - form submit
  - link button
  - icon button
  - loading button
description: "Buttons represent actions the user can take, such as submitting a form, opening a dialog, or navigating to another page."
---

```html {.example}
<cs-button>Save</cs-button>
```

```html {.example .anatomy-only}
<cs-button>
  <cs-icon slot="start" name="settings"></cs-icon>
  Settings
  <cs-icon slot="end" name="keyboard_arrow_right"></cs-icon>
</cs-button>
```

## Examples

### Variant

Use the `variant` attribute to set the button's [semantic variant](/theming-overview#variants).

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="neutral">Neutral</cs-button>
  <cs-button variant="brand">Brand</cs-button>
  <cs-button variant="success">Success</cs-button>
  <cs-button variant="warning">Warning</cs-button>
  <cs-button variant="danger">Danger</cs-button>
</div>
```

### Appearance

Use the `appearance` attribute to change the button's visual appearance. Pair it with any `variant` for the full matrix.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="neutral">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="neutral">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="neutral">Filled</cs-button>
    <cs-button appearance="outlined" variant="neutral">Outlined</cs-button>
    <cs-button appearance="plain" variant="neutral">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="brand">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="brand">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="brand">Filled</cs-button>
    <cs-button appearance="outlined" variant="brand">Outlined</cs-button>
    <cs-button appearance="plain" variant="brand">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="success">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="success">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="success">Filled</cs-button>
    <cs-button appearance="outlined" variant="success">Outlined</cs-button>
    <cs-button appearance="plain" variant="success">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="warning">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="warning">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="warning">Filled</cs-button>
    <cs-button appearance="outlined" variant="warning">Outlined</cs-button>
    <cs-button appearance="plain" variant="warning">Plain</cs-button>
  </div>
  <div class="cs-cluster cs-gap-2xs">
    <cs-button appearance="accent" variant="danger">Accent</cs-button>
    <cs-button appearance="filled-outlined" variant="danger">Filled-Outlined</cs-button>
    <cs-button appearance="filled" variant="danger">Filled</cs-button>
    <cs-button appearance="outlined" variant="danger">Outlined</cs-button>
    <cs-button appearance="plain" variant="danger">Plain</cs-button>
  </div>
</div>
```

### Size

Use the `size` attribute to change a button's size.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button size="xs">Extra Small</cs-button>
  <cs-button size="s">Small</cs-button>
  <cs-button size="m">Medium</cs-button>
  <cs-button size="l">Large</cs-button>
  <cs-button size="xl">Extra Large</cs-button>
</div>
```

### Pill

Use the `pill` attribute to give buttons rounded edges.

```html {.example}
<cs-button pill>Pill Button</cs-button>
```

### Link Button

Set the `href` attribute to render the button as an `<a>` under the hood. Provides all the browser's native link behavior (e.g. [[CMD/CTRL/SHIFT]] + [[CLICK]]) plus the `rel`, `target`, and `download` attributes.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button href="https://example.com/">Link</cs-button>
  <cs-button href="https://example.com/" target="_blank">New Window</cs-button>
  <cs-button href="/assets/images/cornerstone-mark.svg" download="cornerstone-mark.svg">Download</cs-button>
</div>
```

### Icon Button

When an [icon](/components/icon) is the only thing slotted into the label, the button becomes an icon button. Icon buttons work with any appearance or variant.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="neutral" appearance="accent"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="outlined"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="filled"><cs-icon name="home" label="Home"></cs-icon></cs-button>
  <cs-button variant="neutral" appearance="plain"><cs-icon name="home" label="Home"></cs-icon></cs-button>
</div>
```

:::warning
<strong>Give icon-only buttons a label.</strong><br />
With no text to announce, a screen reader has nothing to read. Add `label` to the icon (`<cs-icon name="home" label="Home">`) so the button has an accessible name.
:::

### Icon Button With a Badge

To show a [badge](/components/badge) on an icon button, such as an unread count, put the badge in the `end` slot. The button pins a badge to its top corner from any slot, but only the default slot decides whether it is an icon button: a badge there counts as content beside the icon, so the button loses its square icon-button shape. The `start` slot keeps the shape too, but its spacing pushes the badge in from the corner.

```html {.example}
<cs-button appearance="plain">
  <cs-icon name="notifications" label="Notifications, 3 unread"></cs-icon>
  <cs-badge slot="end" pill aria-hidden="true">3</cs-badge>
</cs-button>
```

A bare number does not say what it counts, so put the count and what it counts in the icon's `label`, and add `aria-hidden="true"` to the badge so it is not read twice. Update both when the count changes.

This pattern does not announce a new count. To announce one, follow Badge's [Accessibility Considerations](/components/badge#accessibility-considerations).

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` beside the button label.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button>
    <cs-icon slot="start" name="settings"></cs-icon>
    Settings
  </cs-button>

  <cs-button>
    <cs-icon slot="end" name="undo"></cs-icon>
    Refresh
  </cs-button>

  <cs-button>
    <cs-icon slot="start" name="link"></cs-icon>
    <cs-icon slot="end" name="open_in_new"></cs-icon>
    Open
  </cs-button>
</div>
```

### Stacked

Set `orientation="vertical"` to stack a button's content in a column: the `start` slot above the label, and the `end` slot and the caret below it. Use it for an icon with a caption, as in a bottom navigation bar or a toolbar with captions.

Only the slots stack, so put the icon in `start`. An icon beside text in the label stays in the row. Don't put anything in `end` but a badge, which pins to the button's top corner. Anything else lands under the label, and the button logs a console warning, unless a caret hides it. An icon-only button ignores `orientation` and, outside a group, keeps its square shape.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button orientation="vertical">
    <cs-icon slot="start" name="home"></cs-icon>
    Home
  </cs-button>
  <cs-button orientation="vertical" appearance="outlined">
    <cs-icon slot="start" name="search"></cs-icon>
    Search
  </cs-button>
  <cs-button orientation="vertical" appearance="plain" with-caret>
    <cs-icon slot="start" name="person"></cs-icon>
    Account
  </cs-button>
</div>
```

A stacked button is never shorter or narrower than a one-row button, and it grows to fit its content. Its label wraps instead of spilling out, so the button still fits a narrow bar when text is zoomed or spaced out.

Leave the `start` icon's `label` off. The icon is decorative, so the button is named by its text alone. Give the icon a `label` only when it says something the text does not, and know that the button's name will then read the icon's label first.

Buttons in a horizontal [button group](/components/button-group) share one height, so a stacked toolbar can end with a one-row or icon-only button, which grows taller to match. An icon-only button keeps its width, so it becomes a tall rectangle. Outside a group, such as the navigation bar below, a one-row button keeps its fixed height so it lines up with form fields. It won't match the stacked buttons beside it, so keep every item in such a bar stacked. A `pill` stacked button is drawn as a capsule, since `pill` rounds every corner fully.

#### Navigation Bar

A bar of stacked items that changes the page is navigation, not tabs. Use `cs-button` links (`href`) inside a `<nav>` with an `aria-label`, and don't give them tab roles. Keep at least 4px between items, which is how far the focus ring reaches, or join them in a button group.

```html {.example}
<nav aria-label="Main" class="bottom-bar">
  <cs-button orientation="vertical" appearance="plain" size="s" href="#home">
    <cs-icon slot="start" name="home"></cs-icon>
    Home
  </cs-button>
  <cs-button orientation="vertical" appearance="plain" size="s" href="#search">
    <cs-icon slot="start" name="search"></cs-icon>
    Search
  </cs-button>
  <cs-button orientation="vertical" appearance="plain" size="s" href="#notifications">
    <cs-icon slot="start" name="notifications"></cs-icon>
    Notifications
  </cs-button>
  <cs-button orientation="vertical" appearance="plain" size="s" href="#messages">
    <cs-icon slot="start" name="mail"></cs-icon>
    Messages
  </cs-button>
  <cs-button orientation="vertical" appearance="plain" size="s" href="#profile">
    <cs-icon slot="start" name="person"></cs-icon>
    Profile
  </cs-button>
</nav>

<style>
  .bottom-bar {
    display: flex;
    gap: var(--cs-space-2xs);
  }

  .bottom-bar cs-button {
    flex: 1 1 0;
  }
</style>
```

- **Leave room for the focus ring.** A container that clips its content, such as one with `overflow: hidden`, needs at least 4px of padding inside it, or it cuts the ring off.
- **Keep focus out from under a fixed bar.** A bar fixed to the bottom of the screen covers whatever scrolls beneath it. Set `scroll-padding-block-end` on the scrolling element to the bar's height, so a focused control is never hidden behind it.
- **Render one navigation the same way twice.** If the same navigation shows as a side rail on wide screens and a bottom bar on narrow ones, give both the same links in the same order, and add `hidden` to the copy that isn't showing so it leaves the tab order and the accessibility tree.
- **Mark the current page with more than colour.** Changing the current item from `plain` to `filled` is not enough on its own: the two differ by only 1.25:1 to 1.47:1, and forced colours mode drops the fill altogether. Add a cue that isn't colour, such as a bar under the item. Setting `aria-current` on a `cs-button` does not reach the link inside it.

### Caret

Use the `with-caret` attribute to add a dropdown indicator when a button triggers a dropdown, menu, or popover. The caret takes the place of anything in the `end` slot. A badge there still shows, pinned to the button's top corner. Its text joins the button's accessible name, as on any button. On an icon-only button, follow [Icon Button With a Badge](#icon-button-with-a-badge).

```html {.example}
<cs-button with-caret>Options</cs-button>
```

### Loading

Use the `loading` attribute to put a button in a busy state. Its width stays the same, so adjacent elements don't shift.

```html {.example}
<div class="cs-cluster cs-gap-2xs">
  <cs-button variant="brand" loading>Brand</cs-button>
  <cs-button variant="success" loading>Success</cs-button>
  <cs-button variant="neutral" loading>Neutral</cs-button>
  <cs-button variant="warning" loading>Warning</cs-button>
  <cs-button variant="danger" loading>Danger</cs-button>
</div>
```

### Disabled

Use the `disabled` attribute to disable a button. It works on link buttons too.

```html {.example}
<div class="cs-stack">
  <div class="cs-cluster cs-gap-2xs">
    <cs-button variant="brand" disabled>Brand</cs-button>
    <cs-button variant="success" disabled>Success</cs-button>
    <cs-button variant="neutral" disabled>Neutral</cs-button>
    <cs-button variant="warning" disabled>Warning</cs-button>
    <cs-button variant="danger" disabled>Danger</cs-button>
  </div>

  <div class="cs-cluster cs-gap-2xs">
    <cs-button href="https://example.com/" disabled>Link</cs-button>
    <cs-button href="https://example.com/" target="_blank" disabled>New Window</cs-button>
    <cs-button href="/assets/images/cornerstone-mark.svg" download="cornerstone-mark.svg" disabled>Download</cs-button>
  </div>
</div>
```

### Custom Width

Give a button a custom `width` to size it independently of its content — useful for making buttons span their container on smaller screens.

```html {.example}
<cs-button style="width: 100%;">Save</cs-button>
```

### Content Alignment

A button centers its content. Set `--cs-button-justify-content` to place it elsewhere along the row, such as at the start of a full-width button in a menu or sidebar. It takes any `justify-content` value. Set it on a section and every button inside follows it, including buttons inside other components. Icon-only and stacked buttons ignore it and stay centered.

`start` keeps the `end` slot beside the label. To push it to the far end, as a menu row does with a trailing arrow, give the `end` part an automatic start margin.

```html {.example}
<div class="cs-stack cs-gap-2xs side-menu">
  <cs-button appearance="plain">
    <cs-icon slot="start" name="inbox"></cs-icon>
    Inbox
  </cs-button>
  <cs-button appearance="plain">
    <cs-icon slot="start" name="draft"></cs-icon>
    Drafts
  </cs-button>
  <cs-button appearance="plain" class="trailing">
    <cs-icon slot="start" name="settings"></cs-icon>
    Settings
    <cs-icon slot="end" name="keyboard_arrow_right"></cs-icon>
  </cs-button>
</div>

<style>
  .side-menu {
    --cs-button-justify-content: start;
    max-width: 16rem;
  }

  .side-menu .trailing::part(end) {
    margin-inline-start: auto;
  }
</style>
```

### Customizing

Target the `button` part to restyle a button from the outside. Use a custom class when you're adding a new variation; to retheme an existing one, target its `variant` attribute instead (e.g. `cs-button[variant="brand"]`).

Build the override out of [design tokens](/tokens) rather than literal values, as below — a hue's tint scale gives you coordinated light and dark edges for free, and the radius, border width and spacing all have a step on the scale. Tokens are also what keeps a customization working across themes and colour schemes.

```html {.example}
<cs-button class="pink">Pink Button</cs-button>

<style>
  cs-button.pink::part(button) {
    border-radius: var(--cs-border-radius-m);
    border: solid var(--cs-border-width-m);
    background: var(--cs-color-pink-40);
    border-top-color: var(--cs-color-pink-60);
    border-left-color: var(--cs-color-pink-60);
    border-bottom-color: var(--cs-color-pink-20);
    border-right-color: var(--cs-color-pink-20);
    color: var(--cs-color-pink-95);
    font-size: var(--cs-font-size-l);
    /* The geometry longhands, not --cs-shadow-m: that shorthand already ends in its own
       colour, and a shadow layer with two colours is invalid. */
    box-shadow: var(--cs-shadow-offset-x-m) var(--cs-shadow-offset-y-m) var(--cs-shadow-blur-m)
      var(--cs-shadow-spread-m) var(--cs-color-pink-20);
    transition: all var(--cs-transition-slow) var(--cs-transition-easing);
  }

  cs-button.pink::part(button):hover {
    transform: scale(1.05);
  }

  /* Swapping the light and dark edges is what makes it read as pressed. */
  cs-button.pink::part(button):active {
    border-top-color: var(--cs-color-pink-20);
    border-right-color: var(--cs-color-pink-60);
    border-bottom-color: var(--cs-color-pink-60);
    border-left-color: var(--cs-color-pink-20);
    transform: translateY(var(--cs-space-3xs));
  }

  cs-button.pink::part(button):focus-visible {
    outline: dashed var(--cs-border-width-m) var(--cs-color-pink-60);
    outline-offset: var(--cs-space-2xs);
  }
</style>
```
