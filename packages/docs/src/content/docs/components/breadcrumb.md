---
title: Breadcrumb
category: Navigation
synonyms:
  - breadcrumbs
  - navigation trail
  - path
use-cases:
  - wayfinding
  - site navigation
  - hierarchy navigation
description: "Breadcrumbs display a trail of links that show users where they are in a site's hierarchy. They help users understand the current location and navigate back to parent pages."
---

```html {.example}
<cs-breadcrumb>
  <cs-breadcrumb-item>Catalog</cs-breadcrumb-item>
  <cs-breadcrumb-item>Clothing</cs-breadcrumb-item>
  <cs-breadcrumb-item>Women's</cs-breadcrumb-item>
  <cs-breadcrumb-item>Shirts &amp; Tops</cs-breadcrumb-item>
</cs-breadcrumb>
```

Breadcrumbs are usually placed before a page's main content with the current page shown last to indicate the user's position in the navigation.

## Examples

### Links

By default, breadcrumb items are rendered as buttons so you can use them to navigate single-page applications. In this case, you'll need to add event listeners to handle clicks.

For websites, you'll probably want to use links instead. You can make any breadcrumb item a link by applying an `href` attribute to it. Now, when the user activates it, they'll be taken to the corresponding page — no event listeners required.

The last item represents the current page. Use `href=""` so it points at itself — `<cs-breadcrumb>` will mark it with `aria-current="page"` and style it as non-interactive for you.

```html {.example}
<cs-breadcrumb>
  <cs-breadcrumb-item href="https://example.com/home">Homepage</cs-breadcrumb-item>

  <cs-breadcrumb-item href="https://example.com/home/services">Our Services</cs-breadcrumb-item>

  <cs-breadcrumb-item href="https://example.com/home/services/digital">Digital Media</cs-breadcrumb-item>

  <cs-breadcrumb-item href="">Web Design</cs-breadcrumb-item>
</cs-breadcrumb>
```

### Start & End Decorations

Use the `start` and `end` slots to add presentational elements like `<cs-icon>` next to any breadcrumb item.

```html {.example}
<cs-breadcrumb>
  <cs-breadcrumb-item>
    <cs-icon slot="start" name="home"></cs-icon>
    Home
  </cs-breadcrumb-item>
  <cs-breadcrumb-item>Articles</cs-breadcrumb-item>
  <cs-breadcrumb-item>
    <cs-icon slot="end" name="beach_access" variant="fill"></cs-icon>
    Traveling
  </cs-breadcrumb-item>
</cs-breadcrumb>
```

### Separator

Use the `separator` slot to change the separator that goes between breadcrumb items. Icons work well, but you can also use text or an image.

```html {.example}
<cs-breadcrumb>
  <cs-icon slot="separator" name="keyboard_double_arrow_right"></cs-icon>
  <cs-breadcrumb-item>First</cs-breadcrumb-item>
  <cs-breadcrumb-item>Second</cs-breadcrumb-item>
  <cs-breadcrumb-item>Third</cs-breadcrumb-item>
</cs-breadcrumb>

<br />

<cs-breadcrumb>
  <cs-icon slot="separator" name="arrow_forward"></cs-icon>
  <cs-breadcrumb-item>First</cs-breadcrumb-item>
  <cs-breadcrumb-item>Second</cs-breadcrumb-item>
  <cs-breadcrumb-item>Third</cs-breadcrumb-item>
</cs-breadcrumb>

<br />

<cs-breadcrumb>
  <span slot="separator">/</span>
  <cs-breadcrumb-item>First</cs-breadcrumb-item>
  <cs-breadcrumb-item>Second</cs-breadcrumb-item>
  <cs-breadcrumb-item>Third</cs-breadcrumb-item>
</cs-breadcrumb>
```

### Colors

Breadcrumb labels match the color set on `<cs-breadcrumb-item>`. Content in the `start`, `end`, and `separator` slots can be styled using CSS parts.

```html {.example}
<style>
  .redcrumbs cs-breadcrumb-item {
    color: var(--cs-color-cerise-40);
  }
  .redcrumbs cs-breadcrumb-item:last-of-type {
    color: var(--cs-color-cerise-60);
  }
  .redcrumbs cs-breadcrumb-item::part(separator) {
    color: var(--cs-color-cerise-80);
  }
  .redcrumbs cs-breadcrumb-item::part(start),
  .redcrumbs cs-breadcrumb-item::part(end) {
    color: currentColor;
  }
</style>
<cs-breadcrumb class="redcrumbs">
  <cs-breadcrumb-item>
    <cs-icon slot="start" name="home"></cs-icon>
    Home
  </cs-breadcrumb-item>
  <cs-breadcrumb-item>Articles</cs-breadcrumb-item>
  <cs-breadcrumb-item>Traveling</cs-breadcrumb-item>
</cs-breadcrumb>
```

### Dropdowns

Dropdown menus can be placed in the default slot to provide additional options.

```html {.example}
<cs-breadcrumb>
  <cs-breadcrumb-item>Homepage</cs-breadcrumb-item>
  <cs-breadcrumb-item>
    <cs-dropdown>
      <cs-button slot="trigger" size="s" appearance="filled" pill>
        <cs-icon label="More options" name="more_horiz"></cs-icon>
      </cs-button>
      <cs-dropdown-item type="checkbox" checked>Web Design</cs-dropdown-item>
      <cs-dropdown-item type="checkbox">Web Development</cs-dropdown-item>
      <cs-dropdown-item type="checkbox">Marketing</cs-dropdown-item>
    </cs-dropdown>
  </cs-breadcrumb-item>
  <cs-breadcrumb-item>Our Services</cs-breadcrumb-item>
  <cs-breadcrumb-item>Digital Media</cs-breadcrumb-item>
</cs-breadcrumb>
```
