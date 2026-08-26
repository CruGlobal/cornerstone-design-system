---
title: Dropdown
category: Actions
hasAnatomy: false
synonyms:
  - menu
  - context menu
  - action menu
  - popout
use-cases:
  - dropdown menu
  - action list
  - command menu
  - right-click menu
description: "Dropdowns display a list of options triggered by a button or other element. They support keyboard navigation, submenus, and checkable items for building menus and context actions."
---

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Options</cs-button>

  <cs-dropdown-item value="edit">Edit</cs-dropdown-item>
  <cs-dropdown-item value="duplicate">Duplicate</cs-dropdown-item>
  <cs-dropdown-item value="delete">Delete</cs-dropdown-item>
</cs-dropdown>
```

A dropdown pairs a trigger with a panel: activating the trigger opens the panel, and interacting outside it closes the panel. Most dropdowns hold [dropdown items](/components/dropdown-item), but the API also gives you direct control over showing, hiding, and positioning the panel for lower-level uses.

## Examples

### Showing Icons

Use the `icon` slot to add an icon before a [dropdown item's](/components/dropdown-item) label. This works best with [icon](/components/icon) elements.

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Edit</cs-button>

  <cs-dropdown-item value="cut">
    <cs-icon slot="icon" name="content_cut"></cs-icon>
    Cut
  </cs-dropdown-item>

  <cs-dropdown-item value="copy">
    <cs-icon slot="icon" name="content_copy"></cs-icon>
    Copy
  </cs-dropdown-item>

  <cs-dropdown-item value="paste">
    <cs-icon slot="icon" name="content_paste"></cs-icon>
    Paste
  </cs-dropdown-item>

  <cs-dropdown-item value="delete" variant="danger">
    <cs-icon slot="icon" name="delete"></cs-icon>
    Delete
  </cs-dropdown-item>
</cs-dropdown>
```

### Showing Labels & Dividers

Use any heading (`<h1>`–`<h6>`) to label a group of items, and the [`<cs-divider>`](/components/divider) element to separate them.

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Device</cs-button>

  <h3>Type</h3>
  <cs-dropdown-item value="phone">Phone</cs-dropdown-item>
  <cs-dropdown-item value="tablet">Tablet</cs-dropdown-item>
  <cs-dropdown-item value="desktop">Desktop</cs-dropdown-item>

  <cs-divider></cs-divider>

  <cs-dropdown-item value="more">More options…</cs-dropdown-item>
</cs-dropdown>
```

### Showing Details

Use the `details` slot to show secondary content after the label, such as a keyboard shortcut.

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Message</cs-button>

  <cs-dropdown-item value="reply">
    Reply
    <span slot="details">⌘R</span>
  </cs-dropdown-item>

  <cs-dropdown-item value="forward">
    Forward
    <span slot="details">⌘F</span>
  </cs-dropdown-item>

  <cs-dropdown-item value="move">
    Move
    <span slot="details">⌘M</span>
  </cs-dropdown-item>

  <cs-divider></cs-divider>

  <cs-dropdown-item value="archive">
    Archive
    <span slot="details">⌘A</span>
  </cs-dropdown-item>

  <cs-dropdown-item value="delete" variant="danger">
    Delete
    <span slot="details">Del</span>
  </cs-dropdown-item>
</cs-dropdown>
```

### Checkable Items

Set `type="checkbox"` to turn a [dropdown item](/components/dropdown-item) into a toggle, and add `checked` to start it on. Selecting a checkable item flips its `checked` state and closes the dropdown; cancel the `cs-select` event to keep it open instead.

```html {.example}
<div class="dropdown-checkboxes">
  <cs-dropdown>
    <cs-button appearance="filled" slot="trigger" with-caret>View</cs-button>

    <cs-dropdown-item type="checkbox" value="canvas" checked>Show canvas</cs-dropdown-item>
    <cs-dropdown-item type="checkbox" value="grid" checked>Show grid</cs-dropdown-item>
    <cs-dropdown-item type="checkbox" value="source">Show source</cs-dropdown-item>

    <cs-divider></cs-divider>

    <cs-dropdown-item value="preferences">Preferences…</cs-dropdown-item>
  </cs-dropdown>
</div>

<script type="module">
  const container = document.querySelector('.dropdown-checkboxes');
  const dropdown = container.querySelector('cs-dropdown');

  dropdown.addEventListener('cs-select', event => {
    if (event.detail.item.type === 'checkbox') {
      console.log(event.detail.item.value, event.detail.item.checked ? 'checked' : 'unchecked');
    } else {
      console.log(event.detail.item.value);
    }
  });
</script>
```

:::info
When any item is checkable, every item in the dropdown gains matching padding so labels stay aligned.
:::

### Destructive Items

Set `variant="danger"` on a [dropdown item](/components/dropdown-item) to flag a destructive action like deleting.

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Project</cs-button>

  <cs-dropdown-item value="share">
    <cs-icon slot="icon" name="share"></cs-icon>
    Share
  </cs-dropdown-item>

  <cs-dropdown-item value="preferences">
    <cs-icon slot="icon" name="settings"></cs-icon>
    Preferences
  </cs-dropdown-item>

  <cs-divider></cs-divider>

  <h3>Danger zone</h3>

  <cs-dropdown-item value="archive">
    <cs-icon slot="icon" name="archive"></cs-icon>
    Archive
  </cs-dropdown-item>

  <cs-dropdown-item value="delete" variant="danger">
    <cs-icon slot="icon" name="delete"></cs-icon>
    Delete
  </cs-dropdown-item>
</cs-dropdown>
```

### Submenus

To nest a menu, place [dropdown items](/components/dropdown-item) inside another item with `slot="submenu"`. Add [dividers](/components/divider) between groups as needed.

```html {.example}
<div class="dropdown-submenus">
  <cs-dropdown>
    <cs-button appearance="filled" slot="trigger" with-caret>File</cs-button>

    <cs-dropdown-item value="new">New</cs-dropdown-item>
    <cs-dropdown-item value="open">Open</cs-dropdown-item>

    <cs-divider></cs-divider>

    <cs-dropdown-item>
      Export
      <cs-dropdown-item slot="submenu" value="pdf">PDF</cs-dropdown-item>
      <cs-dropdown-item slot="submenu" value="docx">Word document</cs-dropdown-item>
      <cs-dropdown-item slot="submenu" value="xlsx">Excel spreadsheet</cs-dropdown-item>
      <cs-dropdown-item slot="submenu" value="csv">CSV</cs-dropdown-item>
    </cs-dropdown-item>

    <cs-dropdown-item>
      Options
      <cs-dropdown-item slot="submenu" type="checkbox" value="compress">Compress files</cs-dropdown-item>
      <cs-dropdown-item slot="submenu" type="checkbox" checked value="metadata">Include metadata</cs-dropdown-item>
      <cs-dropdown-item slot="submenu" type="checkbox" value="password">Password protect</cs-dropdown-item>
    </cs-dropdown-item>
  </cs-dropdown>
</div>

<script type="module">
  const container = document.querySelector('.dropdown-submenus');
  const dropdown = container.querySelector('cs-dropdown');

  dropdown.addEventListener('cs-select', event => {
    console.log(event.detail.item.value);
  });
</script>
```

:::info
An item that opens a submenu won't emit `cs-select` itself. Items inside the submenu do, unless they open a submenu of their own.
:::

:::warning
<strong>Avoid nesting more than one level of submenu.</strong><br />
Deeply nested menus are hard to navigate, especially with a pointer. Flatten the structure or move secondary choices into a separate view when you can.
:::

### Disabled

Add `disabled` to any [dropdown item](/components/dropdown-item) to make it unselectable.

```html {.example}
<cs-dropdown>
  <cs-button appearance="filled" slot="trigger" with-caret>Payment method</cs-button>

  <cs-dropdown-item value="cash">Cash</cs-dropdown-item>
  <cs-dropdown-item value="check" disabled>Personal check</cs-dropdown-item>
  <cs-dropdown-item value="credit">Credit card</cs-dropdown-item>
  <cs-dropdown-item value="gift-card">Gift card</cs-dropdown-item>
</cs-dropdown>
```

### Placement

Set the `placement` attribute to control where the panel opens relative to the trigger. The panel shifts to a more optimal spot when the preferred placement doesn't have room.

| Placement                                                                                | Opens                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `bottom-start` <cs-badge appearance="outlined" variant="neutral" pill>default</cs-badge> | Below the trigger, aligned to its start edge           |
| `bottom`, `bottom-end`                                                                   | Below the trigger, centered or aligned to the end edge |
| `top`, `top-start`, `top-end`                                                            | Above the trigger                                      |
| `right`, `right-start`, `right-end`                                                      | To the right of the trigger                            |
| `left`, `left-start`, `left-end`                                                         | To the left of the trigger                             |

```html {.example}
<cs-dropdown placement="right-start">
  <cs-button appearance="filled" slot="trigger">
    File formats
    <cs-icon slot="end" name="keyboard_arrow_right"></cs-icon>
  </cs-button>

  <cs-dropdown-item value="pdf">PDF document</cs-dropdown-item>
  <cs-dropdown-item value="docx">Word document</cs-dropdown-item>
  <cs-dropdown-item value="xlsx">Excel spreadsheet</cs-dropdown-item>
  <cs-dropdown-item value="pptx">PowerPoint presentation</cs-dropdown-item>
  <cs-dropdown-item value="txt">Plain text</cs-dropdown-item>
  <cs-dropdown-item value="json">JSON file</cs-dropdown-item>
</cs-dropdown>
```

### Distance

Set the `distance` attribute to change the gap between the panel and the trigger, in pixels.

```html {.example}
<cs-dropdown distance="30">
  <cs-button appearance="filled" slot="trigger" with-caret>Edit</cs-button>

  <cs-dropdown-item>Cut</cs-dropdown-item>
  <cs-dropdown-item>Copy</cs-dropdown-item>
  <cs-dropdown-item>Paste</cs-dropdown-item>

  <cs-divider></cs-divider>

  <cs-dropdown-item>Find</cs-dropdown-item>
  <cs-dropdown-item>Replace</cs-dropdown-item>
</cs-dropdown>
```

### Offset

Set the `skidding` attribute to slide the panel along the trigger, in pixels.

```html {.example}
<cs-dropdown skidding="30">
  <cs-button appearance="filled" slot="trigger" with-caret>Edit</cs-button>

  <cs-dropdown-item>Cut</cs-dropdown-item>
  <cs-dropdown-item>Copy</cs-dropdown-item>
  <cs-dropdown-item>Paste</cs-dropdown-item>

  <cs-divider></cs-divider>

  <cs-dropdown-item>Find</cs-dropdown-item>
  <cs-dropdown-item>Replace</cs-dropdown-item>
</cs-dropdown>
```

### Reacting to Selections

When an item is selected, the dropdown emits the `cs-select` event. Inspect `event.detail.item` for the selected [dropdown item](/components/dropdown-item); if you set a `value` on each item, read it from `event.detail.item.value`.

```html {.example}
<div class="dropdown-zoom-demo">
  <div class="dropdown-zoom-stage">
    <div class="dropdown-zoom-content">
      <cs-icon name="image"></cs-icon>
      <span class="dropdown-zoom-level">100%</span>
    </div>
  </div>

  <cs-dropdown>
    <cs-button appearance="filled" slot="trigger" with-caret>View</cs-button>
    <cs-dropdown-item value="zoom-in">Zoom in</cs-dropdown-item>
    <cs-dropdown-item value="zoom-out">Zoom out</cs-dropdown-item>
    <cs-divider></cs-divider>
    <cs-dropdown-item value="actual">Actual size</cs-dropdown-item>
  </cs-dropdown>
</div>

<script type="module">
  const demo = document.querySelector('.dropdown-zoom-demo');
  const content = demo.querySelector('.dropdown-zoom-content');
  const level = demo.querySelector('.dropdown-zoom-level');
  const dropdown = demo.querySelector('cs-dropdown');
  let zoom = 1;

  dropdown.addEventListener('cs-select', event => {
    const action = event.detail.item.value;

    if (action === 'zoom-in') zoom = Math.min(zoom + 0.25, 2);
    if (action === 'zoom-out') zoom = Math.max(zoom - 0.25, 0.5);
    if (action === 'actual') zoom = 1;

    content.style.transform = `scale(${zoom})`;
    level.textContent = `${Math.round(zoom * 100)}%`;
  });
</script>

<style>
  .dropdown-zoom-demo .dropdown-zoom-stage {
    display: grid;
    place-items: center;
    height: 12rem;
    margin-block-end: var(--cs-space-m);
    overflow: hidden;
    border-radius: var(--cs-border-radius-l);
    background-color: color-mix(in srgb, var(--cs-color-brand-fill-loud) 8%, transparent);
  }

  .dropdown-zoom-demo .dropdown-zoom-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--cs-space-2xs);
    transition: transform 150ms ease;
  }

  .dropdown-zoom-demo .dropdown-zoom-content cs-icon {
    font-size: 3rem;
    color: var(--cs-color-brand-fill-loud);
  }

  .dropdown-zoom-demo .dropdown-zoom-level {
    font-size: var(--cs-font-size-s);
    font-variant-numeric: tabular-nums;
  }
</style>
```

:::info
To keep the dropdown open after a selection, call `event.preventDefault()` in the `cs-select` handler.
:::
