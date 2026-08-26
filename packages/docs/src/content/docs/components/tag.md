---
title: Tag
category: Feedback
synonyms:
  - chip
  - label
  - pill
  - token
  - badge
use-cases:
  - filter tag
  - removable tag
  - category label
  - keyword
description: "Tags label, categorize, or represent selections with a compact visual marker. Use them for status indicators, filters, or removable chips."
---

```html {.example}
<cs-tag>Featured</cs-tag>
```

```html {.example .anatomy-only}
<cs-tag><cs-icon name="star" variant="fill"></cs-icon> Featured</cs-tag>
```

## Examples

### Variant

Set the `variant` attribute to match the tag to its meaning.

```html {.example}
<cs-tag variant="brand">Brand</cs-tag>
<cs-tag variant="success">Success</cs-tag>
<cs-tag variant="neutral">Neutral</cs-tag>
<cs-tag variant="warning">Warning</cs-tag>
<cs-tag variant="danger">Danger</cs-tag>
```

### Appearance

Use the `appearance` attribute to change the tag's visual style. The default is `filled-outlined`.

```html {.example}
<div class="cs-stack">
  <p>
    <cs-tag variant="brand" appearance="accent">Accent</cs-tag>
    <cs-tag variant="brand" appearance="filled-outlined">Filled-Outlined</cs-tag>
    <cs-tag variant="brand" appearance="filled">Filled</cs-tag>
    <cs-tag variant="brand" appearance="outlined">Outlined</cs-tag>
  </p>
  <p>
    <cs-tag variant="success" appearance="accent">Accent</cs-tag>
    <cs-tag variant="success" appearance="filled-outlined">Filled-Outlined</cs-tag>
    <cs-tag variant="success" appearance="filled">Filled</cs-tag>
    <cs-tag variant="success" appearance="outlined">Outlined</cs-tag>
  </p>
  <p>
    <cs-tag variant="neutral" appearance="accent">Accent</cs-tag>
    <cs-tag variant="neutral" appearance="filled-outlined">Filled-Outlined</cs-tag>
    <cs-tag variant="neutral" appearance="filled">Filled</cs-tag>
    <cs-tag variant="neutral" appearance="outlined">Outlined</cs-tag>
  </p>
  <p>
    <cs-tag variant="warning" appearance="accent">Accent</cs-tag>
    <cs-tag variant="warning" appearance="filled-outlined">Filled-Outlined</cs-tag>
    <cs-tag variant="warning" appearance="filled">Filled</cs-tag>
    <cs-tag variant="warning" appearance="outlined">Outlined</cs-tag>
  </p>
  <p>
    <cs-tag variant="danger" appearance="accent">Accent</cs-tag>
    <cs-tag variant="danger" appearance="filled-outlined">Filled-Outlined</cs-tag>
    <cs-tag variant="danger" appearance="filled">Filled</cs-tag>
    <cs-tag variant="danger" appearance="outlined">Outlined</cs-tag>
  </p>
</div>
```

### Size

Use the `size` attribute to change a tag's size.

```html {.example}
<cs-tag size="xs">Extra Small</cs-tag>
<cs-tag size="s">Small</cs-tag>
<cs-tag size="m">Medium</cs-tag>
<cs-tag size="l">Large</cs-tag>
<cs-tag size="xl">Extra Large</cs-tag>
```

### Pill

Use the `pill` attribute to give tags rounded edges.

```html {.example}
<cs-tag size="xs" pill>Extra Small</cs-tag>
<cs-tag size="s" pill>Small</cs-tag>
<cs-tag size="m" pill>Medium</cs-tag>
<cs-tag size="l" pill>Large</cs-tag>
<cs-tag size="xl" pill>Extra Large</cs-tag>
```

### Removable

Use the `with-remove` attribute to add a remove button to the tag. The button carries a built-in `Remove` label for assistive technology, and activating it emits the `cs-remove` event so you can handle the removal.

```html {.example}
<div class="tags-removable">
  <cs-tag size="xs" with-remove>Extra Small</cs-tag>
  <cs-tag size="s" with-remove>Small</cs-tag>
  <cs-tag size="m" with-remove>Medium</cs-tag>
  <cs-tag size="l" with-remove>Large</cs-tag>
  <cs-tag size="xl" with-remove>Extra Large</cs-tag>
</div>

<script>
  const div = document.querySelector('.tags-removable');

  div.addEventListener('cs-remove', event => {
    const tag = event.target;
    tag.style.opacity = '0';
    setTimeout(() => (tag.style.opacity = '1'), 2000);
  });
</script>

<style>
  .tags-removable cs-tag {
    transition: opacity var(--cs-transition-normal);
  }
</style>
```
