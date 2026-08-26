---
title: Details
category: Layout
synonyms:
  - accordion
  - collapsible
  - expandable
  - disclosure
  - expander
use-cases:
  - FAQ
  - show more
  - expandable section
  - toggle content
description: "Details display a brief summary and expand to reveal additional content. Use them to progressively disclose information, group related FAQs, or hide advanced options."
---

```html {.example}
<cs-details summary="Toggle Me">
  Click the summary to expand and collapse the details component. You can put any content in here that you want to
  reveal on demand!
</cs-details>
```

## Examples

### Expanded Initially

Use the `open` attribute to expand the details initially.

```html {.example .anatomy}
<cs-details summary="Toggle Me" open>
  This details component is expanded by default. Users can click the summary to collapse it if they want to hide the
  content.
</cs-details>
```

### Disabled

Use the `disabled` attribute to prevent the details from expanding.

```html {.example}
<cs-details summary="Disabled" disabled>
  This content can't be seen because the details component is disabled. Try removing the disabled attribute to reveal
  what's inside!
</cs-details>
```

### Expand & Collapse Icons

Use the `expand-icon` and `collapse-icon` slots to change the expand and collapse icons, respectively. To disable the animation, override the `rotate` property on the `icon` part as shown below.

```html {.example}
<cs-details summary="Toggle Me" class="custom-icons">
  <cs-icon name="add_box" slot="expand-icon"></cs-icon>
  <cs-icon name="indeterminate_check_box" slot="collapse-icon"></cs-icon>

  This example uses custom plus and minus icons for expanding and collapsing. You can use any icon you want to match the
  look and feel of your app.
</cs-details>

<style>
  /* Disable the expand/collapse animation */
  cs-details.custom-icons::part(icon) {
    rotate: none;
  }
</style>
```

### Icon Placement

The default position for the expand and collapse icons is at the end of the summary. Set the `icon-placement` attribute to `start` to place the icon at the start of the summary.

```html {.example}
<div class="cs-stack">
  <cs-details summary="Start" icon-placement="start">
    The expand/collapse icon is at the start of the summary. This is a common pattern that feels familiar to users who
    are used to tree views and file explorers.
  </cs-details>
  <cs-details summary="End" icon-placement="end">
    The expand/collapse icon is at the end of the summary. This is the default placement and works great for most use
    cases.
  </cs-details>
</div>
```

### HTML in Summary

To use HTML in the summary, use the `summary` slot.
Links and other interactive elements will still retain their behavior:

```html {.example}
<cs-details>
  <span slot="summary">
    Some text
    <a href="https://github.com/CruGlobal/cornerstone-design-system" target="_blank">a link</a>
    more text
  </span>

  You can use the summary slot to put HTML in the summary, including links and other interactive elements. Pretty neat,
  right?
</cs-details>
```

### Right-to-Left Languages

The details component, including its `icon-placement`, automatically adapts to right-to-left languages:

```html {.example .no-dir}
<div class="cs-stack">
  <cs-details summary="تبديلني" lang="ar" dir="rtl">
    استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً عن
  </cs-details>
  <cs-details summary="تبديلني" lang="ar" dir="rtl" icon-placement="start">
    استخدام طريقة لوريم إيبسوم لأنها تعطي توزيعاَ طبيعياَ -إلى حد ما- للأحرف عوضاً عن
  </cs-details>
</div>
```

### Appearance

Use the `appearance` attribute to change the element’s visual appearance.

```html {.example}
<div class="cs-stack">
  <cs-details summary="Outlined (default)">
    This is the default outlined appearance. It has a subtle border that helps it stand out without being too flashy.
  </cs-details>
  <cs-details summary="Filled-outlined" appearance="filled-outlined">
    The filled-outlined appearance combines a filled header with an outlined body. It gives the summary a bit more
    visual weight while keeping the content area clean.
  </cs-details>
  <cs-details summary="Filled" appearance="filled">
    The filled appearance adds a background color to the entire component. Use this when you want the details to really
    pop on the page.
  </cs-details>
  <cs-details summary="Plain" appearance="plain">
    No bells and whistles on this one. The plain appearance strips away borders and backgrounds for a minimalist look.
  </cs-details>
</div>
```

### Grouping Details

Use the `name` attribute to create accordion-like behavior where only one details element with the same name can be open at a time. This matches the behavior of native `<details>` elements.

```html {.example}
<div class="cs-stack">
  <cs-details name="group-1" summary="Section 1" open>
    This is the first section of the accordion. When you open another section, this one will close automatically. Give
    it a try!
  </cs-details>

  <cs-details name="group-1" summary="Section 2">
    This is the second section. Notice how the first section closed when you opened this one? That's the accordion
    behavior in action, powered by the shared name attribute.
  </cs-details>

  <cs-details name="group-1" summary="Section 3">
    And here's the third section. You can have as many sections as you need — just make sure they all share the same
    name and only one will be open at a time.
  </cs-details>
</div>
```
