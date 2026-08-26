---
title: Rating
category: Forms
synonyms:
  - stars
  - star rating
  - review
use-cases:
  - feedback
  - score
  - 5 stars
  - thumbs up
description: "Ratings display a numeric score as a row of selectable symbols, typically stars. Use them to capture quick feedback or show an average rating for a product or piece of content."
---

```html {.example}
<cs-rating label="Rating"></cs-rating>
```

:::info
This component works with standard `<form>` elements. See [form controls](/form-controls) for form submission and client-side validation.
:::

## Examples

### Label

Ratings are usually identified by context, so the label isn't displayed. Always provide one with the `label` attribute so assistive devices can announce the control.

```html {.example}
<cs-rating label="Rate this component"></cs-rating>
```

### Disabled

Use the `disabled` attribute to disable the rating.

```html {.example}
<cs-rating label="Rating" disabled value="3"></cs-rating>
```

### Readonly

Use the `readonly` attribute to display a rating that users can't change. Unlike `disabled`, a readonly rating still submits its value with the form.

```html {.example}
<cs-rating label="Rating" readonly value="3"></cs-rating>
```

### Size

Use the `size` attribute to change the rating's size.

```html {.example}
<div class="cs-stack">
  <cs-rating label="Extra small" size="xs"></cs-rating>
  <cs-rating label="Small" size="s"></cs-rating>
  <cs-rating label="Medium" size="m"></cs-rating>
  <cs-rating label="Large" size="l"></cs-rating>
  <cs-rating label="Extra large" size="xl"></cs-rating>
</div>
```

For finer control, set the `font-size` property directly.

```html {.example}
<cs-rating label="Rating" style="font-size: 3rem;"></cs-rating>
```

### Max Value

Ratings go from 0 to 5 by default. Use the `max` attribute to change the highest possible value.

```html {.example}
<cs-rating label="Rating" max="3"></cs-rating>
```

### Precision

Use the `precision` attribute to let users select fractional ratings, such as half stars.

```html {.example}
<cs-rating label="Rating" precision="0.5" value="2.5"></cs-rating>
```

### Custom Icons

Pass a function to the `getSymbol` property to render a custom symbol in place of the default star.

```html {.example}
<cs-rating label="Rating" class="rating-hearts" style="--symbol-color-active: #ff4136;"></cs-rating>

<script type="module">
  const rating = document.querySelector('.rating-hearts');

  await customElements.whenDefined('cs-rating');
  await rating.updateComplete;

  rating.getSymbol = () => '<cs-icon name="favorite" variant="fill"></cs-icon>';
</script>
```

### Value-Based Icons

The `getSymbol` function receives the symbol's value and whether it's currently selected, so you can render different icons across the scale.

```html {.example}
<cs-rating label="Rating" class="rating-emojis"></cs-rating>

<script type="module">
  const rating = document.querySelector('.rating-emojis');

  await customElements.whenDefined('cs-rating');
  await rating.updateComplete;

  rating.getSymbol = (value, isSelected) => {
    const icons = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];
    return `<cs-icon name="${icons[value - 1]}"></cs-icon>`;
  };
</script>
```

### Detecting Hover

Use the `cs-hover` event to react as the user hovers over (or touches and drags across) the rating, before they commit to a value.

The event's `detail` carries `phase` and `value`. The `phase` property reports when hovering starts, moves to a new value, and ends. The `value` property is what the rating would become if the user committed to the hovered symbol.

```html {.example}
<div class="detect-hover">
  <cs-rating label="Rating"></cs-rating>
  <span></span>
</div>

<script>
  const rating = document.querySelector('.detect-hover > cs-rating');
  const span = rating.nextElementSibling;
  const terms = ['No rating', 'Terrible', 'Bad', 'OK', 'Good', 'Excellent'];

  rating.addEventListener('cs-hover', event => {
    span.textContent = terms[event.detail.value];

    // Clear feedback when hovering stops
    if (event.detail.phase === 'end') {
      span.textContent = '';
    }
  });
</script>

<style>
  .detect-hover span {
    position: relative;
    top: -4px;
    left: 8px;
    border-radius: var(--cs-border-radius-m);
    background: var(--cs-color-neutral-fill-loud);
    color: var(--cs-color-neutral-on-loud);
    text-align: center;
    padding: 4px 6px;
  }

  .detect-hover span:empty {
    display: none;
  }
</style>
```

### Required

Use the `required` attribute to make the rating mandatory. The form won't submit until the user selects a value.

```html {.example}
<form class="rating-required">
  <cs-rating label="Rating" required></cs-rating>
  <br /><br />
  <cs-button appearance="filled" type="submit">Submit</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.rating-required');

  await Promise.all([customElements.whenDefined('cs-button'), customElements.whenDefined('cs-rating')]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This prevents the form from submitting and makes the browser display your message. Pass an empty string to clear the error.

```html {.example}
<form class="rating-custom-validity">
  <cs-rating label="Rating"></cs-rating>
  <br /><br />
  <cs-button appearance="filled" type="submit">Submit</cs-button>
</form>

<script type="module">
  const form = document.querySelector('.rating-custom-validity');
  const rating = form.querySelector('cs-rating');
  const errorMessage = 'Please rate at least 3 stars!';

  customElements.whenDefined('cs-rating').then(async () => {
    await rating.updateComplete;
    rating.setCustomValidity(errorMessage);
  });

  rating.addEventListener('change', () => {
    rating.setCustomValidity(rating.value >= 3 ? '' : errorMessage);
  });

  await Promise.all([customElements.whenDefined('cs-button'), customElements.whenDefined('cs-rating')]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Form Submission

Ratings work in forms just like native form controls. The rating's `name` and `value` are included in the form data on submit.

```html {.example}
<form class="rating-form-submission" action="about:blank" method="get" target="_blank">
  <cs-rating name="rating" label="How would you rate your experience?" required></cs-rating>
  <br /><br />
  <cs-button type="submit">Submit</cs-button>
  <cs-button appearance="filled" type="reset" variant="neutral">Reset</cs-button>
</form>
```
