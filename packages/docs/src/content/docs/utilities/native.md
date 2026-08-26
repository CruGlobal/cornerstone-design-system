---
title: Native Styles
description: Native styles apply your theme to native HTML elements so they match the look and feel of Cornerstone components.
tags: styleUtilities
synonyms:
  - browser default
  - native styles
  - global styles
use-cases:
  - native HTML
  - style native elements
  - reset
  - default styles
---

Native styles use design tokens to spruce up native HTML elements so that they match the look and feel of your theme. While these native styles are completely optional, they're a great starting point for a cohesive design and a huge help when using a combination of native elements and Cornerstone components in your project.

## Using Native Styles

<cs-tab-group>
  <cs-tab panel="cdn"><cs-icon name="rocket_launch"></cs-icon> CDN</cs-tab>
  <cs-tab panel="npm"><cs-icon name="package_2"></cs-icon> npm</cs-tab>
  <cs-tab panel="self-hosted"><cs-icon name="download"></cs-icon> Self-Hosted</cs-tab>

  <cs-tab-panel name="cdn">

1. Head over to your project's <cs-tag class="tag-ui" appearance="outlined"><cs-icon name="settings"></cs-icon> Settings</cs-tag>.
2. Next to <cs-tag class="tag-ui" appearance="outlined">Features</cs-tag>, select the <cs-tag class="tag-ui" appearance="outlined">Native styles</cs-tag> checkbox.
3. <cs-tag class="tag-ui" appearance="outlined">Save Changes</cs-tag> to immediately update anywhere you're using your project.

  </cs-tab-panel>

  <cs-tab-panel name="npm">

To use all Cornerstone styles (including [utilities](/utilities/)), import the following stylesheet in your project:

```js
import '@cruglobal/cornerstone-components/styles/cornerstone.css';
```

Or, if you only want styles for native elements, import a theme and native styles individually:

```js
import '@cruglobal/cornerstone-components/styles/themes/default.css';
import '@cruglobal/cornerstone-components/styles/native.css';
```

</cs-tab-panel>

  <cs-tab-panel name="self-hosted">

To use all Cornerstone styles (including [utilities](/utilities/)), include the following stylesheet in your project:

```html
<link rel="stylesheet" href="/dist/styles/cornerstone.css" />
```

Or, if you only want styles for native elements, include a theme and native styles individually:

```html
<link rel="stylesheet" href="/dist/styles/themes/default.css" />
<link rel="stylesheet" href="/dist/styles/native.css" />
```

</cs-tab-panel>
</cs-tab-group>

You can additionally include any pre-made [theme](/themes/) or [color palette](/color-palettes/) to change the look of native elements.

## Opting out of Native Styles

If you want to keep Cornerstone's components, tokens, and utilities but let a native element fall back to browser defaults, reset that element in your own stylesheet.

```html {.example}
<div class="cs-cluster cs-align-items-center">
  <button type="button">Styled by native.css</button>
  <button type="button" class="native-reset">Browser default button</button>
</div>

<style>
  .native-reset {
    all: revert;
    font: inherit;
  }
</style>
```

Use `all: revert` on the exact element you want to opt out of native styles. Re-apply any properties you still want to inherit from your app, such as `font`.

To opt out for an entire section, apply the same reset within a wrapper and target only the native elements in that area.

```css
.native-reset-zone :where(button, input, select, textarea, table, details, dialog, progress) {
  all: revert;
  font: inherit;
}
```

If your app has separate page-level entry points, the simplest page-level opt-out is to not load `native.css` on pages that should keep browser defaults. You can still load your theme, components, and any [utilities](/utilities/) you want on those pages.

## Content Flow

Native styles set default space between many block-level HTML elements using the `--cs-content-spacing` token from your theme. This helps ensure that your content is readable.

```html {.example}
<h3>Content flows naturally</h3>
<p>
  Native styles set consistent spacing between block-level elements using your theme's design tokens. This means
  headings, paragraphs, lists, and other elements look great together without extra effort.
</p>
<blockquote>
  The Road goes ever on and on<br />
  Out from the door where it began.
</blockquote>
<p>
  Spacing is controlled by the <code>--cs-content-spacing</code> token, so you can easily adjust it to match your
  design. Set it to zero if you prefer to handle spacing yourself.
</p>
<hr />
<ul>
  <li>Aenean imperdiet</li>
  <li>Vivamus consectetur at est</li>
  <li>Quisque vel leo in leo semper</li>
</ul>
```

To remove this default spacing, you can set `--cs-content-spacing: 0` in your styles.

## Typography

Native styles use [typography design tokens](/tokens/typography/) to style text elements. A number of styles — such as `color`, `font-family`, `font-size`, `font-weight`, and `line-height` — are set on the `<body>` element to be inherited by child elements.

### Headings

Create headings with `<h1>` through `<h6>`. Headings use tokens with the `-heading` suffix, condensed line height, and `text-wrap: balance` for a prominent yet compact appearance.

```html {.example}
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

### Paragraphs

Create paragraphs with `<p>`. Paragraphs inherit the default text styles set on the `<body>` element and use `text-wrap: pretty` to prevent orphaned lines in supported browsers.

```html {.example}
<p>
  Paragraphs inherit the default text styles set on the body element, including font family, size, weight, and line
  height. They also use <code>text-wrap: pretty</code> to prevent orphaned lines in supported browsers.
</p>

<p>
  You can have as many paragraphs as you need and they'll maintain consistent spacing between them. Native styles ensure
  everything stays readable and well-proportioned, no matter how much content you throw at it.
</p>
```

### Blockquotes

Emphasize longer quotations with `<blockquote>`. Block quotes use your theme's serif font family, a quiet color, a leading border, and a larger font size that scales with surrounding text.

```html {.example}
<blockquote>
  What is a Web year now, about three months? And when people can browse around, discover new things, and download them
  fast, when we all have agents - then Web years could slip by before human beings can notice.<br /><br />
  — Tim Berners-Lee
</blockquote>
```

### Lists

Create ordered and unordered lists with `<ol>` and `<ul>`, plus `<li>` for list items within. Markers use `currentColor` at reduced opacity so they sit quietly next to text.

```html {.example}
<div class="cs-grid">
  <ol>
    <li>First item</li>
    <li>
      Another item
      <ol>
        <li>Nested item</li>
        <li>Another nested item</li>
      </ol>
    </li>
    <li>Final item</li>
  </ol>

  <ul>
    <li>First item</li>
    <li>
      Another item
      <ul>
        <li>Nested item</li>
        <li>Another nested item</li>
      </ul>
    </li>
    <li>Final item</li>
  </ul>
</div>
```

Use `<menu>` as a semantic alternative to unordered lists. Native styles reset the browser's default list styles for `<menu>` to support more flexible styling.

```html {.example}
<menu class="cs-cluster">
  <li>
    <button class="cs-filled cs-size-s">
      <cs-icon name="content_cut"></cs-icon>
      <span>Cut</span>
    </button>
  </li>
  <li>
    <button class="cs-filled cs-size-s">
      <cs-icon name="content_copy"></cs-icon>
      <span>Copy</span>
    </button>
  </li>
  <li>
    <button class="cs-filled cs-size-s">
      <cs-icon name="content_paste"></cs-icon>
      <span>Paste</span>
    </button>
  </li>
</menu>
```

Use `<dl>` to create lists of terms (`<dt>`) and definitions (`<dd>`).

```html {.example}
<dl>
  <dt>Web Components</dt>
  <dd>
    A set of web platform APIs that let you create custom, reusable HTML elements. They work across frameworks and
    browsers, making them ideal for building design systems and component libraries.
  </dd>
  <dt>Shadow DOM</dt>
  <dd>
    A browser feature that lets you attach a hidden DOM tree to an element. This keeps your component's styles and
    markup encapsulated, so they won't accidentally interfere with the rest of the page.
  </dd>
  <dt>Custom Elements</dt>
  <dd>
    A JavaScript API that lets you define new HTML tags with their own behavior. Once registered, you can use them
    anywhere in your markup just like built-in elements.
  </dd>
</dl>
```

### Code Blocks

Create code blocks or other preformatted text with `<pre>`. Preformatted text uses your theme's monospace font family and a subtle background color.

```html {.example}
<pre>
// do a thing
export function thing() {
  return true;
}
</pre>
```

### Inline Text

Use any inline text element like `<strong>`, `<em>`, `<a>`, `<kbd>`, and others to stylize or emphasize text.

```html {.example}
<div class="cs-grid">
  <div class="cs-stack cs-align-items-start">
    <strong>Bold</strong>
    <em>Italic</em>
    <u>Underline</u>
    <s>Strike-through</s>
    <del>Deleted</del>
    <ins>Inserted</ins>
    <small>Small</small>
  </div>
  <div class="cs-stack cs-align-items-start">
    <span>Subscript <sub>Sub</sub></span>
    <span>Superscript <sup>Sup</sup></span>
    <abbr title="Abbreviation">Abbr.</abbr>
    <mark>Highlighted</mark>
    <a href="#">Link text</a>
    <code>Inline code</code>
    <kbd>Keyboard</kbd>
  </div>
</div>
```

## Widgets & Media

### Media

Add responsive media with `<img>`, `<svg>`, `<video>`, `<iframe>`, and others. Media takes up 100% width by default and scales according to its container's width.

```html {.example}
<img
  src="https://images.unsplash.com/photo-1620196244888-d31ff5bbf163?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  alt="A gray kitten lays next to a toy"
/>
```

### Figures

Pair media with a caption using `<figure>` and `<figcaption>`. Captions use a quiet color and condensed line-height so they read as a label, not running text.

```html {.example}
<figure>
  <img
    src="https://images.unsplash.com/photo-1620196244888-d31ff5bbf163?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    alt="A gray kitten lays next to a toy"
  />
  <figcaption>A gray kitten taking a break next to a felt mouse, somewhere off-camera.</figcaption>
</figure>
```

### Tables

Structure tabular data with `<table>` and related elements like `<caption>`, `<thead>`, `<tbody>`, `<th>`, `<tr>`, and `<td>`. Headers carry a subtle bottom border.

```html {.example}
<table>
  <caption>
    Furniture pieces and their attributes
  </caption>
  <thead>
    <tr>
      <th>Item</th>
      <th>Material</th>
      <th>Room</th>
      <th>Avg. Price (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Table</td>
      <td>Oak</td>
      <td>Dining room</td>
      <td>$450</td>
    </tr>
    <tr>
      <td>Sofa</td>
      <td>Fabric</td>
      <td>Living room</td>
      <td>$800</td>
    </tr>
    <tr>
      <td>Dresser</td>
      <td>Pine</td>
      <td>Bedroom</td>
      <td>$320</td>
    </tr>
  </tbody>
</table>
```

Add `scope="col"` to column headers and `scope="row"` to the first cell in a row so assistive technology knows which cells each header describes. Row headers keep the body font size, so their text aligns with the cells beside them.

```html {.example}
<table>
  <caption>
    Coffee brewing methods
  </caption>
  <thead>
    <tr>
      <th scope="col">Method</th>
      <th scope="col">Grind</th>
      <th scope="col">Brew Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">French Press</th>
      <td>Coarse</td>
      <td>4 minutes</td>
    </tr>
    <tr>
      <th scope="row">Pour Over</th>
      <td>Medium</td>
      <td>3 minutes</td>
    </tr>
    <tr>
      <th scope="row">Espresso</th>
      <td>Fine</td>
      <td>30 seconds</td>
    </tr>
    <tr>
      <th scope="row">Cold Brew</th>
      <td>Extra coarse</td>
      <td>12 hours</td>
    </tr>
  </tbody>
</table>
```

Add the `cs-hover-rows` class to highlight table rows on hover and the `cs-zebra-rows` class to add alternating row colors to your table.

```html {.example}
<table class="cs-zebra-rows cs-hover-rows">
  <caption>
    Common savanna wildlife
  </caption>
  <thead>
    <tr>
      <th>Animal</th>
      <th>Diet</th>
      <th>Status</th>
      <th>Range (km²)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Plains Zebra</td>
      <td>Herbivore</td>
      <td>Least Concern</td>
      <td>2,500,000</td>
    </tr>
    <tr>
      <td>Blue Wildebeest</td>
      <td>Herbivore</td>
      <td>Least Concern</td>
      <td>1,000,000</td>
    </tr>
    <tr>
      <td>African Lion</td>
      <td>Carnivore</td>
      <td>Vulnerable</td>
      <td>2,100,000</td>
    </tr>
    <tr>
      <td>Spotted Hyena</td>
      <td>Carnivore</td>
      <td>Least Concern</td>
      <td>10,000,000</td>
    </tr>
  </tbody>
</table>
```

For tables with a lot of numeric data, add the `cs-tabular-nums` class to any row, column, or whole table to ensure digits align.

```html {.example}
<table class="cs-tabular-nums">
  <caption>
    Average rainfall, in millimeters
  </caption>
  <thead>
    <tr>
      <th>City</th>
      <th>Spring</th>
      <th>Summer</th>
      <th>Autumn</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lisbon</td>
      <td>119</td>
      <td>14</td>
      <td>97</td>
    </tr>
    <tr>
      <td>Reykjavík</td>
      <td>148</td>
      <td>156</td>
      <td>219</td>
    </tr>
    <tr>
      <td>Kyoto</td>
      <td>362</td>
      <td>508</td>
      <td>327</td>
    </tr>
  </tbody>
</table>
```

### Details

Create disclosure widgets with `<details>` and `<summary>`. Details closely match the appearance of [`<cs-details>`](/components/details/).

```html {.example}
<details>
  <summary>Summary</summary>
  <p>
    Click the summary to expand and reveal this content. Native details elements are styled to closely match the
    appearance of the <code>&lt;cs-details&gt;</code> component, so they fit right in with the rest of your UI.
  </p>
</details>
```

### Dialog

Create modal and non-modal dialog boxes with `<dialog>`. Dialogs closely match the appearance of [`<cs-dialog>`](/components/dialog/).

```html {.example}
<dialog id="dialog-example">
  <p>This is a native dialog element styled to match Cornerstone components.</p>
  <button type="button">Close</button>
</dialog>

<button>Open Dialog</button>

<script>
  const dialog = document.querySelector('#dialog-example');
  const openButton = dialog.nextElementSibling;
  const closeButton = dialog.querySelector('button');

  openButton.addEventListener('click', () => dialog.showModal());
  closeButton.addEventListener('click', () => dialog.close());
</script>
```

### Progress

Create progress indicators with `<progress>`. Progress indicators closely match the appearance of [`<cs-progress-bar>`](/components/progress-bar/).

```html {.example}
<progress value="40" max="100"></progress>
<br />
<progress></progress>
```

## Forms

Native styles use [form control design tokens](/tokens/component-groups/#form-controls) to style form elements like buttons and inputs. Form elements additionally inherit `font-family` from the `<body>` element.

### Buttons

Create buttons with `<button>` or `<input type="button | submit | reset">`. Buttons closely match the appearance of [`<cs-button>`](/components/button/).

```html {.example}
<button>Button</button>
<input type="button" value="Input (button)" />
<input type="submit" value="Input (submit)" />
<input type="reset" value="Input (reset)" />
```

To create links that look like buttons, add the `cs-button` class to an `<a>` element.

```html {.example}
<a href="" class="cs-button">Link Button</a>
```

Add the `cs-brand`, `cs-neutral`, `cs-success`, `cs-warning`, or `cs-danger` class to specify the button's [color variant](/utilities/color/).

```html {.example}
<button class="cs-neutral">Neutral</button>
<button class="cs-brand">Brand</button>
<button class="cs-success">Success</button>
<button class="cs-warning">Warning</button>
<button class="cs-danger">Danger</button>
```

Add the `cs-accent`, `cs-filled`, `cs-outlined`, or `cs-plain` class to specify the button's visual appearance.

```html {.example}
<button class="cs-accent cs-neutral">Accent</button>
<button class="cs-filled cs-outlined cs-neutral">Filled + Outlined</button>
<button class="cs-filled cs-neutral">Filled</button>
<button class="cs-outlined cs-neutral">Outlined</button>
<button class="cs-plain cs-neutral">Plain</button>
```

Add a `cs-size-*` class to specify the size of the button. Available sizes are `cs-size-xs`, `cs-size-s`, `cs-size-m`, `cs-size-l`, and `cs-size-xl`.

```html {.example}
<button class="cs-size-xs">Extra Small</button>
<button class="cs-size-s">Small</button>
<button class="cs-size-m">Medium</button>
<button class="cs-size-l">Large</button>
<button class="cs-size-xl">Extra Large</button>
```

Add the `cs-pill` class to give buttons rounded edges.

```html {.example}
<button class="cs-pill">Pill button</button>
```

When using `<cs-icon>` within a button, wrap adjacent label text in `<span>` or similar to automatically add margin between the icon and the label, just like the `start` and `end` slots of `<cs-button>`.

```html {.example}
<button>
  <cs-icon name="flight_takeoff"></cs-icon>
  <span>Start Icon</span>
</button>
<button>
  <span>End Icon</span>
  <cs-icon name="flight_land"></cs-icon>
</button>
```

### Form Controls

Create a variety of form controls with `<input type="">`, `<select>`, and `<textarea>`. Each control closely matches the appearance of the corresponding Cornerstone component.

```html {.example}
<div class="cs-stack">
  <label>Text <input type="text" placeholder="add some text" /></label>
  <label>Date <input type="date" /></label>
  <label>Time <input type="time" /></label>
  <label>Number <input type="number" placeholder="12345" /></label>
  <label>Color <input type="color" value="#f36944" /></label>
  <label>File <input type="file" multiple /></label>
  <label>Range <input type="range" /></label>
  <label
    >Select
    <select>
      <option value="option-1">Option 1</option>
      <option value="option-2">Option 2</option>
      <option value="option-3">Option 3</option>
    </select>
  </label>
  <label>Textarea <textarea placeholder="add more text"></textarea></label>
  <div class="cs-cluster">
    <label><input type="checkbox" checked /> Checked</label>
    <label><input type="checkbox" class="indeterminate" /> Indeterminate</label>
    <label><input type="checkbox" /> Unchecked</label>
  </div>
  <div class="cs-cluster">
    <label><input type="radio" name="radio-group" value="1" checked /> First radio</label>
    <label><input type="radio" name="radio-group" value="2" /> Second radio</label>
    <label><input type="radio" name="radio-group" value="3" /> Third radio</label>
  </div>
</div>

<script>
  document.querySelector('.indeterminate').indeterminate = true;
</script>
```

Add a `cs-size-*` class to any form control or its parent `<label>` to specify its size. Available sizes are `cs-size-xs`, `cs-size-s`, `cs-size-m`, `cs-size-l`, and `cs-size-xl`.

```html {.example}
<div class="cs-stack">
  <input type="text" placeholder="Extra small input" class="cs-size-xs" />
  <div class="cs-cluster">
    <label class="cs-size-xs"><input type="checkbox" checked /> Extra small checkbox</label>
    <label class="cs-size-xs"><input type="radio" name="radio-xs" value="1" checked /> Extra small radio</label>
  </div>
  <input type="text" placeholder="Small input" class="cs-size-s" />
  <div class="cs-cluster">
    <label class="cs-size-s"><input type="checkbox" checked /> Small checkbox</label>
    <label class="cs-size-s"><input type="radio" name="radio-small" value="1" checked /> Small radio</label>
  </div>
  <input type="text" placeholder="Medium input" class="cs-size-m" />
  <div class="cs-cluster">
    <label class="cs-size-m"><input type="checkbox" checked /> Medium checkbox</label>
    <label class="cs-size-m"><input type="radio" name="radio-medium" value="1" checked /> Medium radio</label>
  </div>
  <input type="text" placeholder="Large input" class="cs-size-l" />
  <div class="cs-cluster">
    <label class="cs-size-l"><input type="checkbox" checked /> Large checkbox</label>
    <label class="cs-size-l"><input type="radio" name="radio-large" value="1" checked /> Large radio</label>
  </div>
  <input type="text" placeholder="Extra large input" class="cs-size-xl" />
  <div class="cs-cluster">
    <label class="cs-size-xl"><input type="checkbox" checked /> Extra large checkbox</label>
    <label class="cs-size-xl"><input type="radio" name="radio-xl" value="1" checked /> Extra large radio</label>
  </div>
</div>
```

Add the `cs-filled` class to an input to give it a filled background.

```html {.example}
<div class="cs-stack">
  <input type="text" placeholder="Filled input" class="cs-filled" />
  <select class="cs-filled">
    <option value="filled">Filled select</option>
  </select>
  <textarea placeholder="Filled textarea" class="cs-filled"></textarea>
</div>
```

Add the `cs-pill` class to an input or select to give it rounded edges.

```html {.example}
<div class="cs-stack">
  <input type="text" placeholder="Pill input" class="cs-pill" />
  <select class="cs-pill">
    <option value="pill">Pill select</option>
  </select>
</div>
```

Add any [button](#buttons) modifier class to `<input type="file">` to change the file selector button's color variant, appearance, size, and shape.

```html {.example}
<input type="file" class="cs-filled cs-outlined cs-warning cs-size-s cs-pill" />
```

### Fieldsets

Group form controls together with `<fieldset>` and `<legend>`.

```html {.example}
<fieldset class="cs-stack cs-align-items-start">
  <legend>Legend</legend>
  <label><input type="radio" name="legends" value="1" checked /> King Arthur</label>
  <label><input type="radio" name="legends" value="2" /> Robin Hood</label>
  <label><input type="radio" name="legends" value="3" /> Odysseus</label>
</fieldset>
```

### Form Layouts

Wrap form controls in a flex container to arrange them horizontally or vertically with even spacing. Layout utility classes like [`cs-cluster`](/utilities/cluster) and [`cs-stack`](/utilities/stack) can be added directly to a `<fieldset>` or `<form>` to make this especially easy.

```html {.example}
<fieldset class="cs-cluster">
  <legend>Ducks in a row</legend>
  <label><input type="checkbox" checked /> Mallard</label>
  <label><input type="checkbox" /> Common Loon</label>
  <label><input type="checkbox" /> Least Grebe</label>
</fieldset>

<br />

<form class="cs-stack">
  <label>Number of pancakes <input type="number" value="5" /></label>
  <label
    >Syrup flavor
    <select>
      <option value="maple">Maple</option>
      <option value="strawberry">Strawberry</option>
      <option value="blueberry">Blueberry</option>
      <option value="pecan">Butter pecan</option>
    </select>
  </label>
  <label><input type="checkbox" checked /> Add whipped butter</label>
  <button>
    <cs-icon name="layers"></cs-icon>
    Stack 'em up
  </button>
</form>
```
