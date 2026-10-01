---
title: Page
category: Layout
hasAnatomy: false
synonyms:
  - layout
  - page layout
  - scaffold
  - shell
use-cases:
  - app layout
  - page structure
  - content layout
  - sidebar layout
description: "Pages scaffold an entire application layout with header, navigation, sidebar, main content, aside, and footer regions. Use them to structure full pages with minimal markup and responsive behavior built in."
---

The page component is designed to power full webpages. It is flexible enough to handle most modern designs and includes a simple mechanism for handling desktop and mobile navigation.

## Layout Anatomy

This image depicts a page's anatomy, including the default positions of each section. The labels represent the [named slots](#slots) you can use to populate them.

Most slots are optional. Slots that have no content will not be shown, allowing you to opt-in to just the sections you actually need.

<div id="page-anatomy-demo">
  <fieldset>
    <legend>Slots</legend>
    <div class="cs-grid">
      <cs-checkbox name="slot" value="banner" checked title="The banner that gets displayed above the header. The banner will not be shown if no content is provided.">
        banner
      </cs-checkbox>
      <cs-checkbox name="slot" value="header" checked title="The header to display at the top of the page. If a banner is present, the header will appear below the banner. The header will not be shown if there is no content.">
        header
      </cs-checkbox>
      <cs-checkbox name="slot" value="subheader" checked title="A subheader to display below the &lt;code&gt;header&lt;/code&gt;. This is a good place to put things like breadcrumbs.">
        subheader
      </cs-checkbox>
      <cs-checkbox name="slot" value="navigation-header" checked title="The header for a navigation area. On mobile this will be the header for &lt;code&gt;&amp;lt;cs-drawer&amp;gt;&lt;/code&gt;.">
        navigation-header
      </cs-checkbox>
      <cs-checkbox name="slot" value="navigation" checked title="The main content to display in the navigation area. This is displayed on the left side of the page if &lt;code&gt;menu&lt;/code&gt; is not used. This section &amp;quot;sticks&amp;quot; to the top as the page scrolls.">
        navigation
      </cs-checkbox>
      <cs-checkbox name="slot" value="navigation-footer" checked title="The footer for a navigation area. On mobile this will be the footer for &lt;code&gt;&amp;lt;cs-drawer&amp;gt;&lt;/code&gt;.">
        navigation-footer
      </cs-checkbox>
      <cs-checkbox name="slot" value="main-header" checked title="Header to display inline above the main content.">
        main-header
      </cs-checkbox>
      <cs-checkbox name="slot" value="main-footer" checked title="Footer to display inline below the main content.">
        main-footer
      </cs-checkbox>
      <cs-checkbox name="slot" value="aside" checked title="Content to be shown on the right side of the page. Typically contains a table of contents, ads, etc. This section &amp;quot;sticks&amp;quot; to the top as the page scrolls.">
        aside
      </cs-checkbox>
      <cs-checkbox name="slot" value="footer" checked title="The content to display in the footer. This is always displayed underneath the viewport so will always make the page &amp;quot;scrollable&amp;quot;.">
        footer
      </cs-checkbox>
    </div>
  </fieldset>
  <cs-zoomable-frame src="/assets/examples/page/anatomy-demo.html" zoom="0.75" without-controls></cs-zoomable-frame>
  <link rel="stylesheet" href="/assets/examples/page/anatomy-demo.css">
  <script src="/assets/examples/page/anatomy-demo.js" type="module"></script>
</div>

<!-- ![Screenshot of Layout Anatomy showing various slots](/assets/images/layout-anatomy.svg) -->

## Using `cs-page`

:::info
If you're not familiar with how slots work in HTML, you might want to [learn more about slots](/usage/#slots) before using this component.
:::

A number of sections are available as part of the page component, most of which are optional. Content is populated by [slotting elements](/usage/#slots) into various locations.

This component _does not_ implement any [content sectioning](https://developer.mozilla.org/en-US/docs/Web/HTML/Element#content_sectioning) or "semantic elements" internally (such as `<main>`, `<header>`, `<footer>`, etc.). Instead, we recommend that you slot in content sectioning elements wherever you feel they're appropriate.

When using `<cs-page>`, make sure to zero out all paddings and margins on `<html>` and `<body>`, otherwise you may see unexpected gaps. We highly recommend adding the following styles when using `<cs-page>`:

```css
html,
body {
  min-height: 100%;
  padding: 0;
  margin: 0;
}
```

:::info
If you use [native styles](/utilities/native/), this is already taken care of.
:::

## Examples

:::warning
Open demos in a new tab to examine their behavior in different window sizes. The previews below use simulated zooming which, depending on your browser, may not be accurate.
:::

### Documentation

A sample documentation page using [all available slots](#slots). The navigation menu collapses into a drawer at a custom `mobile-breakpoint` of 920px. It can be opened using a button with `[data-toggle-nav]` that appears in the `subheader` slot. The `aside` slot is also hidden below 920px.

<p>
  <cs-button appearance="filled" href="/assets/examples/page/demo-1.html" target="_blank">
    Open demo in a new window
  </cs-button>
</p>

### Media

A sample media app page using `header`, `navigation-header`, `main-header`, and `main-footer` along with the default slot. The navigation menu collapses into a drawer at the default `mobile-breakpoint` and can be opened using a button with `[data-toggle-nav]` that appears in the `header` slot.

<p>
  <cs-button appearance="filled" href="/assets/examples/page/demo-2.html" target="_blank">
    Open demo in a new window
  </cs-button>
</p>

## Customization

### Sticky Sections

The following sections of a page are "sticky" by default, meaning they remain in position as the user scrolls.

- `banner`
- `header`
- `subheader`
- `menu` (`navigation` itself is not sticky, but its parent `menu` is)
- `aside`

This is often desirable, but you can change this behavior using the `disable-sticky` attribute. Use a space-delimited list of names to tell the page which sections should not be sticky.

```html
<cs-page disable-sticky="header aside"> ... </cs-page>
```

### Header Heights

The page measures its `banner`, `header` and `subheader` and keeps each height in a custom property on itself: `--banner-height`, `--header-height` and `--subheader-height`. It uses them to place its sticky sections below one another. Your own styles can use them too, because everything inside the page inherits them. This makes the page's `<main>` a panel that fills the screen below the header and scrolls on its own:

```css
cs-page > main {
  block-size: calc(100dvh - var(--header-height));
  overflow: auto;
}
```

Each height is `0px` until the page has measured it, so a layout sized from one shifts when the page loads. The panel above starts as tall as the whole screen, then shrinks by the header's height.

If you know a height ahead of time, set it on `<cs-page>` in your stylesheet, and the layout is right from the start. The page still measures, and its value replaces yours. So a guess that's a little off costs only a small shift, and the value stays right if the header's size changes later.

```css
cs-page {
  --header-height: 64px;
}
```

Set it on `cs-page` itself, not on `:root` or another ancestor. The page gives each height a `0px` default on its own element, and that default wins over a value inherited from above.

### Skip to Content

The layout provides a "skip to content" link that's visually hidden until the user tabs into it. You don't have to do anything to configure this, unless you want to change the text displayed in the link. In that case, you can slot in your own text using the `skip-to-content` slot.

This example localizes the "skip to content" link for German users.

```html
<cs-page>
  ...
  <span slot="skip-to-content">Zum Inhalt springen</span>
  ...
</cs-page>
```

### Responsiveness

A page isn't very opinionated when it comes to responsive behaviors, but there are tools in place to help make responsiveness easy.

#### Default Slot Styles

Most slots lay out the element you put in them, so its children are arranged before you write any styles. Each of these wrappers is a [flex container](https://developer.mozilla.org/en-US/docs/Glossary/Flex_Container) with a `--cs-space-m` gap between its children.

| Slot                                                                    | Direction | Alignment                                               | Wraps |
| ----------------------------------------------------------------------- | --------- | ------------------------------------------------------- | ----- |
| `header`, `subheader`, `main-header`                                    | row       | `align-items: center`, `justify-content: space-between` | yes   |
| `main-footer`, `footer`                                                 | row       | `align-items: start`, `justify-content: space-between`  | yes   |
| `banner`                                                                | row       | `align-items: center`, `justify-content: center`        | no    |
| `navigation-header`, `navigation`, `navigation-footer`, `menu`, `aside` | column    | not set, so children stretch across                     | no    |

The [desktop and mobile navigation slots](#different-navigation-on-mobile-and-desktop) are columns too, like the navigation slots they stand in for.

The default slot is the exception. A `<main>` or `<section>` there gets padding, but its display is left alone.

#### Changing a Wrapper's Layout

To arrange a wrapper's children another way, put [layout utilities](/utilities/) on the wrapper instead of writing CSS for it. The defaults above are set from inside the page's shadow DOM, and a style on the slotted element itself always wins over them, whatever its specificity. So a utility class replaces a default outright.

A navigation in two parts, such as an icon rail beside a list of links, is the usual case. The `navigation` wrapper is a column, so the parts stack until you make it a row.

```html
<cs-page>
  ...
  <nav slot="navigation" class="cs-split cs-align-items-stretch cs-justify-content-start">
    <div class="cs-stack cs-gap-xs">
      <cs-button appearance="plain" href="#home" data-drawer="close">
        <cs-icon name="home" label="Home"></cs-icon>
      </cs-button>
      <cs-button appearance="plain" href="#search" data-drawer="close">
        <cs-icon name="search" label="Search"></cs-icon>
      </cs-button>
      <cs-button appearance="plain" href="#settings" data-drawer="close">
        <cs-icon name="settings" label="Settings"></cs-icon>
      </cs-button>
    </div>
    <div class="cs-stack cs-gap-2xs">
      <a href="#overview" data-drawer="close">Overview</a>
      <a href="#reports" data-drawer="close">Reports</a>
      <a href="#members" data-drawer="close">Members</a>
    </div>
  </nav>
  ...
</cs-page>
```

Each class does one job:

- [`cs-split`](/utilities/split/) makes the wrapper a row. It sets `flex-direction: row`, and `cs-cluster` sets no direction, so a cluster leaves the column in place.
- `cs-align-items-stretch` runs both parts the full height of the navigation. A split centers its children by default, which floats a short rail to the middle.
- `cs-justify-content-start` keeps the parts together. A split pushes its children to opposite ends, which opens a gap between them in the mobile drawer, or whenever `--menu-width` is wider than the parts.

The split also puts a `--cs-space-m` gap between the parts. Add a [gap utility](/utilities/gap/) to change it, such as `cs-gap-0` when the parts should meet edge to edge.

On mobile the page moves this same wrapper into its drawer, classes included, so the parts stay side by side there as long as they fit. A split wraps, so when the drawer or a fixed `--menu-width` is narrower than both parts, the second part drops below the first.

#### Responsive Navigation

When you use the `navigation` slot, your slotted content automatically collapses into a drawer on smaller screens. The breakpoint at which this occurs is `768px` by default, but you can change it using the `mobile-breakpoint` attribute, which takes either a number or a [CSS length](https://developer.mozilla.org/en-US/docs/Web/CSS/length).

```html
<cs-page mobile-breakpoint="600"> ... </cs-page>
```

By default, a "hamburger" button appears at the start of the `header` to toggle the navigation menu on smaller screens. You can customize what this looks like by slotting your own button into the `navigation-toggle` slot, or place the `data-toggle-nav` attribute on any button on your page. This _does not_ have to be a Cornerstone element.

The default button will not be shown when using either of these methods — if you want to use multiple navigation toggles on your page, add the `data-toggle-nav` attribute to multiple elements.

```html
<cs-page mobile-breakpoint="600">
  ...
  <cs-button data-toggle-nav>Menu</cs-button>
  ...
</cs-page>
```

Alternatively, you can apply `nav-state="open"` and `nav-state="closed"` to the layout component to show and hide the navigation, respectively.

```html
<cs-page nav-state="open"> ... </cs-page>
```

`<cs-page>` is given the attribute `view="mobile"` or `view="desktop"` when the viewport narrower or wider than the `mobile-breakpoint` value, respectively. You can leverage these attributes to change styles depending on the size of the viewport. This is especially useful to hide your `data-toggle-nav` button when the viewport is wider.

```css
cs-page[view='desktop'] [data-toggle-nav] {
  display: none;
}
```

:::info
If you use [native styles](/utilities/native/), this is handled for you, and the `data-toggle-nav` button is already hidden on wider screens.
:::

#### Different Navigation on Mobile and Desktop

The navigation appears in two places: the sidebar on desktop and the drawer on mobile. The `navigation-header`, `navigation` and `navigation-footer` slots fill both. To show something different in one place, fill that place's own slot. It replaces the shared slot there, and the other place keeps showing the shared one.

| Shared slot         | Sidebar only (desktop)      | Drawer only (mobile)       |
| ------------------- | --------------------------- | -------------------------- |
| `navigation-header` | `desktop-navigation-header` | `mobile-navigation-header` |
| `navigation`        | `desktop-navigation`        | `mobile-navigation`        |
| `navigation-footer` | `desktop-navigation-footer` | `mobile-navigation-footer` |

A drawer often needs a title that the sidebar doesn't, because on desktop the page's header already names the app. This gives the drawer a header and leaves the sidebar without one.

```html
<cs-page>
  <header slot="header">...</header>
  <strong slot="mobile-navigation-header">Menu</strong>
  <nav slot="navigation">...</nav>
  ...
</cs-page>
```

:::warning
Don't use `cs-mobile-only` on a `navigation-header` to keep it out of the sidebar. It hides the header on desktop, but it breaks the sidebar's layout. The sidebar is a grid of three rows: the header, then the navigation in a row that grows to fill the column, then the footer. A hidden element drops out of that grid, so the navigation moves up into the header's row and stops filling the sidebar, and the footer moves up off the bottom. Use `mobile-navigation-header` instead, which leaves the sidebar's grid alone.
:::

Two gaps to know about for now:

- **Content in a `desktop-navigation-*` slot still shows on mobile.** It stays at the side of the page, beside the main content, where the sidebar would be. Add `cs-desktop-only` to it as well. The sidebar isn't meant to show on mobile at all, so hiding its content there doesn't disturb anything.
- **The menu button only appears when a shared slot has content.** The page decides whether to show its button from `navigation`, `navigation-header` and `navigation-footer` alone. If you fill only the `mobile-navigation-*` slots, add your own button with `data-toggle-nav`.

#### Custom Widths

You specify widths for some slots on your page with [CSS custom properties](#css-custom-properties) for `--menu-width`, `--main-width`, and `--aside-width`.

If you specify `--menu-width` to apply a specific width to your `navigation` slot, space will still be reserved on the page even below the `mobile-breakpoint`. To collapse this space on smaller screens, add the following code to your styles.

```css
cs-page[view='mobile'] {
  --menu-width: auto;
}
```

You can use a similar approach for `--aside-width` to hide the `aside` slot on smaller screens. Be sure to also specify `display: none` for the slot:

```css
cs-page[view='mobile'] {
  --aside-width: auto;

  [slot='aside'] {
    display: none;
  }
}
```

### Spacing

A page specifies default `padding` within each slot and a `gap` between the slot's direct children. You can drop elements into any slot, and reasonable spacing is already applied for you.

You can override the default spacing for each slot with your own CSS. In this example, we're setting custom `gap` and `padding` for the `footer` slot.

```css
[slot='footer'] {
  gap: var(--cs-space-xl);
  padding: var(--cs-space-xl);
}
```

### Rules Between Regions

The page doesn't offer a rule (divider) between its regions yet, such as a line under the header. There's no attribute that adds one, and no slot sits between two regions where a `<cs-divider>` could go.

## Utility Classes

[Native styles](/utilities/native/) define a few useful defaults for `<cs-page>`, as well as two utility classes you can use for common responsive design tasks:

- `.cs-mobile-only` hides an element on the desktop view
- `.cs-desktop-only` hides an element on the mobile view

Before you use them on navigation content, read [Different Navigation on Mobile and Desktop](#different-navigation-on-mobile-and-desktop).
