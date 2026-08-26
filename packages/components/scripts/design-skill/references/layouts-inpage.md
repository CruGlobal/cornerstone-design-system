# In-page layouts (sections, widgets, embeds)

You are here because STEP 0 determined you're building **a piece of a page**: a section, card, form,
panel, toolbar, or something embedded into a page you don't fully control.

**Do not use `<cs-page>` here.** It's designed to own the whole viewport (sticky headers, a responsive
nav drawer, a full-height grid) and will fight whatever surrounds it. Instead, compose with **layout
utility classes**. They're plain CSS classes you put on any element, no components required.

Because there's no `<cs-page>` here, **none of its features are available** in this context: no slots
(`slot="header"`, etc.), no `view='mobile'`/`view='desktop'` state, no `--menu-width`/`--aside-width`,
no `data-toggle-nav`, and **no `.cs-desktop-only` / `.cs-mobile-only`** (those only work inside
`<cs-page>`; use a CSS media query for responsive visibility here). Don't reach for any of them; they
do nothing outside a `<cs-page>`.

The six layout utilities:

| Utility      | Shape                                 | Use when                                                              |
| ------------ | ------------------------------------- | --------------------------------------------------------------------- |
| `cs-stack`   | Vertical column                       | Stacking things top-to-bottom: form fields, card bodies, content flow |
| `cs-cluster` | Inline row that wraps                 | Buttons, tags, chips, inline metadata, nav links                      |
| `cs-grid`    | Responsive columns (no media queries) | Card galleries, dashboards, tile grids                                |
| `cs-flank`   | Fixed item beside a flexible one      | Avatar + text, icon + label, media object                             |
| `cs-split`   | Push children to opposite ends        | Toolbars, section headers with an action on the right                 |
| `cs-frame`   | Fixed aspect-ratio box                | Images, video, thumbnails                                             |

Spacing comes from `cs-gap-*` (mapped to the `--cs-space-*` scale). Defaults are sensible; reach for
`cs-gap-*` to tune. Full decision guide and per-utility detail: [composition.md](composition.md).

> Theming still applies. These sections inherit whatever theme/palette is set on `<html>`. Style them
> with `--cs-*` tokens, never hardcoded values. See [theming.md](theming.md).

---

## Section recipes

### Form block

A constrained-width vertical stack. Keep forms narrow for readability and pair a primary action with a
quiet secondary.

```html
<section class="cs-stack cs-gap-l" style="max-width: 28rem;">
  <h2>Create account</h2>
  <cs-input label="Email" type="email"></cs-input>
  <cs-input label="Password" type="password"></cs-input>
  <div class="cs-cluster">
    <cs-button variant="brand">Create account</cs-button>
    <cs-button appearance="plain">Cancel</cs-button>
  </div>
</section>
```

### Toolbar / section header with an action

`cs-split` pushes the title and the action button to opposite ends.

```html
<div class="cs-split">
  <h2>Team members</h2>
  <cs-button variant="brand">
    <cs-icon slot="start" name="add"></cs-icon>
    Invite
  </cs-button>
</div>
```

### Responsive card grid

`cs-grid` wraps cards into as many columns as fit, no breakpoints needed. Tune the wrap threshold with
`--min-column-size`.

```html
<div class="cs-grid cs-gap-l" style="--min-column-size: 16rem;">
  <cs-card>
    <h3>Starter</h3>
    <p>For individuals getting started.</p>
    <cs-button slot="footer" variant="brand">Choose</cs-button>
  </cs-card>
  <cs-card>
    <h3>Team</h3>
    <p>For small teams that collaborate.</p>
    <cs-button slot="footer" variant="brand">Choose</cs-button>
  </cs-card>
  <cs-card>
    <h3>Business</h3>
    <p>For organizations at scale.</p>
    <cs-button slot="footer" variant="brand">Choose</cs-button>
  </cs-card>
</div>
```

### Media object (icon/avatar beside text)

`cs-flank` keeps the first child at its natural size and lets the rest fill the space. Tune the fixed
size with `--flank-size`.

```html
<div class="cs-flank cs-gap-s" style="--flank-size: 3rem;">
  <cs-avatar label="Ada Lovelace"></cs-avatar>
  <div class="cs-stack cs-gap-3xs">
    <strong>Ada Lovelace</strong>
    <span class="cs-caption-m">Founder</span>
  </div>
</div>
```

Use `cs-flank:end` to flank the **last** child instead (e.g. text with a trailing control).

---

## Anti-patterns

| ❌ Don't                                           | ✅ Do                                                        |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Drop a `<cs-page>` into a section to get a sidebar | Use `cs-grid` / `cs-flank` for in-section columns            |
| Write `display: flex; gap: 16px` by hand           | Use `cs-stack`/`cs-cluster` + `cs-gap-*`                     |
| Hardcode `max-width: 480px` everywhere             | Constrain to a readable measure with tokens/rem and reuse it |
| Hardcode colors in a card                          | Inherit the theme; style with `--cs-color-*`                 |
| Add media queries for a card grid                  | `cs-grid` is responsive without them                         |
