---
title: Drawer
category: Layout
hasAnatomy: false
synonyms:
  - sidebar
  - side panel
  - offcanvas
  - slide-out
  - tray
  - sheet
use-cases:
  - navigation drawer
  - filter panel
  - mobile menu
  - bottom sheet
description: "Drawers slide in from the edge of a container to expose additional options and information without navigating away. Useful for navigation menus, filters, and secondary content."
---

```html {.example}
<cs-drawer label="Drawer" id="drawer-overview">
  Drawers are great for showing additional content without leaving the current page.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('#drawer-overview');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

## Examples

### Without a Header

Headers are enabled by default. To render a drawer without a header, add the `without-header` attribute.

```html {.example}
<cs-drawer label="Drawer" without-header class="drawer-without-header">
  Look ma, no header!
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-without-header');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Footer

Footers can be used to display titles and more. Use the `footer` slot to add a footer to the drawer.

```html {.example}
<cs-drawer label="Drawer" class="drawer-footer">
  This drawer has a footer where you can put actions and other controls.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-footer');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Opening & Closing Declaratively

You can open and close drawers with JavaScript by toggling the `open` attribute, but you can also do it declaratively. Add the `data-drawer="open id"` to any button on the page, where `id` is the ID of the drawer you want to open.

```html {.example}
<cs-drawer label="Drawer" id="drawer-opening">
  This drawer was opened declaratively using a data attribute on the button.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled" data-drawer="open drawer-opening">Open Drawer</cs-button>
```

Similarly, you can add `data-drawer="close"` to a button _inside_ of a drawer to tell it to close.

```html {.example}
<cs-drawer label="Drawer" id="drawer-dismiss">
  Click the button below to close this drawer — no JavaScript required!
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled" data-drawer="open drawer-dismiss">Open Drawer</cs-button>
```

### Placement

Drawers slide in from the end by default. Set the `placement` attribute to slide in from a different edge.

| Placement                                                                       | Slides in from           |
| ------------------------------------------------------------------------------- | ------------------------ |
| `end` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge> | The end (right, in LTR)  |
| `start`                                                                         | The start (left, in LTR) |
| `top`                                                                           | The top                  |
| `bottom`                                                                        | The bottom               |

```html {.example}
<cs-drawer label="Drawer" placement="start" class="drawer-placement-start">
  This drawer slides in from the start.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open from Start</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-placement-start');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

```html {.example}
<cs-drawer label="Drawer" placement="bottom" class="drawer-placement-bottom">
  This drawer slides in from the bottom.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open from Bottom</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-placement-bottom');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Size

Use the `--size` custom property to set the drawer's size. This will be applied to the drawer's width or height depending on its `placement`.

```html {.example}
<cs-drawer label="Drawer" class="drawer-custom-size" style="--size: 50vw;">
  This drawer is always 50% of the viewport.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-custom-size');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Scrolling

By design, a drawer's height will never exceed 100% of its container. As such, drawers will not scroll with the page to ensure the header and footer are always accessible to the user.

```html {.example}
<cs-drawer label="Drawer" class="drawer-scrolling">
  <div style="height: 150vh; border: dashed 2px var(--cs-color-surface-border); padding: 0 1rem;">
    <p class="cs-cluster cs-gap-2xs">Scroll down and give it a try! <cs-icon name="arrow_downward"></cs-icon></p>
  </div>
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-scrolling');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Header Actions

The header shows a functional close button by default. You can use the `header-actions` slot to add additional [buttons](/components/button) if needed.

```html {.example}
<cs-drawer label="Drawer" class="drawer-header-actions">
  <cs-button class="new-window" slot="header-actions" appearance="plain">
    <cs-icon name="open_in_new" label="Open in new window"></cs-icon>
  </cs-button>
  You can add custom actions to the header, like the button up there to open in a new window.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-header-actions');
  const openButton = drawer.nextElementSibling;
  const newWindowButton = drawer.querySelector('.new-window');

  openButton.addEventListener('click', () => (drawer.open = true));
  newWindowButton.addEventListener('click', () => window.open(location.href));
</script>
```

### Light Dismissal

If you want the drawer to close when the user clicks on the overlay, add the `light-dismiss` attribute.

```html {.example}
<cs-drawer label="Drawer" light-dismiss class="drawer-light-dismiss">
  This drawer will close when you click on the overlay.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-light-dismiss');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```

### Preventing the Drawer from Closing

By default, drawers will close when the user clicks the close button, clicks the overlay, or presses the [[Escape]] key. In most cases, the default behavior is the best behavior in terms of UX. However, there are situations where this may be undesirable, such as when data loss will occur.

To keep the drawer open in such cases, you can cancel the `cs-hide` event. When canceled, the drawer will remain open and pulse briefly to draw the user's attention to it.

You can use `event.detail.source` to determine what triggered the request to close. This example prevents the drawer from closing when the overlay is clicked, but allows the close button or [[Escape]] to dismiss it.

```html {.example}
<cs-drawer label="Drawer" class="drawer-deny-close">
  This drawer will only close when you click the button below.
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-deny-close');
  const openButton = drawer.nextElementSibling;
  const closeButton = drawer.querySelector('cs-button[slot="footer"]');

  openButton.addEventListener('click', () => (drawer.open = true));

  // Prevent the drawer from closing unless the close button is clicked
  drawer.addEventListener('cs-hide', event => {
    if (event.detail.source !== closeButton) {
      event.preventDefault();
    }
  });
</script>
```

### Initial Focus

To give focus to a specific element when the drawer opens, use the `autofocus` attribute.

```html {.example}
<cs-drawer label="Drawer" class="drawer-focus">
  <cs-input autofocus placeholder="I will have focus when the drawer is opened"></cs-input>
  <cs-button slot="footer" variant="brand" data-drawer="close">Close</cs-button>
</cs-drawer>

<cs-button appearance="filled">Open Drawer</cs-button>

<script type="module">
  const drawer = document.querySelector('.drawer-focus');
  const input = drawer.querySelector('cs-input');
  const openButton = drawer.nextElementSibling;

  openButton.addEventListener('click', () => (drawer.open = true));
</script>
```
