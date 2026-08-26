---
title: Popup
category: Helpers
hasAnatomy: false
synonyms:
  - floating element
  - anchor
  - positioned element
use-cases:
  - tooltip anchor
  - dropdown anchor
  - floating UI
description: "Popups declaratively anchor one element to another and keep them positioned together as the page scrolls or resizes. Primarily a low-level building block for popovers, dropdowns, and tooltips."
---

```html {.example}
<div class="popup-overview">
  <cs-popup placement="top" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <div class="popup-overview-options cs-cluster cs-align-items-end">
      <cs-select
        label="Placement"
        name="placement"
        placeholder="Select placement..."
        class="popup-overview-select"
      ></cs-select>
      <cs-input type="number" name="distance" label="distance" value="0"></cs-input>
      <cs-input type="number" name="skidding" label="Skidding" value="0"></cs-input>
    </div>

    <div class="popup-overview-options cs-cluster cs-align-items-end">
      <cs-switch name="active" checked>Active</cs-switch>
      <cs-switch name="arrow">Arrow</cs-switch>
    </div>
  </div>
</div>

<script type="module">
  await customElements.whenDefined('cs-select');
  await customElements.whenDefined('cs-option');

  const container = document.querySelector('.popup-overview');
  const popup = container.querySelector('cs-popup');
  const placement = container.querySelector('cs-select[name="placement"]');
  const distance = container.querySelector('cs-input[name="distance"]');
  const skidding = container.querySelector('cs-input[name="skidding"]');
  const active = container.querySelector('cs-switch[name="active"]');
  const arrow = container.querySelector('cs-switch[name="arrow"]');

  const placements = [
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'right',
    'right-start',
    'right-end',
    'left',
    'left-start',
    'left-end',
  ];

  placements.forEach(value => {
    const option = document.createElement('cs-option');
    option.value = value;
    option.textContent = value;
    placement.append(option);
  });

  await placement.updateComplete;

  placement.value = 'top';

  placement.addEventListener('change', () => (popup.placement = placement.value));
  distance.addEventListener('input', () => (popup.distance = distance.value));
  skidding.addEventListener('input', () => (popup.skidding = skidding.value));
  active.addEventListener('change', () => (popup.active = active.checked));
  arrow.addEventListener('change', () => (popup.arrow = arrow.checked));
</script>

<style>
  .popup-overview cs-popup {
    --arrow-color: var(--cs-color-brand-fill-loud);
  }

  .popup-overview span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-overview .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-overview-options cs-select {
    width: 160px;
  }

  .popup-overview-options cs-input {
    width: 100px;
  }

  .popup-overview-options + .popup-overview-options {
    margin-top: var(--cs-space-m);
  }
</style>
```

This component's name is inspired by [`<popup>`](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/Popup/explainer.md). It uses [Floating UI](https://floating-ui.com/) under the hood to provide a well-tested, lightweight, and fully declarative positioning utility for tooltips, dropdowns, and more.

Popup doesn't provide any styles — just positioning! The popup's preferred placement, distance, and skidding (offset) can be configured using attributes. An arrow that points to the anchor can be shown and customized to your liking. Additional positioning options are available and described in more detail below.

:::warning
<strong>Popup is a low-level positioning utility, not an accessible component.</strong><br />
Don't use it as a [tooltip](/components/tooltip) or similar — it doesn't facilitate an accessible experience. Almost every correct use builds it into another component rather than placing `<cs-popup>` directly in your HTML.
:::

:::info
<strong>Don't style a popup's anchor with `display: contents`.</strong><br />
The coordinates won't be eligible for calculation. If the anchor is a `<slot>`, popup uses the first assigned element as the anchor, so components can pass anchors through via composition.
:::

## Examples

### Activating

Popups are inactive and hidden until the `active` attribute is applied. Removing the attribute will tear down all positioning logic and listeners, meaning you can have many idle popups on the page without affecting performance.

```html {.example}
<div class="popup-active">
  <cs-popup placement="top" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <cs-switch checked>Active</cs-switch>
</div>

<style>
  .popup-active span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-active .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-active');
  const popup = container.querySelector('cs-popup');
  const active = container.querySelector('cs-switch');

  active.addEventListener('change', () => (popup.active = active.checked));
</script>
```

### External Anchors

By default, anchors are slotted into the popup using the `anchor` slot. If your anchor needs to live outside of the popup, you can pass the anchor's `id` to the `anchor` attribute. Alternatively, you can pass an element reference to the `anchor` property to achieve the same effect without using an `id`.

```html {.example}
<span id="external-anchor"></span>

<cs-popup anchor="external-anchor" placement="top" active>
  <div class="box"></div>
</cs-popup>

<style>
  #external-anchor {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px 0 0 50px;
  }

  #external-anchor ~ cs-popup .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }
</style>
```

### Placement

Use the `placement` attribute to tell the popup the preferred placement of the popup. Note that the actual position will vary to ensure the panel remains in the viewport if you're using positioning features such as `flip` and `shift`.

Since placement is preferred when using `flip`, you can observe the popup's current placement when it's active by looking at the `data-current-placement` attribute. This attribute will update as the popup flips to find available space and it will be removed when the popup is deactivated.

```html {.example}
<div class="popup-placement">
  <cs-popup placement="top" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <cs-select name="placement" label="Placement" placeholder="Select placement..."></cs-select>
</div>

<style>
  .popup-placement span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-placement .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-placement cs-select {
    max-width: 280px;
  }
</style>

<script type="module">
  await customElements.whenDefined('cs-select');
  await customElements.whenDefined('cs-option');

  const container = document.querySelector('.popup-placement');
  const popup = container.querySelector('cs-popup');
  const placement = container.querySelector('cs-select');

  const placements = [
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'right',
    'right-start',
    'right-end',
    'left',
    'left-start',
    'left-end',
  ];

  placements.forEach(value => {
    const option = document.createElement('cs-option');
    option.value = value;
    option.textContent = value;
    placement.append(option);
  });

  await placement.updateComplete;

  placement.value = 'top';

  placement.addEventListener('change', () => (popup.placement = placement.value));
</script>
```

### Distance

Use the `distance` attribute to change the distance between the popup and its anchor. A positive value will move the popup further away and a negative value will move it closer.

```html {.example}
<div class="popup-distance">
  <cs-popup placement="top" distance="0" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <cs-slider min="-50" max="50" step="1" value="0" label="Distance"></cs-slider>
</div>

<style>
  .popup-distance span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-distance .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-distance cs-slider {
    max-width: 260px;
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-distance');
  const popup = container.querySelector('cs-popup');
  const distance = container.querySelector('cs-slider');

  distance.addEventListener('input', () => (popup.distance = distance.value));
</script>
```

### Skidding

The `skidding` attribute is similar to `distance`, but instead allows you to offset the popup along the anchor's axis. Both positive and negative values are allowed.

```html {.example}
<div class="popup-skidding">
  <cs-popup placement="top" skidding="0" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <cs-slider min="-50" max="50" step="1" value="0" label="Skidding"></cs-slider>
</div>

<style>
  .popup-skidding span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-skidding .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-skidding cs-slider {
    max-width: 260px;
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-skidding');
  const popup = container.querySelector('cs-popup');
  const skidding = container.querySelector('cs-slider');

  skidding.addEventListener('input', () => (popup.skidding = skidding.value));
</script>
```

### Arrows

Add an arrow to your popup with the `arrow` attribute. It's usually a good idea to set a `distance` to make room for the arrow. To adjust the arrow's color and size, use the `--arrow-color` and `--arrow-size` custom properties, respectively. You can also target the `arrow` part to add additional styles such as shadows and borders to match styles applied to rest of the popup element.

By default, the arrow will be aligned as close to the center of the _anchor_ as possible, considering available space and `arrow-padding`. You can use the `arrow-placement` attribute to force the arrow to align to the start, end, or center of the _popup_ instead.

```html {.example}
<div class="popup-arrow">
  <cs-popup placement="top" arrow arrow-placement="anchor" distance="8" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <div class="popup-arrow-options cs-cluster cs-align-items-end">
      <cs-select
        label="Placement"
        name="placement"
        placeholder="Select placement..."
        class="popup-overview-select"
      ></cs-select>

      <cs-select label="Arrow Placement" name="arrow-placement" value="anchor">
        <cs-option value="anchor">anchor</cs-option>
        <cs-option value="start">start</cs-option>
        <cs-option value="end">end</cs-option>
        <cs-option value="center">center</cs-option>
      </cs-select>
    </div>

    <div class="popup-arrow-options cs-cluster cs-align-items-end">
      <cs-switch name="arrow" checked>Arrow</cs-switch>
    </div>
  </div>

  <style>
    .popup-arrow cs-popup {
      --arrow-color: var(--cs-color-brand-fill-loud);
    }

    .popup-arrow span[slot='anchor'] {
      display: inline-block;
      width: 150px;
      height: 150px;
      border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
      margin: 50px;
    }

    .popup-arrow .box {
      width: 100px;
      height: 50px;
      background: var(--cs-color-brand-fill-loud);
      border-radius: var(--cs-border-radius-m);
    }

    .popup-arrow-options cs-select {
      width: 160px;
    }

    .popup-arrow-options + .popup-arrow-options {
      margin-top: var(--cs-space-m);
    }
  </style>

  <script type="module">
    await customElements.whenDefined('cs-select');
    await customElements.whenDefined('cs-option');

    const container = document.querySelector('.popup-arrow');
    const popup = container.querySelector('cs-popup');
    const placement = container.querySelector('cs-select[name="placement"]');
    const arrowPlacement = container.querySelector('cs-select[name="arrow-placement"]');
    const arrow = container.querySelector('[name="arrow"]');

    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'right',
      'right-start',
      'right-end',
      'left',
      'left-start',
      'left-end',
    ];

    placements.forEach(value => {
      const option = document.createElement('cs-option');
      option.value = value;
      option.textContent = value;
      placement.append(option);
    });

    await placement.updateComplete;

    placement.value = 'top';

    placement.addEventListener('change', () => (popup.placement = placement.value));
    arrowPlacement.addEventListener('change', () => (popup.arrowPlacement = arrowPlacement.value));
    arrow.addEventListener('change', () => (popup.arrow = arrow.checked));
  </script>
</div>
```

### Border

Borders can also be added to the popup element by targeting the contents of the `cs-popup` element. This styling can also be extended to the arrow itself by targeting `.arrow` class in the popup.

When adding borders to the popup element which has an arrow, make sure to set the `--popup-border-width` custom property to match the width of the border of the popup. Setting this will allow the arrow to overlap the border of the popup so that they visually appear connected.

```html {.example}
<div class="popup-border">
  <cs-popup placement="top" arrow arrow-placement="anchor" distance="8" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <div class="popup-border-options cs-cluster cs-align-items-end">
    <cs-select
      label="Placement"
      name="placement"
      placeholder="Select placement..."
      class="popup-overview-select"
    ></cs-select>
  </div>

  <style>
    .popup-border span[slot='anchor'] {
      display: inline-block;
      width: 150px;
      height: 150px;
      border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
      margin: 50px;
    }

    .popup-border .box {
      width: 100px;
      height: 50px;
      background: var(--cs-color-brand-on-loud);
      border-radius: var(--cs-border-radius-m);
      border: var(--cs-panel-border-width) solid var(--cs-color-brand-border-loud);
      border-style: var(--cs-panel-border-style);
      box-shadow: var(--cs-shadow-l);
    }

    .popup-border cs-popup {
      --arrow-color: var(--cs-color-brand-on-loud);
      --popup-border-width: var(--cs-panel-border-width);

      /* Inset box-shadow, not a border: Safari seams a clip-path edge that runs along a border. */
      &::part(arrow) {
        box-shadow: inset calc(-1 * var(--cs-panel-border-width)) calc(-1 * var(--cs-panel-border-width)) 0 0
          var(--cs-color-brand-border-loud);
      }
    }

    .popup-border-options cs-select {
      width: 160px;
    }
  </style>

  <script type="module">
    await customElements.whenDefined('cs-select');

    const container = document.querySelector('.popup-border');
    const popup = container.querySelector('cs-popup');
    const placement = container.querySelector('cs-select[name="placement"]');

    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'right',
      'right-start',
      'right-end',
      'left',
      'left-start',
      'left-end',
    ];

    placements.forEach(value => {
      const option = document.createElement('cs-option');
      option.value = value;
      option.textContent = value;
      placement.append(option);
    });

    await placement.updateComplete;

    placement.value = 'top';

    placement.addEventListener('change', () => (popup.placement = placement.value));
  </script>
</div>
```

{# TODO: this example totally destroys browsers. Needs investigation.

### Sync

Use the `sync` attribute to make the popup the same width or height as the anchor element. This is useful for controls that need the popup to stay the same width or height as the trigger.

```html {.example}
<div class="popup-sync">
  <cs-popup placement="top" sync="width" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-select value="width" label="Sync">
    <cs-option value="width">Width</cs-option>
    <cs-option value="height">Height</cs-option>
    <cs-option value="both">Both</cs-option>
    <cs-option value="">None</cs-option>
  </cs-select>
</div>

<style>
  .popup-sync span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-sync .box {
    width: 100%;
    height: 100%;
    min-width: 50px;
    min-height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-sync cs-select {
    width: 160px;
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-sync');
  const popup = container.querySelector('cs-popup');
  const fixed = container.querySelector('cs-switch');
  const sync = container.querySelector('cs-select');

  sync.addEventListener('change', () => (popup.sync = sync.value));
</script>
```

#}

### Flip

When the popup doesn't have enough room in its preferred placement, it can automatically flip to keep it in view and visually connected to its anchor.
To enable this, use the `flip` attribute. By default, the popup will flip to the opposite placement, but you can configure preferred fallback placements using `flip-fallback-placement` and `flip-fallback-strategy`. Additional options are available to control the flip behavior's boundary and padding.

By default, flip takes effect when the popup would overflow the viewport.
You can use `boundary="scroll"` to make the popup resize when it overflows its nearest scrollable container instead.

Scroll the container to see how the popup flips to prevent clipping.

```html {.example}
<div class="popup-flip">
  <div class="overflow">
    <cs-popup placement="top" flip active boundary="scroll">
      <span slot="anchor"></span>
      <div class="box"></div>
    </cs-popup>
  </div>

  <cs-divider></cs-divider>

  <cs-switch checked>Flip</cs-switch>
</div>

<style>
  .popup-flip .overflow {
    position: relative;
    height: 300px;
    border: solid var(--cs-border-width-m) var(--cs-color-surface-border);
    overflow: auto;
  }

  .popup-flip span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 150px 50px;
  }

  .popup-flip .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-flip');
  const popup = container.querySelector('cs-popup');
  const flip = container.querySelector('cs-switch');

  flip.addEventListener('change', () => (popup.flip = flip.checked));
</script>
```

### Flip Fallbacks

While using the `flip` attribute, you can customize the placement of the popup when the preferred placement doesn't have room. For this, use `flip-fallback-placements` and `flip-fallback-strategy`.

If the preferred placement doesn't have room, the first suitable placement found in `flip-fallback-placement` will be used. The value of this attribute must be a string including any number of placements separated by a space, e.g. `"right bottom"`.

If no fallback placement works, the final placement will be determined by `flip-fallback-strategy`. This value can be either `initial` (default), where the placement reverts to the position in `placement`, or `best-fit`, where the placement is chosen based on available space.

Scroll the container to see how the popup changes it's fallback placement to prevent clipping.

```html {.example}
<div class="popup-flip-fallbacks">
  <div class="overflow">
    <cs-popup
      placement="top"
      flip
      flip-fallback-placements="right bottom"
      flip-fallback-strategy="initial"
      active
      boundary="scroll"
    >
      <span slot="anchor"></span>
      <div class="box"></div>
    </cs-popup>
  </div>
</div>

<style>
  .popup-flip-fallbacks .overflow {
    position: relative;
    height: 300px;
    border: solid var(--cs-border-width-m) var(--cs-color-surface-border);
    overflow: auto;
  }

  .popup-flip-fallbacks span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 250px 50px;
  }

  .popup-flip-fallbacks .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }
</style>
```

### Shift

When a popup is longer than its anchor, it risks overflowing.
In this case, use the `shift` attribute to shift the popup along its axis and back into view. You can customize the shift behavior using `shiftBoundary` and `shift-padding`.

By default, auto-size takes effect when the popup would overflow the viewport.
You can use `boundary="scroll"` to make the popup resize when it overflows its nearest scrollable container instead.

Toggle the switch to see the difference.

```html {.example}
<div class="popup-shift">
  <div class="overflow">
    <cs-popup placement="top" shift shift-padding="10" active boundary="scroll">
      <span slot="anchor"></span>
      <div class="box"></div>
    </cs-popup>
  </div>

  <cs-divider></cs-divider>

  <cs-switch checked>Shift</cs-switch>
</div>

<style>
  .popup-shift .overflow {
    position: relative;
    border: solid var(--cs-border-width-m) var(--cs-color-surface-border);
    overflow: auto;
  }

  .popup-shift span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 60px 0 0 10px;
  }

  .popup-shift .box {
    width: 300px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-shift');
  const popup = container.querySelector('cs-popup');
  const shift = container.querySelector('cs-switch');

  shift.addEventListener('change', () => (popup.shift = shift.checked));
</script>
```

### Auto-Size

Use the `auto-size` attribute to tell the popup to resize when necessary to prevent it from overflowing.
Possible values are `horizontal`, `vertical`, and `both`. You can use `autoSizeBoundary` and `auto-size-padding` to customize the behavior of this option. Auto-size works well with `flip`, but if you're using `auto-size-padding` make sure `flip-padding` is the same value.

By default, auto-size takes effect when the popup would overflow the viewport.
You can use `boundary="scroll"` to make the popup resize when it overflows its nearest scrollable container instead.

When using `auto-size`, one or both of `--auto-size-available-width` and `--auto-size-available-height` will be applied to the host element. These values determine the available space the popover has before clipping will occur. Since they cascade, you can use them to set a max-width/height on your popup's content and easily control its overflow.

Scroll the container to see the popup resize as its available space changes.

```html {.example}
<div class="popup-auto-size">
  <div class="overflow">
    <cs-popup placement="top" auto-size="both" auto-size-padding="10" active boundary="scroll">
      <span slot="anchor"></span>
      <div class="box"></div>
    </cs-popup>
  </div>

  <cs-divider></cs-divider>

  <cs-switch checked>Auto-size</cs-switch>
</div>

<style>
  .popup-auto-size .overflow {
    position: relative;
    height: 300px;
    border: solid var(--cs-border-width-m) var(--cs-color-surface-border);
    overflow: auto;
  }

  .popup-auto-size span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 250px 50px 100px 50px;
  }

  .popup-auto-size .box {
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);

    /* This sets the preferred size of the popup's content */
    width: 100px;
    height: 200px;

    /* This sets the maximum dimensions and allows scrolling when auto-size kicks in */
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);
    overflow: auto;
  }
</style>

<script type="module">
  const container = document.querySelector('.popup-auto-size');
  const popup = container.querySelector('cs-popup');
  const autoSize = container.querySelector('cs-switch');

  autoSize.addEventListener('change', () => (popup.autoSize = autoSize.checked ? 'both' : ''));
</script>
```

### Hover Bridge

When a gap exists between the anchor and the popup element, this option will add a "hover bridge" that fills the gap using an invisible element. This makes listening for events such as `mouseover` and `mouseout` more sane because the pointer never technically leaves the element. The hover bridge will only be drawn when the popover is active. For demonstration purposes, the bridge in this example is shown in orange.

```html {.example}
<div class="popup-hover-bridge">
  <cs-popup placement="top" hover-bridge distance="10" skidding="0" active>
    <span slot="anchor"></span>
    <div class="box"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <div class="cs-cluster">
    <cs-switch checked>Hover Bridge</cs-switch>
    <cs-slider min="0" max="50" step="1" value="10" label="Distance"></cs-slider>
    <cs-slider min="-50" max="50" step="1" value="0" label="Skidding"></cs-slider>
  </div>
</div>
<style>
  .popup-hover-bridge span[slot='anchor'] {
    display: inline-block;
    width: 150px;
    height: 150px;
    border: dashed var(--cs-border-width-m) var(--cs-color-neutral-fill-loud);
    margin: 50px;
  }

  .popup-hover-bridge .box {
    width: 100px;
    height: 50px;
    background: var(--cs-color-brand-fill-loud);
    border-radius: var(--cs-border-radius-m);
  }

  .popup-hover-bridge cs-slider {
    max-width: 260px;
    margin-top: var(--cs-space-xs);
  }

  .popup-hover-bridge cs-popup::part(hover-bridge) {
    background: var(--cs-color-warning-fill-loud);
    opacity: 0.5;
  }
</style>
<script type="module">
  const container = document.querySelector('.popup-hover-bridge');
  const popup = container.querySelector('cs-popup');
  const hoverBridge = container.querySelector('cs-switch');
  const distance = container.querySelector('cs-slider[label="Distance"]');
  const skidding = container.querySelector('cs-slider[label="Skidding"]');
  distance.addEventListener('input', () => (popup.distance = distance.value));
  skidding.addEventListener('input', () => (popup.skidding = skidding.value));
  hoverBridge.addEventListener('change', () => (popup.hoverBridge = hoverBridge.checked));
</script>
```

### Virtual Elements

In most cases, popups are anchored to an actual element. Sometimes, it can be useful to anchor them to a non-element. To do this, you can pass a `VirtualElement` to the anchor property. A virtual element must contain a function called `getBoundingClientRect()` that returns a [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) object as shown below.

```ts
const virtualElement = {
  getBoundingClientRect() {
    // ...
    return { width, height, x, y, top, left, right, bottom };
  },
};
```

This example anchors a popup to the mouse cursor using a virtual element. As such, a mouse is required to properly view it.

```html {.example}
<div class="popup-virtual-element">
  <cs-popup placement="right-start">
    <div class="circle"></div>
  </cs-popup>

  <cs-divider></cs-divider>

  <cs-switch>Highlight mouse cursor</cs-switch>
</div>

<script type="module">
  const container = document.querySelector('.popup-virtual-element');
  const popup = container.querySelector('cs-popup');
  const circle = container.querySelector('.circle');
  const enabled = container.querySelector('cs-switch');
  let clientX = 0;
  let clientY = 0;

  // Set the virtual element as a property
  popup.anchor = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      };
    },
  };

  // Only activate the popup when the switch is checked
  enabled.addEventListener('change', () => {
    popup.active = enabled.checked;
  });

  // Listen for the mouse to move
  document.addEventListener('mousemove', handleMouseMove);

  // Update the virtual element as the mouse moves
  function handleMouseMove(event) {
    clientX = event.clientX;
    clientY = event.clientY;

    // Reposition the popup when the virtual anchor moves
    if (popup.active) {
      popup.reposition();
    }
  }
</script>

<style>
  /* If you need to set a z-index, set it on the popup part like this */
  .popup-virtual-element cs-popup::part(popup) {
    z-index: 1000;
    pointer-events: none;
  }

  .popup-virtual-element .circle {
    width: 100px;
    height: 100px;
    border: solid 4px var(--cs-color-neutral-fill-loud);
    border-radius: var(--cs-border-radius-circle);
    translate: -50px -50px;
    animation: 1s virtual-cursor infinite;
  }

  @keyframes virtual-cursor {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.1;
    }
  }
</style>
```

### Built-in Animations

The following classes can be applied to the popup's `popup` part to animate it in or out programmatically. You can control the animation duration with the `--show-duration` and `--hide-duration` custom properties.

- `show` / `hide` - Shows or hides the popover with a fade
- `show-with-scale` / `hide-with-scale` - Shows or hides the popover with a fade and subtle scale effect
