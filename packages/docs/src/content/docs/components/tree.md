---
title: Tree
category: Navigation
synonyms:
  - treeview
  - tree view
  - file tree
  - hierarchy
use-cases:
  - file browser
  - directory tree
  - nested list
  - org chart
description: "Trees allow you to display a hierarchical list of selectable tree items. Items with children can be expanded and collapsed as desired by the user."
---

```html {.example}
<cs-tree style="--indent-guide-width: 1px;">
  <cs-tree-item expanded>
    Deciduous
    <cs-tree-item>Birch</cs-tree-item>
    <cs-tree-item expanded>
      Maple
      <cs-tree-item>Field maple</cs-tree-item>
      <cs-tree-item>Red maple</cs-tree-item>
      <cs-tree-item>Sugar maple</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>Oak</cs-tree-item>
    <cs-tree-item>Walnut</cs-tree-item>
  </cs-tree-item>

  <cs-tree-item>
    Coniferous
    <cs-tree-item>Cedar</cs-tree-item>
    <cs-tree-item>
      Pine
      <cs-tree-item>Eastern white pine</cs-tree-item>
      <cs-tree-item>Ponderosa pine</cs-tree-item>
      <cs-tree-item>Scots pine</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>Spruce</cs-tree-item>
    <cs-tree-item>Fir</cs-tree-item>
  </cs-tree-item>

  <cs-tree-item>
    Tropical
    <cs-tree-item>Banyan</cs-tree-item>
    <cs-tree-item>Coconut palm</cs-tree-item>
    <cs-tree-item>Mahogany</cs-tree-item>
    <cs-tree-item>Teak</cs-tree-item>
  </cs-tree-item>
</cs-tree>
```

## Examples

### Selection

Set the `selection` attribute to change what a tree lets you select.

| Value                                                                              | Selects                              |
| ---------------------------------------------------------------------------------- | ------------------------------------ |
| `single` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge> | One item at a time                   |
| `multiple`                                                                         | Any number of items                  |
| `leaf`                                                                             | One leaf node (a node with no children) |
| `leaf-multiple`                                                                    | Any number of leaf nodes             |

```html {.example}
<div>
  <cs-tree class="tree-selectable">
    <cs-tree-item expanded>
      Electronics
      <cs-tree-item expanded>
        Computers
        <cs-tree-item>Laptops</cs-tree-item>
        <cs-tree-item>Desktops</cs-tree-item>
        <cs-tree-item>Tablets</cs-tree-item>
      </cs-tree-item>
      <cs-tree-item>
        Phones
        <cs-tree-item>Smartphones</cs-tree-item>
        <cs-tree-item>Accessories</cs-tree-item>
      </cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>
      Clothing
      <cs-tree-item>Shirts</cs-tree-item>
      <cs-tree-item>Pants</cs-tree-item>
      <cs-tree-item>Shoes</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>Books</cs-tree-item>
  </cs-tree>

  <cs-divider></cs-divider>

  <cs-select id="selection-mode" value="single" label="Selection">
    <cs-option value="single">Single</cs-option>
    <cs-option value="multiple">Multiple</cs-option>
    <cs-option value="leaf">Leaf</cs-option>
    <cs-option value="leaf-multiple">Leaf-multiple</cs-option>
  </cs-select>
</div>

<script>
  const selectionMode = document.querySelector('#selection-mode');
  const tree = document.querySelector('.tree-selectable');

  selectionMode.addEventListener('change', () => {
    tree.querySelectorAll('cs-tree-item').forEach(item => (item.selected = false));
    tree.selection = selectionMode.value;
  });
</script>
```

### Size

Trees inherit their font size by default. You can change the size of a tree and all of its items by setting `font-size` on the `<cs-tree>` element. All internal dimensions, including checkboxes, expand buttons, and labels, scale proportionally.

```html {.example}
<cs-tree style="font-size: .75rem;" selection="multiple">
  <cs-tree-item expanded>
    Small
    <cs-tree-item>Newsletters</cs-tree-item>
    <cs-tree-item>
      Promotions
      <cs-tree-item>Weekly deals</cs-tree-item>
      <cs-tree-item>Seasonal sales</cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>
</cs-tree>

<br />

<cs-tree selection="multiple">
  <cs-tree-item expanded>
    Default
    <cs-tree-item>Newsletters</cs-tree-item>
    <cs-tree-item>
      Promotions
      <cs-tree-item>Weekly deals</cs-tree-item>
      <cs-tree-item>Seasonal sales</cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>
</cs-tree>

<br />

<cs-tree style="font-size: 1.5rem;" selection="multiple">
  <cs-tree-item expanded>
    Large
    <cs-tree-item>Newsletters</cs-tree-item>
    <cs-tree-item>
      Promotions
      <cs-tree-item>Weekly deals</cs-tree-item>
      <cs-tree-item>Seasonal sales</cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>
</cs-tree>
```

### Indent Guides

Set the `--indent-guide-width` custom property to draw indent guides. The `--indent-guide-color`, `--indent-guide-style`, and `--indent-guide-offset` custom properties tune their color, style, and offset.

```html {.example}
<cs-tree class="tree-with-lines">
  <cs-tree-item expanded>
    Design
    <cs-tree-item expanded>
      Brand
      <cs-tree-item>Colors</cs-tree-item>
      <cs-tree-item>Typography</cs-tree-item>
      <cs-tree-item>Logo</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>
      Components
      <cs-tree-item>Buttons</cs-tree-item>
      <cs-tree-item>Forms</cs-tree-item>
      <cs-tree-item>Navigation</cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>

  <cs-tree-item expanded>
    Development
    <cs-tree-item>Frontend</cs-tree-item>
    <cs-tree-item>Backend</cs-tree-item>
    <cs-tree-item>Infrastructure</cs-tree-item>
  </cs-tree-item>

  <cs-tree-item>
    Marketing
    <cs-tree-item>Social Media</cs-tree-item>
    <cs-tree-item>Email Campaigns</cs-tree-item>
    <cs-tree-item>Analytics</cs-tree-item>
  </cs-tree-item>
</cs-tree>

<style>
  .tree-with-lines {
    --indent-guide-width: 1px;
  }
</style>
```

### Expand & Collapse Icons

Use the `expand-icon` and `collapse-icon` slots to change the expand and collapse icons, respectively. To disable the animation, override the `rotate` property on the `expand-button` part as shown below.

```html {.example}
<cs-tree class="custom-icons">
  <cs-icon name="add_box" slot="expand-icon"></cs-icon>
  <cs-icon name="indeterminate_check_box" slot="collapse-icon"></cs-icon>

  <cs-tree-item expanded>
    Recipes
    <cs-tree-item expanded>
      Breakfast
      <cs-tree-item>Pancakes</cs-tree-item>
      <cs-tree-item>Omelette</cs-tree-item>
      <cs-tree-item>Granola</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>
      Lunch
      <cs-tree-item>Caesar salad</cs-tree-item>
      <cs-tree-item>Grilled chicken wrap</cs-tree-item>
    </cs-tree-item>
    <cs-tree-item>
      Dinner
      <cs-tree-item>Pasta carbonara</cs-tree-item>
      <cs-tree-item>Stir fry</cs-tree-item>
      <cs-tree-item>Roasted salmon</cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>

  <cs-tree-item>
    Desserts
    <cs-tree-item>Chocolate cake</cs-tree-item>
    <cs-tree-item>Tiramisu</cs-tree-item>
    <cs-tree-item>Fruit tart</cs-tree-item>
  </cs-tree-item>
</cs-tree>

<style>
  .custom-icons cs-tree-item::part(expand-button) {
    /* Disable the expand/collapse animation */
    rotate: none;
  }
</style>
```

### Item Icons

Decorative icons can be used before labels to provide hints for each node.

```html {.example}
<cs-tree class="tree-with-icons">
  <cs-tree-item expanded>
    <cs-icon name="folder"></cs-icon>
    Documents

    <cs-tree-item expanded>
      <cs-icon name="folder"></cs-icon>
      Photos
      <cs-tree-item>
        <cs-icon name="image"></cs-icon>
        vacation.jpg
      </cs-tree-item>
      <cs-tree-item>
        <cs-icon name="image"></cs-icon>
        family-portrait.png
      </cs-tree-item>
      <cs-tree-item>
        <cs-icon name="image"></cs-icon>
        sunset.jpg
      </cs-tree-item>
    </cs-tree-item>

    <cs-tree-item expanded>
      <cs-icon name="folder"></cs-icon>
      Work
      <cs-tree-item>
        <cs-icon name="picture_as_pdf"></cs-icon>
        quarterly-report.pdf
      </cs-tree-item>
      <cs-tree-item>
        <cs-icon name="description"></cs-icon>
        budget.xls
      </cs-tree-item>
      <cs-tree-item>
        <cs-icon name="draft"></cs-icon>
        meeting-notes.txt
      </cs-tree-item>
    </cs-tree-item>

    <cs-tree-item>
      <cs-icon name="folder"></cs-icon>
      Personal
      <cs-tree-item>
        <cs-icon name="draft"></cs-icon>
        journal.txt
      </cs-tree-item>
      <cs-tree-item>
        <cs-icon name="picture_as_pdf"></cs-icon>
        resume.pdf
      </cs-tree-item>
    </cs-tree-item>
  </cs-tree-item>

  <cs-tree-item>
    <cs-icon name="folder"></cs-icon>
    Downloads
    <cs-tree-item>
      <cs-icon name="folder_zip"></cs-icon>
      archive.zip
    </cs-tree-item>
    <cs-tree-item>
      <cs-icon name="draft"></cs-icon>
      readme.txt
    </cs-tree-item>
  </cs-tree-item>
</cs-tree>
```

### Lazy Loading

Use the `lazy` attribute on a tree item to indicate that the content is not yet present and will be loaded later. When the user tries to expand the node, the `loading` state is set to `true` and the `cs-lazy-load` event will be emitted to allow you to load data asynchronously. The item will remain in a loading state until its content is changed.

If you want to disable this behavior after the first load, remove the `lazy` attribute and, on the next expand, the existing content will be shown instead.

```html {.example}
<cs-tree>
  <cs-tree-item lazy>Remote Repositories</cs-tree-item>
</cs-tree>

<script type="module">
  const lazyItem = document.querySelector('cs-tree-item[lazy]');

  lazyItem.addEventListener('cs-lazy-load', () => {
    // Simulate fetching data from a server
    setTimeout(() => {
      const repos = ['design-system', 'marketing-site', 'mobile-app', 'api-gateway'];

      for (const repo of repos) {
        const treeItem = document.createElement('cs-tree-item');
        treeItem.innerText = repo;
        lazyItem.append(treeItem);
      }

      // Disable lazy mode once the content has been loaded
      lazyItem.lazy = false;
    }, 1000);
  });
</script>
```
