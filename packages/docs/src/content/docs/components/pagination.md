---
title: Pagination
category: Navigation
synonyms:
  - pager
  - pages
  - paging
use-cases:
  - search results
  - data tables
  - archives
  - large lists
description: "Pagination splits long lists of content into pages, letting users navigate between them."
---

```html {.example}
<cs-pagination total="237" page-size="10" page="3" label="Search results"></cs-pagination>
```

Set `total` and `page-size` to generate numbered page buttons with previous and next controls. Use the `label` attribute to give the control an accessible name, which is especially helpful when more than one appears on the same page.

:::info
<strong>Pagination is a navigation control, not a form control.</strong><br />
It tracks the current page and emits events, but it doesn't submit a value with a form. Keep `page` in sync with your data by updating it in response to the [`cs-after-page-change`](#responding-to-page-changes) event.
:::

## Examples

### Appearance

Set the `appearance` attribute to change the pagination's visual style. Valid appearances are `outlined` (the default), `filled`, and `plain`.

```html {.example}
<div class="cs-stack">
  <cs-pagination total="237" page-size="10" page="3" appearance="outlined"></cs-pagination>
  <cs-pagination total="237" page-size="10" page="3" appearance="filled"></cs-pagination>
  <cs-pagination total="237" page-size="10" page="3" appearance="plain"></cs-pagination>
</div>
```

### Size

Pagination has no `size` attribute; set `font-size` on the control or any ancestor to scale it.

```html {.example}
<div class="cs-stack">
  <cs-pagination total="237" page-size="10" page="3" style="font-size: var(--cs-font-size-s)"></cs-pagination>
  <cs-pagination total="237" page-size="10" page="3"></cs-pagination>
  <cs-pagination total="237" page-size="10" page="3" style="font-size: var(--cs-font-size-l)"></cs-pagination>
</div>
```

### Number of Buttons

Use the `sibling-count` attribute to set how many pages show on each side of the current page (defaults to `2`), and `boundary-count` to set how many show at the start and end (defaults to `1`). Remaining pages collapse into an ellipsis, which jumps several pages toward that side when activated.

```html {.example}
<div class="cs-stack">
  <cs-pagination total="1000" page-size="10" page="50" sibling-count="1" boundary-count="1"></cs-pagination>
  <cs-pagination total="1000" page-size="10" page="50" sibling-count="3" boundary-count="2"></cs-pagination>
</div>
```

### First and Last Buttons

Add the `with-edges` attribute to show buttons that jump to the first and last pages.

```html {.example}
<cs-pagination total="237" page-size="10" page="10" with-edges></cs-pagination>
```

### Previous and Next Buttons

Add the `without-nav` attribute to hide the previous and next buttons, leaving only the page numbers.

```html {.example}
<cs-pagination total="237" page-size="10" page="3" without-nav></cs-pagination>
```

### Summary

Add the `with-summary` attribute to show a summary of the items on the current page.

```html {.example}
<cs-pagination total="237" page-size="10" page="1" with-summary></cs-pagination>
```

### Compact

Set the `format` attribute to `compact` to replace the page numbers with a short "1 of 5" label between the previous and next buttons.

```html {.example}
<cs-pagination total="237" page-size="10" page="1" format="compact"></cs-pagination>
```

The compact format can be combined with other features, such as `with-summary`:

```html {.example}
<cs-pagination total="237" page-size="10" page="1" format="compact" with-summary></cs-pagination>
```

### Custom Icons

Use the `previous-icon`, `next-icon`, `first-icon`, and `last-icon` slots to replace the default navigation icons.

```html {.example}
<cs-pagination total="237" page-size="10" page="5" with-edges>
  <cs-icon slot="previous-icon" name="skip_previous" variant="fill"></cs-icon>
  <cs-icon slot="next-icon" name="skip_next" variant="fill"></cs-icon>
  <cs-icon slot="first-icon" name="first_page"></cs-icon>
  <cs-icon slot="last-icon" name="last_page"></cs-icon>
</cs-pagination>
```

:::info
<strong>Replacing an icon doesn't replace its label.</strong><br />
The navigation buttons keep their built-in accessible labels, so screen readers still announce them correctly.
:::

### Disabled

Add the `disabled` attribute to disable the entire pagination control.

```html {.example}
<cs-pagination total="237" page-size="10" page="3" disabled></cs-pagination>
```

### Single Page

Add the `hide-single-page` attribute to render nothing when there's only one page of results. Since a single page renders nothing, this example is shown as code rather than a live preview.

```html
<cs-pagination total="5" page-size="10" hide-single-page></cs-pagination>
```

### Page Size Selector

Pair a [select](/components/select) with the pagination control to let users change the page size. Update `page-size` when the selection changes, and reset to the first page.

```html {.example}
<div class="pagination-page-size">
  <cs-pagination total="237" page-size="10" page="1"></cs-pagination>

  <cs-select label="Items per page" value="10" size="s">
    <cs-option value="10">10</cs-option>
    <cs-option value="20">20</cs-option>
    <cs-option value="50">50</cs-option>
    <cs-option value="100">100</cs-option>
  </cs-select>
</div>

<style>
  .pagination-page-size {
    display: flex;
    align-items: end;
    gap: var(--cs-space-l);
    flex-wrap: wrap;
  }

  .pagination-page-size cs-select {
    inline-size: 8rem;
  }
</style>

<script type="module">
  const container = document.querySelector('.pagination-page-size');
  const pagination = container.querySelector('cs-pagination');
  const select = container.querySelector('cs-select');

  select.addEventListener('change', () => {
    pagination.pageSize = Number(select.value);
    pagination.page = 1;
  });
</script>
```

### Responding to Page Changes

When the user changes the page, the `cs-after-page-change` event is emitted with `{ page, pageSize }` in `event.detail`. Update the `page` property to reflect the new page and load the corresponding data.

```html {.example}
<div class="pagination-change-demo">
  <cs-pagination class="pagination-change" total="237" page-size="10" page="1"></cs-pagination>

  <cs-divider></cs-divider>

  <small class="pagination-change-output" style="display: block">Showing page 1</small>
</div>

<script type="module">
  const container = document.querySelector('.pagination-change-demo');
  const pagination = container.querySelector('.pagination-change');
  const output = container.querySelector('.pagination-change-output');

  pagination.addEventListener('cs-after-page-change', event => {
    pagination.page = event.detail.page;
    output.textContent = `Showing page ${event.detail.page}`;
  });
</script>
```

### Setting the Page Programmatically

Set the `page` property to any valid page to change the current page without user interaction. Setting `page` directly doesn't emit `cs-after-page-change`.

```html {.example}
<div class="pagination-set-demo">
  <cs-pagination class="pagination-set" total="237" page-size="10" page="1"></cs-pagination>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <cs-button appearance="filled" data-page="1">Page 1</cs-button>
    <cs-button appearance="filled" data-page="5">Page 5</cs-button>
    <cs-button appearance="filled" data-page="10">Page 10</cs-button>
  </div>
</div>

<script type="module">
  const container = document.querySelector('.pagination-set-demo');
  const pagination = container.querySelector('.pagination-set');

  container.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      pagination.page = Number(button.dataset.page);
    });
  });
</script>
```

### Preventing a Page Change

Call `event.preventDefault()` on the `cs-page-change` event to cancel a page change, such as to guard against unsaved changes.

```html {.example}
<cs-pagination class="pagination-guard" total="237" page-size="10" page="1"></cs-pagination>

<script type="module">
  const pagination = document.querySelector('.pagination-guard');

  pagination.addEventListener('cs-page-change', event => {
    if (!window.confirm(`Leave for page ${event.detail.page}?`)) {
      event.preventDefault();
    }
  });

  pagination.addEventListener('cs-after-page-change', event => {
    pagination.page = event.detail.page;
  });
</script>
```

### Rendering Links Instead of Buttons

Set the `href-template` attribute to render page items as links instead of buttons, using `{page}` as a placeholder for the page number. Every control links through the template, which works well for server-rendered pages.

```html {.example}
<cs-pagination total="237" page-size="10" page="3" href-template="?page={page}"></cs-pagination>
```

In JavaScript, you can also set the `hrefTemplate` property to a function that receives the page number and returns the URL. This is handy when the URL doesn't follow a simple substitution. When server-rendering, set the `href-template` attribute to the closest equivalent as well, so the server and the browser render the same markup.

```html {.example}
<cs-pagination
  class="pagination-href-fn"
  total="237"
  page-size="10"
  page="3"
  href-template="?page={page}#results"
></cs-pagination>

<script type="module">
  const pagination = document.querySelector('.pagination-href-fn');

  pagination.hrefTemplate = page => `?page=${page}#results`;
</script>
```

:::info
<strong>In link mode, the component navigates instead of updating itself.</strong><br />
Render it on the server with the correct `page` for each request. Disabled and boundary controls, such as previous on the first page, render as anchors with no `href` and `aria-disabled` set.
:::

### Customizing

Use the exported [CSS parts](#css-parts) to customize the pagination's appearance, where the `button` part targets every button at once. The `plain` appearance is a good starting point.

This example turns the control into a row of pill-shaped buttons, gives the navigation arrows a colorful circular treatment, and highlights the current page with a gradient and a soft glow.

```html {.example}
<cs-pagination
  class="custom-pagination"
  total="237"
  page-size="10"
  page="3"
  appearance="plain"
  with-edges
  sibling-count="1"
>
  <cs-icon slot="previous-icon" name="keyboard_arrow_left"></cs-icon>
  <cs-icon slot="next-icon" name="keyboard_arrow_right"></cs-icon>
  <cs-icon slot="first-icon" name="keyboard_double_arrow_left"></cs-icon>
  <cs-icon slot="last-icon" name="keyboard_double_arrow_right"></cs-icon>
</cs-pagination>

<style>
  .custom-pagination {
    --gradient: linear-gradient(135deg, var(--cs-color-brand-fill-loud), var(--cs-color-purple-50));
  }

  /* The host uses `display: contents`, so style the `pagination` part to create the container chrome. */
  .custom-pagination::part(pagination) {
    padding: var(--cs-space-xs);
    border-radius: var(--cs-border-radius-pill);
    background-color: var(--cs-color-neutral-fill-quiet);
  }

  .custom-pagination::part(pages) {
    gap: var(--cs-space-2xs);
    flex-wrap: nowrap;
  }

  .custom-pagination::part(button) {
    min-width: 2.5em;
    height: 2.5em;
    border: none;
    border-radius: var(--cs-border-radius-pill);
    font-weight: var(--cs-font-weight-semibold);
    color: var(--cs-color-neutral-on-quiet);
    background-color: transparent;
    transition:
      transform var(--cs-transition-fast),
      color var(--cs-transition-fast),
      background-color var(--cs-transition-fast);
  }

  .custom-pagination::part(button):hover {
    color: var(--cs-color-neutral-on-normal);
    background-color: var(--cs-color-neutral-fill-normal);
    transform: translateY(-2px);
  }

  .custom-pagination::part(previous-button),
  .custom-pagination::part(next-button),
  .custom-pagination::part(first-button),
  .custom-pagination::part(last-button) {
    color: var(--cs-color-neutral-on-quiet);
    background-color: var(--cs-color-neutral-fill-normal);
  }

  /* Keep the nav arrows neutral on hover so they stay calm next to the brand-tinted page numbers. */
  .custom-pagination::part(previous-button):hover,
  .custom-pagination::part(next-button):hover,
  .custom-pagination::part(first-button):hover,
  .custom-pagination::part(last-button):hover {
    color: var(--cs-color-neutral-on-normal);
    background-color: var(--cs-color-neutral-fill-normal);
    filter: brightness(0.95);
  }

  .custom-pagination::part(page-current) {
    color: var(--cs-color-brand-on-loud);
    background-image: var(--gradient);
    transform: none;
  }

  .custom-pagination::part(page-current):hover {
    color: var(--cs-color-brand-on-loud);
    transform: none;
  }

  .custom-pagination::part(ellipsis) {
    color: var(--cs-color-neutral-on-quiet);
    border: none;
    background-color: transparent;
  }
</style>
```

## Accessibility Considerations

Pagination ships with several accessibility behaviors built in:

- **Page changes are announced.** When the page changes, the new position is announced to screen readers through a shared live region, so the update isn't silent.
- **Focus follows the page.** After a control is activated, focus moves to the new current page rather than falling back to the top of the document, keeping keyboard users oriented.
- **The current page is marked.** The active page carries `aria-current="page"`, and disabled or boundary controls carry `aria-disabled` so assistive technology skips them.
- **Icons are direction-aware.** The previous, next, first, and last icons flip automatically in right-to-left languages.

Give the control an accessible name with the `label` attribute whenever more than one pagination appears on a page, so screen reader users can tell them apart.
