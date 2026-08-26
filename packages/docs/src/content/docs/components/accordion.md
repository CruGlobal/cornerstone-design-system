---
title: Accordion
category: Layout
synonyms:
  - collapsible
  - expandable
  - disclosure
  - FAQ
  - panel group
  - details list
use-cases:
  - FAQ sections
  - settings panel
  - content organization
  - collapsible navigation
description: "Accordions are a vertically stacked set of interactive headings that each contain a title, representing a section of content."
---

```html {.example}
<cs-accordion>
  <cs-accordion-item label="What is Cornerstone?">
    Cornerstone is a comprehensive library of web components you can use to build beautiful, accessible web
    applications. It's built on open web standards and works with any framework.
  </cs-accordion-item>
  <cs-accordion-item label="Is it free to use?">
    The core Cornerstone library is completely free and open source. A Pro tier is also available with additional
    components and features.
  </cs-accordion-item>
  <cs-accordion-item label="Does it work with my framework?">
    Yes! Cornerstone components are built as native web components, so they work with any framework including React,
    Vue, Angular, Svelte, or plain HTML.
  </cs-accordion-item>
</cs-accordion>
```

Accordions use [accordion items](/components/accordion-item) to create a vertically stacked set of expandable sections.

## Examples

### Expanded Initially

Use the `expanded` attribute on an accordion item to expand it by default.

```html {.example}
<cs-accordion>
  <cs-accordion-item label="Already open" expanded>
    This item is expanded by default. Click the header to collapse it.
  </cs-accordion-item>
  <cs-accordion-item label="Click to open">
    This item starts collapsed. Click the header to expand it.
  </cs-accordion-item>
</cs-accordion>
```

### Disabled

Use the `disabled` attribute on an accordion item to prevent it from being toggled.

```html {.example}
<cs-accordion>
  <cs-accordion-item label="Active item" expanded>
    This item can be expanded and collapsed normally.
  </cs-accordion-item>
  <cs-accordion-item label="Disabled item" disabled> This item is disabled and cannot be toggled. </cs-accordion-item>
</cs-accordion>
```

### Heading Level

Each accordion item wraps its trigger in a heading so screen reader users can navigate to it, per the [W3C accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/). The default is `<h3>`. Set the `heading-level` attribute to match your page's hierarchy (values outside 1–6 fall back to `3`). The level is semantic only; the accordion inherits the surrounding font, so the appearance is identical at every level.

```html {.example}
<cs-accordion heading-level="2">
  <cs-accordion-item label="Section one"> This trigger is wrapped in an <code>&lt;h2&gt;</code>. </cs-accordion-item>
  <cs-accordion-item label="Section two">
    Match the level to where this accordion sits in your document outline.
  </cs-accordion-item>
</cs-accordion>
```

If an accordion lives outside the document outline (inside a nav or another component with its own structure), set `heading-level="none"` to omit the heading wrapper and render the button directly.

```html {.example}
<cs-accordion heading-level="none">
  <cs-accordion-item label="Settings"> Adjust your preferences here. </cs-accordion-item>
  <cs-accordion-item label="Notifications"> Manage how and when you receive notifications. </cs-accordion-item>
</cs-accordion>
```

### Size

The accordion's text and expand/collapse icon scale with `font-size`. Setting `font-size` on a `<cs-accordion>` proportionally resizes the type and icon together.

```html {.example}
<cs-accordion style="font-size: 0.875rem;">
  <cs-accordion-item label="Small accordion"> Text and icon scale down together. </cs-accordion-item>
  <cs-accordion-item label="Another item">Content here.</cs-accordion-item>
</cs-accordion>

<br />

<cs-accordion>
  <cs-accordion-item label="Default accordion"> The default size. </cs-accordion-item>
  <cs-accordion-item label="Another item">Content here.</cs-accordion-item>
</cs-accordion>

<br />

<cs-accordion style="font-size: 1.25rem;">
  <cs-accordion-item label="Large accordion"> Everything scales up together. </cs-accordion-item>
  <cs-accordion-item label="Another item">Content here.</cs-accordion-item>
</cs-accordion>
```

### Appearance

Use the `appearance` attribute to change the accordion's visual appearance.

```html {.example}
<div class="cs-stack">
  <cs-accordion>
    <cs-accordion-item label="Outlined (default)">
      This is the default outlined appearance. It has a subtle border that helps it stand out without being too flashy.
    </cs-accordion-item>
    <cs-accordion-item label="Another item">More content here.</cs-accordion-item>
  </cs-accordion>

  <cs-accordion appearance="filled-outlined">
    <cs-accordion-item label="Filled-outlined">
      The filled-outlined appearance combines a filled header with an outlined body. It gives the summary a bit more
      visual weight while keeping the content area clean.
    </cs-accordion-item>
    <cs-accordion-item label="Another item">More content here.</cs-accordion-item>
  </cs-accordion>

  <cs-accordion appearance="filled">
    <cs-accordion-item label="Filled">
      The filled appearance adds a background color to the entire component. Use this when you want the details to
      really pop on the page.
    </cs-accordion-item>
    <cs-accordion-item label="Another item">More content here.</cs-accordion-item>
  </cs-accordion>

  <cs-accordion appearance="plain">
    <cs-accordion-item label="Plain">
      No bells and whistles on this one. The plain appearance strips away borders and backgrounds for a minimalist look.
    </cs-accordion-item>
    <cs-accordion-item label="Another item">More content here.</cs-accordion-item>
  </cs-accordion>
</div>
```

### Mode

Use the `mode` attribute to control how items can be expanded.

| Mode                                                                                 | Behavior                                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `multiple` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge> | Any number of items open at once; each toggles independently                                     |
| `single`                                                                             | One item open at a time; opening another collapses it, and clicking the open item keeps it open  |
| `single-collapsible`                                                                 | Like `single`, but clicking the open item closes it — so zero open items is a valid state        |

```html {.example}
<cs-accordion mode="single">
  <cs-accordion-item label="Section one" expanded>
    Opening another section will automatically collapse this one. Only one section can be open at a time.
  </cs-accordion-item>
  <cs-accordion-item label="Section two">
    Try opening this section to see section one collapse automatically.
  </cs-accordion-item>
  <cs-accordion-item label="Section three">
    Clicking an already-open section won't close it — open another instead.
  </cs-accordion-item>
</cs-accordion>
```

Use `single-collapsible` when you want the same one-at-a-time constraint but still want users to be able to close every section.

```html {.example}
<cs-accordion mode="single-collapsible">
  <cs-accordion-item label="Filters">
    Opening another section will collapse this one, and clicking the open section closes it.
  </cs-accordion-item>
  <cs-accordion-item label="Sort"> Try opening and closing each section in turn. </cs-accordion-item>
  <cs-accordion-item label="Display"> Zero open sections is a valid state in this mode. </cs-accordion-item>
</cs-accordion>
```

### Icon Placement

The expand/collapse icon appears at the end of each header by default. Set `icon-placement="start"` to move it to the beginning, a common pattern for sidebars and tree style navigation.

```html {.example}
<cs-accordion icon-placement="start">
  <cs-accordion-item label="Start">Icon is at the start of the header.</cs-accordion-item>
  <cs-accordion-item label="Another item">More content here.</cs-accordion-item>
</cs-accordion>
```

### Custom Icon

Use the `icon` slot on an accordion item to replace the default expand/collapse icon with any icon you like.

By default the icon rotates as the item expands. You can target the `icon` part with `::part(icon)` to customize the rotation, or set `rotate: none` to prevent the animation and swap the icon instead. Because `expanded` reflects an attribute, `[expanded]::part(icon)` lets you style each state.

```html {.example}
<cs-accordion>
  <cs-accordion-item label="Rotate a custom icon" class="circle-plus">
    <cs-icon slot="icon" name="add_circle"></cs-icon>
    Replace the default chevron and customize how it rotates.
  </cs-accordion-item>
  <cs-accordion-item label="Swap the icon instead" class="plus-minus">
    <cs-icon slot="icon" name="add_box" data-when="collapsed"></cs-icon>
    <cs-icon slot="icon" name="indeterminate_check_box" data-when="expanded"></cs-icon>
    Prevent the rotation and swap + for − when the item expands.
  </cs-accordion-item>
</cs-accordion>

<style>
  /* Customize the rotation when expanded */
  cs-accordion-item.circle-plus[expanded]::part(icon) {
    rotate: 225deg;
  }

  /* Prevent the default rotation animation… */
  cs-accordion-item.plus-minus::part(icon) {
    rotate: none;
  }

  /* …and swap the icon based on the expanded state */
  cs-accordion-item.plus-minus [data-when='expanded'] {
    display: none;
  }
  cs-accordion-item.plus-minus[expanded] [data-when='collapsed'] {
    display: none;
  }
  cs-accordion-item.plus-minus[expanded] [data-when='expanded'] {
    display: inline-flex;
  }
</style>
```

### HTML in the Label

To place HTML in an accordion item's header, use the `label` slot instead of the `label` attribute. This lets you add icons, badges, or other elements alongside the label text.

```html {.example}
<cs-accordion>
  <cs-accordion-item>
    <div slot="label" class="cs-split">
      <span>Tasks</span>
      <cs-badge appearance="filled" variant="success" style="font-size: var(--cs-font-size-xs);">3 ready</cs-badge>
    </div>
    All three tasks are ready to be reviewed.
  </cs-accordion-item>
  <cs-accordion-item>
    <div slot="label" class="cs-split">
      <span>Issues</span>
      <cs-badge appearance="filled" variant="danger" style="font-size: var(--cs-font-size-xs);">2 open</cs-badge>
    </div>
    There are two open issues that need your attention.
  </cs-accordion-item>
</cs-accordion>
```

### Expand & Collapse All

Use the `expandAll()` and `collapseAll()` methods to programmatically control all items at once. Note that `expandAll()` is a no-op when `mode` is `single` or `single-collapsible`.

```html {.example}
<div>
  <cs-accordion id="accordion-methods">
    <cs-accordion-item label="Section one">Content for the first section.</cs-accordion-item>
    <cs-accordion-item label="Section two">Content for the second section.</cs-accordion-item>
    <cs-accordion-item label="Section three">Content for the third section.</cs-accordion-item>
  </cs-accordion>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <cs-button appearance="filled" id="expand-all">Expand All</cs-button>
    <cs-button appearance="filled" id="collapse-all">Collapse All</cs-button>
  </div>
</div>

<script type="module">
  const accordion = document.querySelector('#accordion-methods');

  document.querySelector('#expand-all').addEventListener('click', () => accordion.expandAll());
  document.querySelector('#collapse-all').addEventListener('click', () => accordion.collapseAll());
</script>
```

### Nested Accordions

Place a `<cs-accordion>` inside an accordion item's default slot to nest one accordion inside another. Each accordion manages its own items independently, so toggling an inner item won't affect outer items, and properties like `mode` apply only to direct children.

```html {.example}
<cs-accordion>
  <cs-accordion-item label="Fruits" expanded>
    <cs-accordion mode="single">
      <cs-accordion-item label="Apples">Crisp, sweet, and great for pies.</cs-accordion-item>
      <cs-accordion-item label="Oranges">Juicy and packed with vitamin C.</cs-accordion-item>
      <cs-accordion-item label="Bananas">Soft, sweet, and easy to peel.</cs-accordion-item>
    </cs-accordion>
  </cs-accordion-item>
  <cs-accordion-item label="Vegetables">
    <cs-accordion mode="single">
      <cs-accordion-item label="Carrots">Crunchy and rich in beta carotene.</cs-accordion-item>
      <cs-accordion-item label="Broccoli">A nutrient-dense cruciferous vegetable.</cs-accordion-item>
    </cs-accordion>
  </cs-accordion-item>
</cs-accordion>
```

### Preventing Expand or Collapse

Listen for the `cs-accordion-expand` or `cs-accordion-collapse` events and call `event.preventDefault()` to stop the action from completing. The `event.detail.item` property tells you which accordion item triggered the event.

```html {.example}
<cs-accordion id="accordion-prevent">
  <cs-accordion-item label="Locked open" expanded>
    This item is locked open — the <code>cs-accordion-collapse</code> event is being intercepted and prevented.
  </cs-accordion-item>
  <cs-accordion-item label="Works normally"> This item can be toggled normally. </cs-accordion-item>
</cs-accordion>

<script type="module">
  const accordion = document.querySelector('#accordion-prevent');
  const lockedItem = accordion.querySelector('cs-accordion-item');

  accordion.addEventListener('cs-accordion-collapse', event => {
    if (event.detail.item === lockedItem) {
      event.preventDefault();
    }
  });
</script>
```
