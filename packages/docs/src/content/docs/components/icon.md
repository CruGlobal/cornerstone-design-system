---
title: Icon
category: Media
synonyms:
  - symbol
  - glyph
  - pictogram
  - material symbols
use-cases:
  - icon button
  - status icon
  - navigation icon
description: "Icons are scalable vector symbols that represent actions, content, or status throughout your application. They support Material Symbols and custom icon libraries with animation presets."
---

Cornerstone comes bundled with over 3,800 free icons courtesy of [Material Symbols](https://fonts.google.com/icons), which are licensed under Apache-2.0. These icons are part of the `default` icon library, and every one of them is drawn along three axes — [style, variant and weight](#style-variant-and-weight). Brand logos live in a separate [`brands` library](#brand-logos), and you can always register your own [custom icon library](#third-party-icon-libraries).

```html {.example}
<div class="icon-rebuses cs-font-size-2xl">
  <!-- Catfish -->
  <cs-icon name="pets"></cs-icon>
  <cs-icon name="set_meal"></cs-icon>

  <!-- Brainstorm -->
  <cs-icon name="neurology"></cs-icon>
  <cs-icon name="thunderstorm"></cs-icon>

  <!-- Bookworm -->
  <cs-icon name="book"></cs-icon>
  <cs-icon name="bug_report" variant="fill"></cs-icon>

  <!-- Moonwalk -->
  <cs-icon name="dark_mode" variant="fill"></cs-icon>
  <cs-icon name="directions_walk"></cs-icon>
</div>

<style>
  /* Space between each rebus pair: trailing margin on every 2nd icon */
  .icon-rebuses cs-icon:nth-of-type(2n):not(:last-of-type) {
    margin-inline-end: var(--cs-space-m);
  }
</style>
```

<cs-callout variant="brand">
  <cs-icon slot="icon" name="search"></cs-icon>
  Not sure which icon to use?
  <a href="https://fonts.google.com/icons?icon.set=Material+Symbols&icon.style=Sharp" target="_blank">Search all 3,800+ icons over at Material Symbols!</a>
</cs-callout>

## Examples

### Size

Icons are sized relative to the current font size. To change their size, set the `font-size` property on the icon itself or on a parent element — drag the slider to see it in action.

```html {.example}
<div class="icon-sizing">
  <div class="cs-cluster icon-sizing-preview cs-font-size-2xl">
    <cs-icon name="notifications"></cs-icon>
    <cs-icon name="favorite" variant="fill"></cs-icon>
    <cs-icon name="image"></cs-icon>
    <cs-icon name="mic"></cs-icon>
    <cs-icon name="search"></cs-icon>
    <cs-icon name="star" variant="fill"></cs-icon>
  </div>

  <cs-divider></cs-divider>

  <cs-slider label="Font size" min="0" max="4" value="2" with-markers>
    <span slot="reference">1rem</span>
    <span slot="reference">1.5rem</span>
    <span slot="reference">2rem</span>
    <span slot="reference">3rem</span>
    <span slot="reference">4rem</span>
  </cs-slider>
</div>

<style>
  .icon-sizing-preview {
    min-height: 6rem;
    align-items: center;
    justify-content: center;
    margin-block-end: var(--cs-space-l);
  }
</style>

<script>
  (() => {
    const container = document.querySelector('.icon-sizing');
    const preview = container.querySelector('.icon-sizing-preview');
    const slider = container.querySelector('cs-slider');
    const sizes = ['1rem', '1.5rem', '2rem', '3rem', '4rem'];
    slider.addEventListener('input', () => (preview.style.fontSize = sizes[slider.value]));
  })();
</script>
```

### Color

Icons inherit their color from the current text color. Thus, you can set the `color` property on the `<cs-icon>` element or an ancestor to change the color.

```html {.example}
<div class="cs-cluster cs-font-size-xl">
  <cs-icon name="favorite" style="color: var(--cs-color-rose-60);" variant="fill"></cs-icon>
  <cs-icon name="local_fire_department" style="color: var(--cs-color-vermilion-60);" variant="fill"></cs-icon>
  <cs-icon name="light_mode" style="color: var(--cs-color-yellow-60);"></cs-icon>
  <cs-icon name="eco" style="color: var(--cs-color-green-60);"></cs-icon>
  <cs-icon name="rainy_heavy" style="color: var(--cs-color-sky-60);"></cs-icon>
  <cs-icon name="wand_stars" style="color: var(--cs-color-purple-60);"></cs-icon>
</div>
```

### Style, Variant & Weight

Material Symbols is a single typeface drawn along three independent axes, and `<cs-icon>` exposes each one as an attribute. Any combination of the three resolves.

<table>
  <thead>
    <tr>
      <th>Axis</th>
      <th>Attribute</th>
      <th>Values</th>
      <th>Preview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Style</td>
      <td><code>family</code></td>
      <td><code>sharp</code> <cs-badge appearance="outlined" variant="neutral" pill class="cs-font-size-2xs">default</cs-badge>, <code>outlined</code>, <code>rounded</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s" style="font-size: 1.25em;">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;folder&quot;></cs-icon>"><cs-icon name="folder"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon family=&quot;outlined&quot; name=&quot;folder&quot;></cs-icon>"><cs-icon family="outlined" name="folder"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon family=&quot;rounded&quot; name=&quot;folder&quot;></cs-icon>"><cs-icon family="rounded" name="folder"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td>Cut</td>
      <td><code>variant</code></td>
      <td><code>regular</code> <cs-badge appearance="outlined" variant="neutral" pill class="cs-font-size-2xs">default</cs-badge>, <code>fill</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s" style="font-size: 1.25em;">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;star&quot;></cs-icon>"><cs-icon name="star"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon variant=&quot;fill&quot; name=&quot;star&quot;></cs-icon>"><cs-icon variant="fill" name="star"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td>Weight</td>
      <td><code>weight</code></td>
      <td><code>100</code>–<code>700</code> in steps of 100 (<code>400</code> <cs-badge appearance="outlined" variant="neutral" pill class="cs-font-size-2xs">default</cs-badge>)</td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s" style="font-size: 1.25em;">
          <cs-copy-button copy-label="Copy code" value="<cs-icon weight=&quot;100&quot; name=&quot;settings&quot;></cs-icon>"><cs-icon weight="100" name="settings"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon weight=&quot;400&quot; name=&quot;settings&quot;></cs-icon>"><cs-icon weight="400" name="settings"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon weight=&quot;700&quot; name=&quot;settings&quot;></cs-icon>"><cs-icon weight="700" name="settings"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

A weight between two steps snaps to the nearer one, and a weight outside the range clamps to the closest end — `weight="350"` resolves to `300`, and `weight="9000"` to `700`.

The defaults — sharp, `regular` (fill off) and weight `400` — are the artwork Cru's brand guidelines specify, alongside grade 0 and optical size 24, which is what the `@material-symbols/svg-400/sharp` set ships.

```html {.example}
<div class="cs-cluster cs-gap-l cs-font-size-3xl">
  <cs-icon name="favorite"></cs-icon>
  <cs-icon name="favorite" variant="fill"></cs-icon>
  <cs-icon name="favorite" family="rounded" weight="700"></cs-icon>
  <cs-icon name="favorite" family="outlined" weight="100"></cs-icon>
</div>
```

### Optical Size

Material Symbols draws every icon inside a 24dp box with a 20dp live area, so 4dp of padding is baked into the artwork. `<cs-icon>` cancels that with `--icon-scale`, which defaults to `1.2` (24 ÷ 20). It scales the artwork inside the canvas without changing the canvas, so raising it never reflows the layout around an icon.

```html {.example}
<div class="cs-cluster cs-gap-l cs-font-size-2xl">
  <cs-icon name="settings" style="--icon-scale: 1"></cs-icon>
  <cs-icon name="settings"></cs-icon>
  <cs-icon name="settings" style="--icon-scale: 1.5"></cs-icon>
</div>
```

Set it to `1` to render the artwork at its native size. The property inherits, so setting it on an ancestor retunes every icon beneath it. Note that Material Symbols varies the ink deliberately — a chevron is drawn smaller within its box than a gear is — so `--icon-scale` shifts every icon together rather than evening them out.

### Brand Logos

Material Symbols ships no brand marks, so Cornerstone includes a small `brands` library of logos from [Simple Icons](https://simpleicons.org), which are published under CC0-1.0. They're inlined in the bundle, so they resolve with no network request. `family`, `variant` and `weight` don't apply to them.

<div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;github&quot;></cs-icon>"><cs-icon library="brands" name="github"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;discord&quot;></cs-icon>"><cs-icon library="brands" name="discord"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;bluesky&quot;></cs-icon>"><cs-icon library="brands" name="bluesky"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;mastodon&quot;></cs-icon>"><cs-icon library="brands" name="mastodon"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;threads&quot;></cs-icon>"><cs-icon library="brands" name="threads"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;x-twitter&quot;></cs-icon>"><cs-icon library="brands" name="x-twitter"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;react&quot;></cs-icon>"><cs-icon library="brands" name="react"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="<cs-icon library=&quot;brands&quot; name=&quot;svelte&quot;></cs-icon>"><cs-icon library="brands" name="svelte"></cs-icon></cs-copy-button>
</div>

```html {.example}
<div class="cs-cluster cs-gap-m cs-font-size-2xl">
  <cs-icon library="brands" name="github" label="GitHub"></cs-icon>
  <cs-icon library="brands" name="discord" label="Discord"></cs-icon>
  <cs-icon library="brands" name="bluesky" label="Bluesky"></cs-icon>
</div>
```

:::info
<strong>Need a logo that isn't here?</strong><br />
The library covers the marks Cornerstone's own documentation uses. Paste any other Simple Icons SVG into a
[custom library](#third-party-icon-libraries), or point one at their CDN.
:::

### Canvas

The _canvas_ is the box an icon sits in. Choose one of four mutually exclusive modes with the `canvas` attribute (the default is `fixed`). It follows the same idea as [Font Awesome's icon canvas](https://docs.fontawesome.com/web/style/icon-canvas/), which these modes were ported from, and scales with `font-size`, independent of [sizing](#size). The tinted box below shows each canvas's extent.

<style>
  /* The dashed box that makes each canvas visible. Scaffolding for the demo, not part of what `canvas`
     does — which is why the copy button beside each one deliberately omits it. */
  .canvas-swatch {
    background: var(--cs-color-brand-fill-quiet);
    border: var(--cs-border-width-s) dashed var(--cs-color-brand-border-loud);
  }
</style>

<table>
  <thead>
    <tr>
      <th>Canvas</th>
      <th>Box</th>
      <th>Best For</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <span class="cs-cluster cs-flex-nowrap cs-gap-3xs">
          <code>fixed</code>
          <cs-badge appearance="outlined" variant="neutral" pill class="cs-font-size-2xs">default</cs-badge>
        </span>
      </td>
      <td><code>1.25 × 1em</code></td>
      <td>Aligning icons in lists, menus, and toolbars</td>
      <td>
        <div class="cs-cluster icon-copy-row cs-justify-content-center cs-font-size-2xl">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;bookmark&quot;></cs-icon>"><cs-icon class="canvas-swatch" name="bookmark" variant="fill"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>auto</code></td>
      <td><code>auto × 1em</code></td>
      <td>Matching the icon's natural width</td>
      <td>
        <div class="cs-cluster icon-copy-row cs-justify-content-center cs-font-size-2xl">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;bookmark&quot; canvas=&quot;auto&quot;></cs-icon>"><cs-icon class="canvas-swatch" name="bookmark" canvas="auto" variant="fill"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>square</code></td>
      <td><code>1.25 × 1.25em</code></td>
      <td>Standalone icons on a square footprint</td>
      <td>
        <div class="cs-cluster icon-copy-row cs-justify-content-center cs-font-size-2xl">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;bookmark&quot; canvas=&quot;square&quot;></cs-icon>"><cs-icon class="canvas-swatch" name="bookmark" canvas="square" variant="fill"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>roomy</code></td>
      <td><code>1.5 × 1.5em</code></td>
      <td>Standalone icons that need more breathing room</td>
      <td>
        <div class="cs-cluster icon-copy-row cs-justify-content-center cs-font-size-2xl">
          <cs-copy-button copy-label="Copy code" value="<cs-icon name=&quot;bookmark&quot; canvas=&quot;roomy&quot;></cs-icon>"><cs-icon class="canvas-swatch" name="bookmark" canvas="roomy" variant="fill"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

```html {.example}
<div class="canvas-demo">
  <div class="canvas-demo-preview cs-cluster">
    <cs-icon
      class="canvas-swatch"
      name="arrow_range"
     
    ></cs-icon>
    <cs-icon
      class="canvas-swatch"
      name="image"
     
    ></cs-icon>
    <cs-icon
      class="canvas-swatch"
      name="sentiment_satisfied"
     
    ></cs-icon>
    <cs-icon
      class="canvas-swatch"
      name="draft"
     
    ></cs-icon>
    <cs-icon
      class="canvas-swatch"
      name="height"
     
    ></cs-icon>
  </div>

  <cs-divider></cs-divider>

  <div class="cs-cluster cs-gap-xl cs-align-items-start">
    <cs-select label="Canvas" name="canvas" value="fixed">
      <cs-option value="fixed">fixed</cs-option>
      <cs-option value="auto">auto</cs-option>
      <cs-option value="square">square</cs-option>
      <cs-option value="roomy">roomy</cs-option>
    </cs-select>
    <cs-slider label="Size" min="0" max="4" value="2" with-markers style="flex: 1 1 14rem;">
      <span slot="reference">1.5rem</span>
      <span slot="reference">2rem</span>
      <span slot="reference">3rem</span>
      <span slot="reference">4rem</span>
      <span slot="reference">5rem</span>
    </cs-slider>
  </div>
</div>

<style>
  .canvas-demo-preview {
    margin-block-end: var(--cs-space-l);
    font-size: 3rem;
  }
</style>

<script>
  (() => {
    const demo = document.querySelector('.canvas-demo');
    const preview = demo.querySelector('.canvas-demo-preview');
    const icons = preview.querySelectorAll('cs-icon');
    const sizes = ['1.5rem', '2rem', '3rem', '4rem', '5rem'];

    demo.querySelector('cs-select[name="canvas"]').addEventListener('change', event => {
      icons.forEach(icon => (icon.canvas = event.target.value));
    });
    demo.querySelector('cs-slider').addEventListener('input', event => {
      preview.style.fontSize = sizes[event.target.value];
    });
  })();
</script>
```

:::info
The `auto-width` attribute still works but is deprecated — prefer `canvas="auto"`, which renders the same way.
:::

### Rotating & Flipping

Cornerstone ports [Font Awesome's rotation and flip utilities](https://docs.fontawesome.com/web/style/rotate/) for adjusting icon orientation. Use the `rotate` attribute to turn an icon by **any** number of degrees — not just the quarter-turns below — and the `flip` attribute to mirror it across the `x`, `y`, or `both` axes.

<table>
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Value</th>
      <th>Preview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>rotate</code></td>
      <td><code>90</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; rotate=&quot;90&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" rotate="90" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; rotate=&quot;90&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" rotate="90"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; rotate=&quot;90&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" rotate="90"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; rotate=&quot;90&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" rotate="90"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>rotate</code></td>
      <td><code>180</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; rotate=&quot;180&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" rotate="180" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; rotate=&quot;180&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" rotate="180"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; rotate=&quot;180&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" rotate="180"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; rotate=&quot;180&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" rotate="180"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>rotate</code></td>
      <td><code>270</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; rotate=&quot;270&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" rotate="270" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; rotate=&quot;270&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" rotate="270"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; rotate=&quot;270&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" rotate="270"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; rotate=&quot;270&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" rotate="270"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>flip</code></td>
      <td><code>x</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; flip=&quot;x&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" flip="x" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; flip=&quot;x&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" flip="x"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; flip=&quot;x&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" flip="x"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; flip=&quot;x&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" flip="x"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>flip</code></td>
      <td><code>y</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; flip=&quot;y&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" flip="y" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; flip=&quot;y&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" flip="y"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; flip=&quot;y&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" flip="y"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; flip=&quot;y&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" flip="y"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
    <tr>
      <td><code>flip</code></td>
      <td><code>both</code></td>
      <td>
        <div class="cs-cluster icon-copy-row cs-gap-s cs-font-size-xl">
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;send&quot; flip=&quot;both&quot; variant=&quot;fill&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="send" flip="both" variant="fill"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;directions_car&quot; flip=&quot;both&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="directions_car" flip="both"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;set_meal&quot; flip=&quot;both&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="set_meal" flip="both"></cs-icon></cs-copy-button>
          <cs-copy-button copy-label="Copy code" value="&lt;cs-icon name=&quot;sailing&quot; flip=&quot;both&quot;&gt;&lt;/cs-icon&gt;"><cs-icon name="sailing" flip="both"></cs-icon></cs-copy-button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

Rotate by any angle — and combine `rotate` and `flip` on the same icon:

```html {.example}
<cs-icon name="snowboarding" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="snowboarding" rotate="45" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="snowboarding" rotate="135" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="snowboarding" rotate="270" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="snowboarding" flip="both" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="snowboarding" rotate="45" flip="x" class="cs-font-size-2xl"></cs-icon>
```

### Animating

Cornerstone ports [Font Awesome's animation utilities](https://docs.fontawesome.com/web/style/animate/) for adding visual interest to icons. To select different types of animations, use the `animation` attribute when you reference an icon.

Every animation accepts the same timing controls — `--animation-delay`, `--animation-direction`, `--animation-duration`, `--animation-iteration-count`, and `--animation-timing` — plus the animation-specific custom properties shown in each example below. All animations respect `prefers-reduced-motion` (see [Accessibility Considerations](#accessibility-considerations)).

#### Beat

Use the `beat` animation to scale an icon up or down. This is useful for grabbing attention or for use with health/heart-centric icons.

```html {.example}
<cs-icon name="favorite" animation="beat" label="Beating Heart" class="cs-font-size-2xl" variant="fill"></cs-icon>
<cs-icon name="add_circle" animation="beat" label="Beating Circle Plus" class="cs-font-size-2xl"></cs-icon>
<!-- Use --beat-scale to control how far it grows -->
<cs-icon
  name="mood_heart"
  animation="beat"
  label="Beating Smiley" class="cs-font-size-2xl" style="--beat-scale: 1.5;"
></cs-icon>
```

#### Fade

Use the `fade` animation to fade an icon in and out visually to grab attention in a subtle (or not so subtle) way.

```html {.example}
<cs-icon name="warning" animation="fade" label="Fading Warning" class="cs-font-size-2xl" variant="fill"></cs-icon>
<cs-icon name="skull" animation="fade" label="Fading Danger" class="cs-font-size-2xl" variant="fill"></cs-icon>
<cs-icon name="cloud_download" animation="fade" label="Fading Download" class="cs-font-size-2xl"></cs-icon>
<!-- Use --fade-opacity to set how faint it fades (and --animation-duration the pace) -->
<cs-icon
  name="highlight_text_cursor"
  animation="fade"
  label="Fading Cursor" class="cs-font-size-2xl" style="--animation-duration: 2s; --fade-opacity: 0.6;"
></cs-icon>
```

#### Beat-Fade

Use the `beat-fade` animation to grab attention by visually scaling and pulsing an icon in and out.

```html {.example}
<cs-icon name="construction" animation="beat-fade" label="Beat-Fading Construction" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="error" animation="beat-fade" label="Beat-Fading Alert" class="cs-font-size-2xl" variant="fill"></cs-icon>
<!-- Stronger pulse: lower --beat-fade-opacity, higher --beat-fade-scale -->
<cs-icon
  name="report"
  animation="beat-fade"
  label="Beat-Fading Alert" class="cs-font-size-2xl" style="--beat-fade-opacity: 0.1;--beat-fade-scale: 1.25"
></cs-icon>
<!-- Subtler pulse -->
<cs-icon
  name="info"
  animation="beat-fade"
  label="Beat-Fading Info" class="cs-font-size-2xl" style="--beat-fade-opacity: 0.67;--beat-fade-scale: 1.075" variant="fill"></cs-icon>
```

#### Bounce

Use the `bounce` animation to grab attention by visually bouncing an icon up and down.

```html {.example}
<cs-icon name="sports_volleyball" animation="bounce" label="Bouncing Volleyball" class="cs-font-size-2xl"></cs-icon>

<!-- bounce with extra rebound and "squish" on landing -->
<cs-icon
  name="sports_basketball"
  animation="bounce"
  label="Bouncing Basketball" class="cs-font-size-2xl" style="--bounce-land-scale-x: 1.2;--bounce-land-scale-y: .8;--bounce-rebound: 5px;"
></cs-icon>

<!-- bounce animation with no "squish" -->
<cs-icon
  name="pets"
  animation="bounce"
  label="Bouncing Frog" class="cs-font-size-2xl" style="--bounce-start-scale-x: 1; --bounce-start-scale-y: 1; --bounce-jump-scale-x: 1; --bounce-jump-scale-y: 1; --bounce-land-scale-x: 1; --bounce-land-scale-y: 1;"
></cs-icon>

<!-- bounce animation with no "squish" or "rebound" -->
<cs-icon
  name="mail"
  animation="bounce"
  label="Bouncing Envelope" class="cs-font-size-2xl" style="--bounce-start-scale-x: 1;--bounce-start-scale-y: 1;--bounce-jump-scale-x: 1;--bounce-jump-scale-y: 1;--bounce-land-scale-x: 1;--bounce-land-scale-y: 1;--bounce-rebound: 0;"
></cs-icon>
```

#### Flip

Use the `flip` animation to rotate an icon in 3D space. By default, flip rotates an icon about the Y axis 180 degrees. Flipping is helpful for transitions, processing states, or for using physical objects that one flips in the real world.

```html {.example}
<cs-icon name="album" animation="flip" label="Flipping Compact Disc" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="cameraswitch" animation="flip" label="Flipping Camera Rotate" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="album" animation="flip" label="Flipping Disc" class="cs-font-size-2xl"></cs-icon>
<!-- Set the flip axis with --flip-x / --flip-y -->
<cs-icon
  name="history_edu"
  animation="flip"
  label="Flipping Scroll" class="cs-font-size-2xl" style="--flip-x: 1; --flip-y: 0"
></cs-icon>
<!-- Slow it down with --animation-duration -->
<cs-icon
  name="payments"
  animation="flip"
  label="Flipping Money Check Dollar" class="cs-font-size-2xl" style="--animation-duration: 3s;"
></cs-icon>
```

#### Flip 360

Use the `flip-360` animation to flip an icon all the way around in one smooth rotation — an extension of `flip` that gives it some extra oomph. It shares the same `--flip-x`, `--flip-y`, and `--flip-z` axis properties, plus `--flip-angle`, `--flip-anticipation-scale`, and `--flip-overshoot`.

```html {.example}
<cs-icon name="album" animation="flip-360" label="Flipping Compact Disc" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="cameraswitch" animation="flip-360" label="Flipping Camera Rotate" class="cs-font-size-2xl"></cs-icon>
<!-- Set the flip axis with --flip-x / --flip-y -->
<cs-icon
  name="history_edu"
  animation="flip-360"
  label="Flipping Scroll" class="cs-font-size-2xl" style="--flip-x: 1; --flip-y: 0;"
></cs-icon>
<!-- Slow it down with --animation-duration -->
<cs-icon
  name="album"
  animation="flip-360"
  label="Flipping Compact Disc" class="cs-font-size-2xl" style="--animation-duration: 3s;"
></cs-icon>
```

#### Shake

Use the `shake` animation to grab attention or note that something is not allowed by shaking an icon back and forth.

```html {.example}
<cs-icon name="notifications" animation="shake" label="Shaking Bell" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="lock" animation="shake" label="Shaking Lock" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="timer" animation="shake" label="Shaking Stopwatch" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="bomb" animation="shake" label="Shaking Bomb" class="cs-font-size-2xl" variant="fill"></cs-icon>
```

#### Spin

Use the `spin` animation to get any icon to rotate, and use `spin-pulse` to have it rotate with eight steps. Use `spin-reverse` to rotate counter-clockwise. This works especially well with `spinner` and everything in the spinner icons category.

```html {.example}
<cs-icon name="sync" animation="spin" label="Spinning Sync" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="progress_activity" animation="spin" label="Spinning Circle Notch" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="settings" animation="spin" label="Spinning Cog" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="settings" animation="spin-reverse" label="Reverse Spinning Cog" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="progress_activity" animation="spin-pulse" label="Pulse Spinning Spinner" class="cs-font-size-2xl"></cs-icon>
<cs-icon
  name="progress_activity"
  animation="spin-pulse"
  label="Pulse Spinning Spinner" class="cs-font-size-2xl" style="--animation-direction: reverse"
></cs-icon>

<!-- spin a set number of times, then stop -->
<cs-icon
  name="album"
  animation="spin"
  label="Spinning Compact Disc" class="cs-font-size-2xl" style="--animation-duration: 3s; --animation-iteration-count: 5; --animation-timing: ease-in-out;"
></cs-icon>
```

#### Spin Snap

Use `spin-snap` to rotate in distinct steps with a pause on each, like a clock's second hand. `spin-snap-4` stops at four positions and `spin-snap-8` at eight. Unlike `spin-pulse` — a continuous eight-step rotation — the snap animations ease into each stop. Add `--animation-direction: reverse` to any of them to run counter-clockwise.

```html {.example}
<cs-icon name="settings" animation="spin-snap" label="Snapping Gear" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="settings" animation="spin-snap-4" label="Snapping Gear, four stops" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="settings" animation="spin-snap-8" label="Snapping Gear, eight stops" class="cs-font-size-2xl"></cs-icon>
<!-- Add --animation-direction: reverse to run counter-clockwise -->
<cs-icon
  name="settings"
  animation="spin-snap"
  label="Snapping Gear, reversed" class="cs-font-size-2xl" style="--animation-direction: reverse;"
></cs-icon>
```

#### Buzz

Use the `buzz` animation for a fast, tight vibration with rapid decay — quick attention without being loud, like a phone buzzing on a table or an expiring timer. Set `--buzz-distance` to control how far it travels.

```html {.example}
<cs-icon name="notifications" animation="buzz" label="Buzzing Bell" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="mobile" animation="buzz" label="Buzzing Phone" class="cs-font-size-2xl"></cs-icon>
<!-- Use --buzz-distance to control how far it travels -->
<cs-icon
  name="warning"
  animation="buzz"
  label="Buzzing Warning" class="cs-font-size-2xl" style="--buzz-distance: 9px;" variant="fill"></cs-icon>
```

#### Float

Use the `float` animation for a slow, drifting motion — great for empty states, subtle attention, and adding a bit of playful lightness. Adjust `--float-height`, `--float-drift`, and `--float-tilt` to shape the motion.

```html {.example}
<cs-icon name="eco" animation="float" label="Floating Feather" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="skull" animation="float" label="Floating Ghost" class="cs-font-size-2xl"></cs-icon>
<!-- Use --float-height to control the rise (and --animation-duration the pace) -->
<cs-icon
  name="eco"
  animation="float"
  label="Floating Feather" class="cs-font-size-2xl" style="--animation-duration: 2s; --float-height: 0.5em;"
></cs-icon>
```

#### Jello

Use the `jello` animation for a playful jiggle — great for calling attention to something new, fun, or interactive. Set `--jello-scale-x` and `--jello-scale-y` to control how far it deforms.

```html {.example}
<cs-icon name="deployed_code" animation="jello" label="Jiggling Cube" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="water_drop" animation="jello" label="Jiggling Droplet" class="cs-font-size-2xl"></cs-icon>
<!-- Use --jello-scale-x to control how far it stretches -->
<cs-icon
  name="star"
  animation="jello"
  label="Jiggling Star" class="cs-font-size-2xl" style="--animation-duration: 2s; --jello-scale-x: 1.3;" variant="fill"></cs-icon>
```

#### Swing

Use the `swing` animation for a subtle dangle with a slow decay — great for things that physically dangle, like keys or a price tag. Set `--swing-angle` to control the peak rotation.

```html {.example}
<cs-icon name="notifications" animation="swing" label="Swinging Bell" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="key" animation="swing" label="Swinging Key" class="cs-font-size-2xl"></cs-icon>
<!-- Use --swing-angle to control the peak rotation -->
<cs-icon
  name="sell"
  animation="swing"
  label="Swinging Tag" class="cs-font-size-2xl" style="--animation-duration: 2s; --swing-angle: 45deg;" variant="fill"></cs-icon>
```

#### Wag

Use the `wag` animation, a cousin of `swing`, for a bottom-anchored wag — the top of the icon sways back and forth with a slow decay. Set `--wag-angle` to control the peak rotation.

```html {.example}
<cs-icon name="ads_click" animation="wag" label="Wagging Pointer" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="touch_app" animation="wag" label="Wagging Finger" class="cs-font-size-2xl"></cs-icon>
<!-- Use --wag-angle to control the peak rotation -->
<cs-icon
  name="swipe_right"
  animation="wag"
  label="Wagging Finger" class="cs-font-size-2xl" style="--animation-duration: 2s; --wag-angle: 45deg;"
></cs-icon>
```

## Custom Icons

Custom icons can be loaded individually with the `src` attribute. Only SVGs on a local or CORS-enabled endpoint are supported. If you're using more than one custom icon, it might make sense to register a [custom icon library](#third-party-icon-libraries).

```html {.example}
<cs-icon src="/assets/images/cornerstone-mark.svg" class="cs-font-size-5xl"></cs-icon>
```

## Icon Libraries

An icon library is a named set of icons with a resolver that maps each name to an SVG URL. Cornerstone ships with three built-in libraries and lets you register any number of your own.

| Library | Contains | Resolves from | Customize it to… |
| --- | --- | --- | --- |
| `default` | 3,800+ Material Symbols icons, shown when `<cs-icon>` has no `library` attribute | The Material Symbols CDN | Self-host the icons or swap in a different set |
| `system` | Only the icons Cornerstone components use internally | Data URIs baked into the resolver | Replace the icons components use internally (you supply them all) |
| `brands` | The brand logos Material Symbols doesn't cover | Data URIs baked into the resolver | Add logos of your own |

[sizing](#size), [color](#color), [the canvas](#canvas), [rotating and flipping](#rotating-and-flipping), and [animations](#animating) work with icons from any library — they're applied to the `<cs-icon>` host, so they don't depend on where the icon comes from.

### Customizing the Default Library

To resolve the default icons elsewhere (a different set, or your own server), register a library using the `default` name and a custom resolver.

For example, this will change the default icon library to use [Bootstrap Icons](https://icons.getbootstrap.com/) loaded from the jsDelivr CDN.

```html
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('default', {
    resolver: (name, family) => {
      const suffix = family === 'filled' ? '-fill' : '';
      return `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons/${name}${suffix}.svg`;
    },
  });
</script>
```

#### Self-Hosting

By default, icons are loaded from the Material Symbols CDN. If you'd prefer to serve them from your own server, install the weights you need and use `setIconPath()` to point the default icon library at your self-hosted directory.

The expected layout mirrors the [`@material-symbols/svg-{weight}`](https://www.npmjs.com/package/@material-symbols/svg-400) packages, nested one level deeper by weight — so copying `node_modules/@material-symbols/svg-400` to `assets/icons/400` is all it takes to serve weight 400.

```bash
npm install @material-symbols/svg-400
cp -R node_modules/@material-symbols/svg-400 public/assets/icons/400
```

```html
<script type="module">
  import { setIconPath } from '/dist/cornerstone.js';

  setIconPath('/assets/icons');
</script>
```

After calling `setIconPath()`, icons resolve from your directory instead of the CDN. `<cs-icon name="home">` loads `/assets/icons/400/sharp/home.svg`, and `<cs-icon name="star" variant="fill" weight="700">` loads `/assets/icons/700/sharp/star-fill.svg`.

For more control over how icon URLs are constructed, use the `getIconStyle()`, `getIconWeight()` and `getIconFileName()` helpers with `registerIconLibrary()`. They apply the same style, weight-snapping and `-fill` suffix rules the default library uses, so you don't have to replicate that logic yourself.

```html
<script type="module">
  import { getIconFileName, getIconStyle, getIconWeight, registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('default', {
    resolver: (name, family, variant, autoWidth, weight) => {
      const style = getIconStyle(family);
      const file = getIconFileName(name, variant);
      return `/assets/icons/${getIconWeight(weight)}/${style}/${file}.svg?v=2`;
    },
  });
</script>
```

:::warning
<strong>Call `setIconPath()` before Cornerstone components load.</strong><br />
Like `setBasePath()`, it has no effect once components have initialized.
:::

#### SVG Sprites

To improve performance you can use a SVG sprites to avoid multiple trips for each SVG. The browser will load the sprite sheet once and then you reference the particular SVG within the sprite sheet using hash selector.

As always, make sure to benchmark these changes. When using HTTP/2, it may in fact be more bandwidth-friendly to use multiple small requests instead of 1 large sprite sheet.

:::warning
<strong>Only use sprite sheets you self-host.</strong><br />
Browsers apply the same-origin policy to the `<use>` elements inside `<cs-icon>`'s shadow DOM and may refuse a cross-origin URL, with no way to override it. `cs-load` and `cs-error` also don't fire for sprite-sheet icons.
:::

```html
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('sprite', {
    resolver: name => `/assets/images/sprite.svg#${name}`,
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
    spriteSheet: true,
  });
</script>
```

### Customizing the System Library

To change the icons Cornerstone uses internally, register a library using the `system` name and a custom resolver. You're then responsible for providing every icon components require. See `src/components/icon/library.system.ts` for the full list.

```html
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('system', {
    resolver: name => `/path/to/custom/icons/${name}.svg`,
  });
</script>
```

### Third-Party Icon Libraries

Register any number of additional libraries with the `registerIconLibrary()` function exported from `dist/cornerstone.js`. Provide a name and a **resolver** that maps an icon name to its SVG URL (local or a CORS-enabled CDN). Icons are fetched only when used, so a registered library you don't touch costs nothing.

Some libraries need a **mutator** to adjust each SVG on load, most often setting `fill` or `stroke` to `currentColor` so icons inherit the text color.

```html
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('my-icons', {
    resolver: (name, family, variant) => `/assets/icons/${name}.svg`,
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>
```

Then reference an icon by its `library` and `name`. (An icon used before its library registers stays blank until it does.)

```html
<!-- This will show the icon located at /assets/icons/smile.svg -->
<cs-icon library="my-icons" name="smile"></cs-icon>
```

The examples below register popular open-source libraries via CDN. Adapt them to your own origin or naming.

#### Bootstrap Icons

This will register the [Bootstrap Icons](https://icons.getbootstrap.com/) library using the jsDelivr CDN. This library has two families: `regular` and `filled`.

Icons in this library are licensed under the [MIT License](https://github.com/twbs/icons/blob/main/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('bootstrap', {
    resolver: (name, family) => {
      const suffix = family === 'filled' ? '-fill' : '';
      return `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons/${name}${suffix}.svg`;
    },
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="bootstrap" name="backpack"></cs-icon>
  <cs-icon library="bootstrap" name="cup-hot"></cs-icon>
  <cs-icon library="bootstrap" name="envelope-heart"></cs-icon>
  <cs-icon library="bootstrap" name="inboxes"></cs-icon>
  <cs-icon library="bootstrap" name="lamp"></cs-icon>
  <cs-icon library="bootstrap" name="piggy-bank"></cs-icon>
  <br />
  <cs-icon library="bootstrap" family="filled" name="backpack"></cs-icon>
  <cs-icon library="bootstrap" family="filled" name="cup-hot"></cs-icon>
  <cs-icon library="bootstrap" family="filled" name="envelope-heart"></cs-icon>
  <cs-icon library="bootstrap" family="filled" name="inboxes"></cs-icon>
  <cs-icon library="bootstrap" family="filled" name="lamp"></cs-icon>
  <cs-icon library="bootstrap" family="filled" name="piggy-bank"></cs-icon>
</div>
```

#### Boxicons

This will register the [Boxicons](https://boxicons.com/) library using the jsDelivr CDN. This library has three variations: regular (`bx-*`), solid (`bxs-*`), and logos (`bxl-*`). A mutator function is required to set the SVG's `fill` to `currentColor`.

Icons in this library are licensed under the [Creative Commons 4.0 License](https://github.com/atisawd/boxicons#license).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('boxicons', {
    resolver: name => {
      let folder = 'regular';
      if (name.substring(0, 4) === 'bxs-') folder = 'solid';
      if (name.substring(0, 4) === 'bxl-') folder = 'logos';
      return `https://cdn.jsdelivr.net/npm/boxicons@2.1.4/svg/${folder}/${name}.svg`;
    },
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="boxicons" name="bx-bot"></cs-icon>
  <cs-icon library="boxicons" name="bx-cookie"></cs-icon>
  <cs-icon library="boxicons" name="bx-joystick"></cs-icon>
  <cs-icon library="boxicons" name="bx-save"></cs-icon>
  <cs-icon library="boxicons" name="bx-server"></cs-icon>
  <cs-icon library="boxicons" name="bx-wine"></cs-icon>
  <br />
  <cs-icon library="boxicons" name="bxs-bot"></cs-icon>
  <cs-icon library="boxicons" name="bxs-cookie"></cs-icon>
  <cs-icon library="boxicons" name="bxs-joystick"></cs-icon>
  <cs-icon library="boxicons" name="bxs-save"></cs-icon>
  <cs-icon library="boxicons" name="bxs-server"></cs-icon>
  <cs-icon library="boxicons" name="bxs-wine"></cs-icon>
  <br />
  <cs-icon library="boxicons" name="bxl-apple"></cs-icon>
  <cs-icon library="boxicons" name="bxl-chrome"></cs-icon>
  <cs-icon library="boxicons" name="bxl-edge"></cs-icon>
  <cs-icon library="boxicons" name="bxl-firefox"></cs-icon>
  <cs-icon library="boxicons" name="bxl-opera"></cs-icon>
  <cs-icon library="boxicons" name="bxl-microsoft"></cs-icon>
</div>
```

#### Lucide

This will register the [Lucide](https://lucide.dev/) icon library using the jsDelivr CDN. This project is a community-maintained fork of the popular [Feather](https://feathericons.com/) icon library.

Icons in this library are licensed under the [MIT License](https://github.com/lucide-icons/lucide/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('lucide', {
    resolver: name => `https://cdn.jsdelivr.net/npm/lucide-static@1.8.0/icons/${name}.svg`,
    mutator: svg =>
      svg.querySelectorAll('path').forEach(path => {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
      }),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="lucide" name="feather"></cs-icon>
  <cs-icon library="lucide" name="pie-chart"></cs-icon>
  <cs-icon library="lucide" name="settings"></cs-icon>
  <cs-icon library="lucide" name="map-pin"></cs-icon>
  <cs-icon library="lucide" name="printer"></cs-icon>
  <cs-icon library="lucide" name="shopping-cart"></cs-icon>
</div>
```

#### Heroicons

This will register the [Heroicons](https://heroicons.com/) library using the jsDelivr CDN.

Icons in this library are licensed under the [MIT License](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('heroicons', {
    resolver: name => `https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/outline/${name}.svg`,
    mutator: svg =>
      svg.querySelectorAll('path').forEach(path => {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
      }),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="heroicons" name="chat-bubble-left"></cs-icon>
  <cs-icon library="heroicons" name="cloud"></cs-icon>
  <cs-icon library="heroicons" name="cog"></cs-icon>
  <cs-icon library="heroicons" name="document-text"></cs-icon>
  <cs-icon library="heroicons" name="gift"></cs-icon>
  <cs-icon library="heroicons" name="speaker-wave"></cs-icon>
</div>
```

#### Iconoir

This will register the [Iconoir](https://iconoir.com/) library using the jsDelivr CDN.

Icons in this library are licensed under the [MIT License](https://github.com/lucaburgio/iconoir/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('iconoir', {
    resolver: (name, family) => {
      return `https://cdn.jsdelivr.net/npm/iconoir@7.11.0/icons/regular/${name}.svg`;
    },
    mutator: svg =>
      svg.querySelectorAll('path').forEach(path => {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
      }),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="iconoir" name="check-circle"></cs-icon>
  <cs-icon library="iconoir" name="drawer"></cs-icon>
  <cs-icon library="iconoir" name="keyframes"></cs-icon>
  <cs-icon library="iconoir" name="headset-help"></cs-icon>
  <cs-icon library="iconoir" name="color-picker"></cs-icon>
  <cs-icon library="iconoir" name="wifi"></cs-icon>
</div>
```

#### Ionicons

This will register the [Ionicons](https://ionicons.com/) library using the jsDelivr CDN. This library has three variations: outline (default), filled (`*-filled`), and sharp (`*-sharp`). A mutator function is required to polyfill a handful of styles we're not including.

Icons in this library are licensed under the [MIT License](https://github.com/ionic-team/ionicons/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('ionicons', {
    resolver: name => `https://cdn.jsdelivr.net/npm/ionicons@8.0.13/dist/ionicons/svg/${name}.svg`,
    mutator: svg => {
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('stroke', 'currentColor');
      [...svg.querySelectorAll('.ionicon-fill-none')].map(el => el.setAttribute('fill', 'none'));
      [...svg.querySelectorAll('.ionicon-stroke-width')].map(el => el.setAttribute('stroke-width', '32px'));
    },
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="ionicons" name="alarm"></cs-icon>
  <cs-icon library="ionicons" name="american-football"></cs-icon>
  <cs-icon library="ionicons" name="bug"></cs-icon>
  <cs-icon library="ionicons" name="chatbubble"></cs-icon>
  <cs-icon library="ionicons" name="settings"></cs-icon>
  <cs-icon library="ionicons" name="warning"></cs-icon>
  <br />
  <cs-icon library="ionicons" name="alarm-outline"></cs-icon>
  <cs-icon library="ionicons" name="american-football-outline"></cs-icon>
  <cs-icon library="ionicons" name="bug-outline"></cs-icon>
  <cs-icon library="ionicons" name="chatbubble-outline"></cs-icon>
  <cs-icon library="ionicons" name="settings-outline"></cs-icon>
  <cs-icon library="ionicons" name="warning-outline"></cs-icon>
  <br />
  <cs-icon library="ionicons" name="alarm-sharp"></cs-icon>
  <cs-icon library="ionicons" name="american-football-sharp"></cs-icon>
  <cs-icon library="ionicons" name="bug-sharp"></cs-icon>
  <cs-icon library="ionicons" name="chatbubble-sharp"></cs-icon>
  <cs-icon library="ionicons" name="settings-sharp"></cs-icon>
  <cs-icon library="ionicons" name="warning-sharp"></cs-icon>
</div>
```

#### Jam Icons

This will register the [Jam Icons](https://jam-icons.com/) library using the jsDelivr CDN. This library has two variations: regular (default) and filled (`*-f`). A mutator function is required to set the SVG's `fill` to `currentColor`.

Icons in this library are licensed under the [MIT License](https://github.com/michaelampr/jam/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('jam', {
    resolver: name => `https://cdn.jsdelivr.net/npm/jam-icons@2.0.0/svg/${name}.svg`,
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="jam" name="calendar"></cs-icon>
  <cs-icon library="jam" name="camera"></cs-icon>
  <cs-icon library="jam" name="filter"></cs-icon>
  <cs-icon library="jam" name="leaf"></cs-icon>
  <cs-icon library="jam" name="picture"></cs-icon>
  <cs-icon library="jam" name="set-square"></cs-icon>
  <br />
  <cs-icon library="jam" name="calendar-f"></cs-icon>
  <cs-icon library="jam" name="camera-f"></cs-icon>
  <cs-icon library="jam" name="filter-f"></cs-icon>
  <cs-icon library="jam" name="leaf-f"></cs-icon>
  <cs-icon library="jam" name="picture-f"></cs-icon>
  <cs-icon library="jam" name="set-square-f"></cs-icon>
</div>
```

#### Material Icons

[Material Icons](https://material.io/resources/icons/?style=baseline) is Google's earlier icon set, and is not the same as the [Material Symbols](https://fonts.google.com/icons) that back Cornerstone's `default` library — register it only if you specifically want the older glyphs. This will register it using the jsDelivr CDN. This library has three variations: outline (default), round (`*_round`), and sharp (`*_sharp`). A mutator function is required to set the SVG's `fill` to `currentColor`.

Icons in this library are licensed under the [Apache 2.0 License](https://github.com/google/material-design-icons/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('material', {
    resolver: name => {
      const match = name.match(/^(.*?)(_(round|sharp))?$/);
      return `https://cdn.jsdelivr.net/npm/@material-icons/svg@1.0.33/svg/${match[1]}/${match[3] || 'outline'}.svg`;
    },
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="material" name="notifications"></cs-icon>
  <cs-icon library="material" name="email"></cs-icon>
  <cs-icon library="material" name="delete"></cs-icon>
  <cs-icon library="material" name="volume_up"></cs-icon>
  <cs-icon library="material" name="settings"></cs-icon>
  <cs-icon library="material" name="shopping_basket"></cs-icon>
  <br />
  <cs-icon library="material" name="notifications_round"></cs-icon>
  <cs-icon library="material" name="email_round"></cs-icon>
  <cs-icon library="material" name="delete_round"></cs-icon>
  <cs-icon library="material" name="volume_up_round"></cs-icon>
  <cs-icon library="material" name="settings_round"></cs-icon>
  <cs-icon library="material" name="shopping_basket_round"></cs-icon>
  <br />
  <cs-icon library="material" name="notifications_sharp"></cs-icon>
  <cs-icon library="material" name="email_sharp"></cs-icon>
  <cs-icon library="material" name="delete_sharp"></cs-icon>
  <cs-icon library="material" name="volume_up_sharp"></cs-icon>
  <cs-icon library="material" name="settings_sharp"></cs-icon>
  <cs-icon library="material" name="shopping_basket_sharp"></cs-icon>
</div>
```

#### Remix Icon

This will register the [Remix Icon](https://remixicon.com/) library using the jsDelivr CDN. This library groups icons by categories, so the name must include the category and icon separated by a slash, as well as the `-line` or `-fill` suffix as needed. A mutator function is required to set the SVG's `fill` to `currentColor`.

Icons in this library are licensed under the [Apache 2.0 License](https://github.com/Remix-Design/RemixIcon/blob/master/License).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('remixicon', {
    resolver: name => {
      const match = name.match(/^(.*?)\/(.*?)?$/);
      match[1] = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      return `https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/${match[1]}/${match[2]}.svg`;
    },
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="remixicon" name="business/cloud-line"></cs-icon>
  <cs-icon library="remixicon" name="design/brush-line"></cs-icon>
  <cs-icon library="remixicon" name="business/pie-chart-line"></cs-icon>
  <cs-icon library="remixicon" name="development/bug-line"></cs-icon>
  <cs-icon library="remixicon" name="media/image-line"></cs-icon>
  <cs-icon library="remixicon" name="system/alert-line"></cs-icon>
  <br />
  <cs-icon library="remixicon" name="business/cloud-fill"></cs-icon>
  <cs-icon library="remixicon" name="design/brush-fill"></cs-icon>
  <cs-icon library="remixicon" name="business/pie-chart-fill"></cs-icon>
  <cs-icon library="remixicon" name="development/bug-fill"></cs-icon>
  <cs-icon library="remixicon" name="media/image-fill"></cs-icon>
  <cs-icon library="remixicon" name="system/alert-fill"></cs-icon>
</div>
```

#### Tabler Icons

This will register the [Tabler Icons](https://tabler-icons.io/) library using the jsDelivr CDN. This library features over 1,950 open source icons.

Icons in this library are licensed under the [MIT License](https://github.com/tabler/tabler-icons/blob/master/LICENSE).

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('tabler', {
    resolver: name => `https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/${name}.svg`,
    mutator: svg => {
      svg.style.fill = 'none';
      svg.setAttribute('stroke', 'currentColor');
    },
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="tabler" name="alert-triangle"></cs-icon>
  <cs-icon library="tabler" name="arrow-back"></cs-icon>
  <cs-icon library="tabler" name="at"></cs-icon>
  <cs-icon library="tabler" name="ball-baseball"></cs-icon>
  <cs-icon library="tabler" name="cake"></cs-icon>
  <cs-icon library="tabler" name="files"></cs-icon>
  <br />
  <cs-icon library="tabler" name="keyboard"></cs-icon>
  <cs-icon library="tabler" name="moon"></cs-icon>
  <cs-icon library="tabler" name="pig"></cs-icon>
  <cs-icon library="tabler" name="printer"></cs-icon>
  <cs-icon library="tabler" name="ship"></cs-icon>
  <cs-icon library="tabler" name="toilet-paper"></cs-icon>
</div>
```

#### Unicons

This will register the [Unicons](https://iconscout.com/unicons) library using the jsDelivr CDN. This library has two variations: line (default) and solid (`*-s`). A mutator function is required to set the SVG's `fill` to `currentColor`.

Icons in this library are licensed under the [Apache 2.0 License](https://github.com/Iconscout/unicons/blob/master/LICENSE). Some of the icons that appear on the Unicons website, particularly many of the solid variations, require a license and are therefore not available in the CDN.

```html {.example}
<script type="module">
  import { registerIconLibrary } from '/dist/cornerstone.js';

  registerIconLibrary('unicons', {
    resolver: name => {
      const match = name.match(/^(.*?)(-s)?$/);
      return `https://cdn.jsdelivr.net/npm/@iconscout/unicons@4.2.0/svg/${match[2] === '-s' ? 'solid' : 'line'}/${
        match[1]
      }.svg`;
    },
    mutator: svg => svg.setAttribute('fill', 'currentColor'),
  });
</script>

<div class="cs-font-size-xl">
  <cs-icon library="unicons" name="clock"></cs-icon>
  <cs-icon library="unicons" name="graph-bar"></cs-icon>
  <cs-icon library="unicons" name="padlock"></cs-icon>
  <cs-icon library="unicons" name="polygon"></cs-icon>
  <cs-icon library="unicons" name="rocket"></cs-icon>
  <cs-icon library="unicons" name="star"></cs-icon>
  <br />
  <cs-icon library="unicons" name="clock-s"></cs-icon>
  <cs-icon library="unicons" name="graph-bar-s"></cs-icon>
  <cs-icon library="unicons" name="padlock-s"></cs-icon>
  <cs-icon library="unicons" name="polygon-s"></cs-icon>
  <cs-icon library="unicons" name="rocket-s"></cs-icon>
  <cs-icon library="unicons" name="star-s"></cs-icon>
</div>
```

## Accessibility Considerations

Cornerstone hides an unlabeled `<cs-icon>` from assistive devices, so an icon is presentational unless you give it a name. The two things to get right are labeling icons that carry meaning and respecting users who prefer less motion.

### Labeling Icons

Give an icon a `label` when it carries meaning on its own — when it's the only content of a control, or conveys status. Omit it when nearby text already says the same; unlabeled icons are hidden from assistive devices.

<table>
  <thead>
    <tr>
      <th>Scenario</th>
      <th>Label?</th>
      <th>In Context</th>
      <th>Why</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Icon-only control</td>
      <td>Yes</td>
      <td class="cs-text-nowrap">
        <cs-button appearance="outlined" size="s"><cs-icon name="settings" label="Settings"></cs-icon></cs-button>
      </td>
      <td><small>The icon is the button's only content, so the <code>label</code> gives it an accessible name.</small></td>
    </tr>
    <tr>
      <td>Status icon</td>
      <td>Yes</td>
      <td class="cs-text-nowrap">
        <cs-badge variant="success"><cs-icon name="check_circle" label="Paid" variant="fill"></cs-icon> Invoice #1042</cs-badge>
      </td>
      <td><small>The icon conveys status the nearby text doesn't.</small></td>
    </tr>
    <tr>
      <td>Icon beside its own text</td>
      <td>No</td>
      <td class="cs-text-nowrap">
        <cs-button appearance="outlined" size="s">
          <cs-icon slot="start" name="upload"></cs-icon> Share
        </cs-button>
      </td>
      <td><small>The visible “Share” text already names the action; a label would be announced twice.</small></td>
    </tr>
    <tr>
      <td>Decorative</td>
      <td>No</td>
      <td class="cs-text-nowrap">
        <cs-callout variant="brand" size="s" style="padding: 0.5em 0.75em;">
          <cs-icon slot="icon" name="info" variant="fill"></cs-icon>
          Check your inbox
        </cs-callout>
      </td>
      <td><small>It only decorates text that already carries the meaning.</small></td>
    </tr>
  </tbody>
</table>

Set the `label` attribute to the text a screen reader should announce:

```html {.example}
<cs-icon name="check_circle" label="Task complete" class="cs-font-size-2xl" variant="fill"></cs-icon>
<cs-icon name="warning" label="Warning" class="cs-font-size-2xl" variant="fill"></cs-icon>
<cs-icon name="delete" label="Delete" class="cs-font-size-2xl"></cs-icon>
<cs-icon name="notifications" label="Notifications" class="cs-font-size-2xl"></cs-icon>
```

### Reduced Motion

All [icon animations](#animating) honor the user's `prefers-reduced-motion` setting — when it's set to `reduce`, Cornerstone disables them automatically so motion never becomes a barrier. See [Font Awesome's animation accessibility notes](https://docs.fontawesome.com/web/style/animate/#accessibility) for more.
