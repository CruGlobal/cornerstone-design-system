---
title: Slider
category: Forms
synonyms:
  - range
  - range slider
  - range input
  - scrubber
use-cases:
  - volume control
  - price range
  - filter range
  - seek bar
description: "Sliders let users choose a numeric value within a defined range by dragging a thumb along a track."
---

<style>
  /* Vertical sliders need a container height and a narrow track column; 80px is exactly
     `--cs-space-5xl`, and the row is four of them tall. */
  .vertical-slider-row {
    block-size: calc(var(--cs-space-5xl) * 4);
  }

  .vertical-slider {
    inline-size: var(--cs-space-5xl);
  }
</style>

```html {.example}
<cs-slider
  label="Number of users"
  hint="Limit six per team"
  name="value"
  value="3"
  min="0"
  max="6"
  with-markers
  with-tooltip
>
  <span slot="reference">Less</span>
  <span slot="reference">More</span>
</cs-slider>
```

```html {.example .anatomy-only}
<cs-slider label="Number of users" hint="Limit six per team" value="3" min="0" max="6">
  <span slot="reference">Less</span>
  <span slot="reference">More</span>
</cs-slider>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Use the `label` attribute to give the slider an accessible label. For labels that contain HTML, use the `label` slot instead.

```html {.example}
<cs-slider label="Volume" min="0" max="100"></cs-slider>
```

### Hint

Add descriptive hint to a slider with the `hint` attribute. For hints that contain HTML, use the `hint` slot instead.

```html {.example}
<cs-slider label="Volume" hint="Controls the volume of the current song." min="0" max="100" value="50"></cs-slider>
```

### Min, Max & Step

Use the `min` and `max` attributes to define the slider's range, and the `step` attribute to control the increment between values.

```html {.example}
<cs-slider label="Between zero and one" min="0" max="1" step="0.1" value="0.5" with-tooltip></cs-slider>
```

### Showing a Tooltip

Use the `with-tooltip` attribute to display a tooltip with the current value when the slider is focused or being dragged.

```html {.example}
<cs-slider label="Quality" name="quality" min="0" max="100" value="50" with-tooltip></cs-slider>
```

### Showing Markers

Use the `with-markers` attribute to display visual indicators at each step increment. This works best with sliders that have a smaller range of values.

```html {.example}
<cs-slider label="Size" name="size" min="0" max="8" value="4" with-markers></cs-slider>
```

### Adding References

Use the `reference` slot to add contextual labels below the slider. References are automatically spaced using `space-between`, making them easy to align with the start, center, and end positions.

```html {.example}
<cs-slider
  label="Speed"
  name="speed"
  min="1"
  max="5"
  value="3"
  with-markers
  hint="Controls the speed of the thing you're currently doing."
>
  <span slot="reference">Slow</span>
  <span slot="reference">Medium</span>
  <span slot="reference">Fast</span>
</cs-slider>
```

:::info
<strong>Show a reference next to a specific marker.</strong><br />
Add `position: absolute` to the reference and set `left`, `right`, `top`, or `bottom` to a percentage that matches the marker's position.
:::

### Range Selection

Use the `range` attribute to enable dual-thumb selection for choosing a range of values. Set the initial thumb positions with the `min-value` and `max-value` attributes.

```html {.example}
<cs-slider
  label="Price Range"
  hint="Select minimum and maximum price"
  name="price"
  range
  min="0"
  max="100"
  min-value="20"
  max-value="80"
  with-tooltip
  id="slider__range"
>
  <span slot="reference">$0</span>
  <span slot="reference">$50</span>
  <span slot="reference">$100</span>
</cs-slider>

<script type="module">
  const slider = document.getElementById('slider__range');
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  customElements.whenDefined('cs-slider').then(() => {
    slider.valueFormatter = value => formatter.format(value);
  });
</script>
```

For range sliders, the `minValue` and `maxValue` properties represent the current positions of the thumbs. When the form is submitted, both values will be included as separate entries with the same name.

```ts
const slider = document.querySelector('cs-slider[range]');

// Get the current values
console.log(`Min value: ${slider.minValue}, Max value: ${slider.maxValue}`);

// Set the values programmatically
slider.minValue = 30;
slider.maxValue = 70;
```

### Vertical Sliders

Set the `orientation` attribute to `vertical` to create a vertical slider. Vertical sliders automatically center themselves and fill the available vertical space.

```html {.example}
<div class="cs-cluster cs-align-items-stretch">
  <cs-slider orientation="vertical" label="Volume" name="volume" value="65" class="vertical-slider"></cs-slider>

  <cs-slider orientation="vertical" label="Bass" name="bass" value="50" class="vertical-slider"></cs-slider>

  <cs-slider orientation="vertical" label="Treble" name="treble" value="40" class="vertical-slider"></cs-slider>
</div>
```

Range sliders can also be vertical.

```html {.example}
<div class="cs-cluster cs-gap-xl vertical-slider-row">
  <cs-slider
    label="Temperature Range"
    orientation="vertical"
    range
    min="0"
    max="100"
    min-value="30"
    max-value="70"
    with-tooltip
    tooltip-placement="right"
    id="slider__vertical-range"
  >
  </cs-slider>
</div>

<script type="module">
  const slider = document.getElementById('slider__vertical-range');
  slider.valueFormatter = value => {
    return new Intl.NumberFormat('en', {
      style: 'unit',
      unit: 'fahrenheit',
      unitDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  };
</script>
```

### Size

Control the slider's size with the `size` attribute. Valid options are `xs`, `s`, `m`, `l`, and `xl`.

```html {.example}
<div class="cs-stack">
  <cs-slider size="xs" value="50" label="Extra small"></cs-slider>
  <cs-slider size="s" value="50" label="Small"></cs-slider>
  <cs-slider size="m" value="50" label="Medium"></cs-slider>
  <cs-slider size="l" value="50" label="Large"></cs-slider>
  <cs-slider size="xl" value="50" label="Extra large"></cs-slider>
</div>
```

### Indicator Offset

By default, the filled indicator extends from the minimum value to the current position. Use the `indicator-offset` attribute to change the starting point of this visual indicator.

```html {.example}
<cs-slider
  label="User Friendliness"
  hint="Did you find our product easy to use?"
  name="value"
  value="0"
  min="-5"
  max="5"
  indicator-offset="0"
  with-markers
  with-tooltip
>
  <span slot="reference">Easy</span>
  <span slot="reference">Moderate</span>
  <span slot="reference">Difficult</span>
</cs-slider>
```

### Disabled

Use the `disabled` attribute to disable a slider.

```html {.example}
<cs-slider label="Disabled" value="50" disabled></cs-slider>
```

### Readonly

Use the `readonly` attribute to show a value that users can't change by dragging. Unlike `disabled`, a readonly slider stays focusable and its value is still submitted with the form.

```html {.example}
<cs-slider label="Server load" value="72" min="0" max="100" with-tooltip readonly></cs-slider>
```

### Formatting the Value

Customize how values are displayed in tooltips and announced to screen readers using the `valueFormatter` property. Set it to a function that accepts a number and returns a formatted string. The [`Intl.NumberFormat API`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) is particularly useful for this.

```html {.example}
<!-- Percent -->
<cs-slider
  id="slider__percent"
  label="Percentage"
  name="percentage"
  value="0.5"
  min="0"
  max="1"
  step=".01"
  with-tooltip
></cs-slider
><br />

<script type="module">
  const slider = document.getElementById('slider__percent');
  const formatter = new Intl.NumberFormat('en-US', { style: 'percent' });

  customElements.whenDefined('cs-slider').then(() => {
    slider.valueFormatter = value => formatter.format(value);
  });
</script>

<!-- Duration -->
<cs-slider id="slider__duration" label="Duration" name="duration" value="12" min="0" max="24" with-tooltip></cs-slider
><br />

<script type="module">
  const slider = document.getElementById('slider__duration');
  const formatter = new Intl.NumberFormat('en-US', { style: 'unit', unit: 'hour', unitDisplay: 'long' });

  customElements.whenDefined('cs-slider').then(() => {
    slider.valueFormatter = value => formatter.format(value);
  });
</script>

<!-- Currency -->
<cs-slider id="slider__currency" label="Currency" name="currency" min="0" max="100" value="50" with-tooltip></cs-slider>

<script type="module">
  const slider = document.getElementById('slider__currency');
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0,
  });

  customElements.whenDefined('cs-slider').then(() => {
    slider.valueFormatter = value => formatter.format(value);
  });
</script>
```

### Reacting to Input

The slider emits an `input` event as the user drags, so you can drive live UI from its value in real time. Here, moving the slider resizes the preview text.

```html {.example}
<div class="text-size-demo">
  <p class="text-size-preview">The quick brown fox jumps over the lazy dog.</p>

  <cs-divider></cs-divider>

  <cs-slider label="Text size" min="12" max="48" value="18" with-tooltip></cs-slider>
</div>

<script type="module">
  const demo = document.querySelector('.text-size-demo');
  const slider = demo.querySelector('cs-slider');
  const preview = demo.querySelector('.text-size-preview');

  slider.addEventListener('input', () => {
    preview.style.fontSize = `${slider.value}px`;
  });
</script>

<style>
  .text-size-demo .text-size-preview {
    margin: 0 0 var(--cs-space-m);
    font-size: 18px;
    transition: font-size 75ms ease;
  }
</style>
```

### Filtering with a Range

A range slider's two thumbs make it a natural filter control. Here, dragging the thumbs hides list items whose price falls outside the selected range.

```html {.example}
<div class="price-filter-demo">
  <ul class="price-filter-list">
    <li data-price="15">Sticker pack — $15</li>
    <li data-price="30">T-shirt — $30</li>
    <li data-price="55">Hoodie — $55</li>
    <li data-price="80">Backpack — $80</li>
    <li data-price="120">Jacket — $120</li>
  </ul>

  <cs-divider></cs-divider>

  <cs-slider
    id="price-filter"
    label="Price range"
    range
    min="0"
    max="150"
    min-value="0"
    max-value="150"
    with-tooltip
  ></cs-slider>
</div>

<script type="module">
  const demo = document.querySelector('.price-filter-demo');
  const slider = demo.querySelector('cs-slider');
  const items = demo.querySelectorAll('.price-filter-list li');
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function filter() {
    items.forEach(item => {
      const price = Number(item.dataset.price);
      item.hidden = price < slider.minValue || price > slider.maxValue;
    });
  }

  customElements.whenDefined('cs-slider').then(() => {
    slider.valueFormatter = value => currency.format(value);
    slider.addEventListener('input', filter);
    filter();
  });
</script>

<style>
  .price-filter-demo .price-filter-list {
    list-style: none;
    margin: 0 0 var(--cs-space-m);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cs-space-xs);
    min-height: 13rem;
  }

  .price-filter-demo .price-filter-list li {
    padding: var(--cs-space-xs) var(--cs-space-s);
    border-radius: var(--cs-border-radius-m);
    background-color: color-mix(in srgb, var(--cs-color-brand-fill-loud) 10%, transparent);
  }
</style>
```
