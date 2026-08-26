---
title: Random Content
category: Helpers
synonyms:
  - rotate
  - shuffle
  - variety
  - rotator
use-cases:
  - rotating testimonials
  - tip of the day
  - featured content
description: "Selects one or more child elements at random and displays them, hiding the rest."
---

Randomly picks and displays one or more of its slotted children, hiding the rest. Use it to rotate testimonials, surface featured content, show a tip of the day, or add variety to an otherwise static page.

```html {.example}
<div>
  <cs-random-content id="rc-overview">
    <cs-callout variant="brand">
      <cs-icon slot="icon" name="attach_file"></cs-icon>
      <strong>It looks like you're writing a letter!</strong><br />
      Want a hand with the formatting?
    </cs-callout>
    <cs-callout variant="brand">
      <cs-icon slot="icon" name="attach_file"></cs-icon>
      <strong>It looks like you're building a web app!</strong><br />
      I can recommend a few components.
    </cs-callout>
    <cs-callout variant="brand">
      <cs-icon slot="icon" name="attach_file"></cs-icon>
      <strong>It looks like you're stuck.</strong><br />
      Have you tried turning it off and on again?
    </cs-callout>
    <cs-callout variant="brand">
      <cs-icon slot="icon" name="attach_file"></cs-icon>
      <strong>It looks like you're shipping on a Friday.</strong><br />
      Bold move. I respect it.
    </cs-callout>
  </cs-random-content>

  <cs-divider></cs-divider>

  <cs-button appearance="filled" onclick="document.getElementById('rc-overview').randomize()">Shuffle</cs-button>
</div>
```

## Examples

### Providing Content

Slot virtually any HTML — text, badges, cards, images, or other components — as long as each item is a **direct child**. Nested elements and bare text nodes are ignored. The host renders [`display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents), so it stays invisible to layout.

```html {.example}
<div>
  <div class="cs-cluster cs-align-items-center" style="min-block-size: var(--cs-space-5xl)">
    <cs-random-content id="rc-providing">
      <p>Plain text works fine.</p>
      <cs-badge variant="brand">So do components</cs-badge>
      <cs-card>Even rich cards with their own content.</cs-card>
    </cs-random-content>
  </div>

  <cs-divider></cs-divider>

  <cs-button appearance="filled" onclick="document.getElementById('rc-providing').randomize()">Shuffle</cs-button>
</div>
```

### Number of Items

Set `items` to show more than one child at a time. The value is clamped to the number of available children.

```html {.example}
<div class="rc-items-demo">
  <cs-random-content id="rc-items" items="2">
    <cs-badge variant="brand">New</cs-badge>
    <cs-badge variant="success">Sale</cs-badge>
    <cs-badge variant="warning">Low stock</cs-badge>
    <cs-badge variant="neutral">Popular</cs-badge>
    <cs-badge variant="danger">Last chance</cs-badge>
  </cs-random-content>

  <cs-divider></cs-divider>

  <div class="cs-cluster cs-align-items-end">
    <cs-select id="rc-items-count" label="Items" value="2" style="width: 8rem">
      <cs-option value="1">1</cs-option>
      <cs-option value="2">2</cs-option>
      <cs-option value="3">3</cs-option>
      <cs-option value="4">4</cs-option>
    </cs-select>
    <cs-button appearance="filled" onclick="document.getElementById('rc-items').randomize()">Shuffle</cs-button>
  </div>
</div>

<script>
  document.getElementById('rc-items-count').addEventListener('change', event => {
    document.getElementById('rc-items').items = Number(event.target.value);
  });
</script>
```

### Changing the Mode

The `mode` attribute controls how the next selection is chosen. Switch modes and shuffle a few times to feel the difference — the recent picks are listed underneath.

| Mode                                                                                                                                                                                     | Behavior                                                                        | Best for                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| <span class="cs-cluster cs-flex-nowrap cs-gap-3xs">`unique` <cs-badge appearance="outlined" variant="neutral" pill style="font-size: var(--cs-font-size-2xs);">default</cs-badge></span> | Never repeats the previous selection.                                           | Tip rotators and timed loops.      |
| `random`                                                                                                                                                                                 | Picks at complete random, so the same item can appear twice in a row.           | A one-time shuffle on load.        |
| `sequence`                                                                                                                                                                               | Steps through children in DOM order, wrapping at the end (advances by `items`). | Stepping through content in order. |

```html {.example}
<div class="rc-modes-demo">
  <cs-random-content id="rc-modes" mode="unique">
    <cs-tag variant="brand">A</cs-tag>
    <cs-tag variant="success">B</cs-tag>
    <cs-tag variant="warning">C</cs-tag>
    <cs-tag variant="danger">D</cs-tag>
  </cs-random-content>

  <cs-divider></cs-divider>

  <div class="cs-cluster cs-align-items-end">
    <cs-select id="rc-modes-mode" label="Mode" value="unique" style="width: 10rem">
      <cs-option value="unique">unique</cs-option>
      <cs-option value="random">random</cs-option>
      <cs-option value="sequence">sequence</cs-option>
    </cs-select>
    <cs-button appearance="filled" onclick="document.getElementById('rc-modes').randomize()">Shuffle</cs-button>
  </div>

  <small style="display: block; margin-block-start: var(--cs-space-s)">
    Recent picks: <span id="rc-modes-history"></span>
  </small>
</div>

<script>
  const rcModes = document.getElementById('rc-modes');
  const rcModesHistory = document.getElementById('rc-modes-history');

  document.getElementById('rc-modes-mode').addEventListener('change', event => {
    rcModes.mode = event.target.value;
  });

  rcModes.addEventListener('cs-content-change', event => {
    const labels = event.detail.items.map(item => item.textContent.trim()).join('');
    const picks = (rcModesHistory.textContent + ' ' + labels).trim().split(/\s+/).slice(-16);
    rcModesHistory.textContent = picks.join(' ');
  });
</script>
```

### Animating New Content

Use the `animation` attribute to play an entrance transition when new content is shown.

```html {.example}
<div class="rc-animation-demo">
  <cs-random-content id="rc-animation" animation="fade-up">
    <p>Good morning!</p>
    <p>Welcome back.</p>
    <p>What are you building today?</p>
  </cs-random-content>

  <cs-divider></cs-divider>

  <div class="cs-cluster cs-align-items-end">
    <cs-select id="rc-animation-select" label="Animation" value="fade-up" style="width: 10rem">
      <cs-option value="none">none</cs-option>
      <cs-option value="fade">fade</cs-option>
      <cs-option value="fade-up">fade-up</cs-option>
      <cs-option value="fade-down">fade-down</cs-option>
      <cs-option value="fade-left">fade-left</cs-option>
      <cs-option value="fade-right">fade-right</cs-option>
    </cs-select>
    <cs-button appearance="filled" onclick="document.getElementById('rc-animation').randomize()">Next</cs-button>
  </div>
</div>

<script>
  document.getElementById('rc-animation-select').addEventListener('change', event => {
    document.getElementById('rc-animation').animation = event.target.value;
  });
</script>
```

Directional animations (`fade-up`, `fade-down`, `fade-left`, `fade-right`) rely on CSS `transform`, which has no effect on `display: inline` elements. The component promotes inline children to `inline-block` while a directional animation plays, so they work inline without extra markup.

Tune the duration, easing, and travel distance with the `--animation-duration`, `--animation-easing`, and `--animation-translate` custom properties. Animations are skipped automatically when the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

### Autoplay

Add the `autoplay` attribute to rotate content on a timer, and set the cadence with `autoplay-interval` (milliseconds). It pauses while the pointer is over the component or focus is inside it, and resumes when the user moves away. It respects reduced motion, too: content still rotates, but the entrance animation is skipped. Each new item is announced to screen readers using its text, so give icon-only content an accessible label (for example `<cs-icon label="…">`).

```html {.example}
<div class="rc-autoplay-demo">
  <dl>
    <dt>Did you know?</dt>
    <cs-random-content id="rc-autoplay" mode="unique" animation="fade-up" autoplay autoplay-interval="3000">
      <dd><cs-icon name="pets" variant="fill"></cs-icon> Octopuses have three hearts.</dd>
      <dd><cs-icon name="emoji_nature"></cs-icon> Honey never spoils.</dd>
      <dd><cs-icon name="eco"></cs-icon> A group of flamingos is called a flamboyance.</dd>
      <dd><cs-icon name="nutrition"></cs-icon> Bananas are botanically berries.</dd>
      <dd><cs-icon name="pets"></cs-icon> Cheetahs meow rather than roar.</dd>
    </cs-random-content>
  </dl>

  <cs-divider></cs-divider>

  <cs-button id="rc-autoplay-toggle" appearance="filled">Pause</cs-button>
</div>

<style>
  .rc-autoplay-demo dl {
    margin: 0;
  }
  .rc-autoplay-demo dt {
    font-weight: var(--cs-font-weight-semibold);
    margin-block-end: var(--cs-space-2xs);
  }
  .rc-autoplay-demo dd {
    margin-inline-start: 0;
  }
  .rc-autoplay-demo dd cs-icon {
    margin-inline-end: var(--cs-space-2xs);
    color: var(--cs-color-brand-fill-loud);
  }
</style>

<script>
  const rcAutoplay = document.getElementById('rc-autoplay');
  const rcAutoplayToggle = document.getElementById('rc-autoplay-toggle');

  rcAutoplayToggle.addEventListener('click', () => {
    rcAutoplay.autoplay = !rcAutoplay.autoplay;
    rcAutoplayToggle.textContent = rcAutoplay.autoplay ? 'Pause' : 'Play';
  });
</script>
```

:::warning
<strong>If you turn on `autoplay`, give people a way to pause it.</strong><br />
The built-in hover and focus pausing doesn't help someone using a keyboard when the rotating content isn't focusable, so add a visible pause button like the one above.
:::

### Styling the Container

The host is `display: contents` by default, so it adds no box of its own. To lay several shown items out as a row or grid, give the host its own `display` — that overrides the transparent default. Here it shows three of six people at random in a flex row.

```html {.example}
<div>
  <cs-random-content id="rc-layout" items="3" class="cs-cluster cs-align-items-stretch">
    <cs-avatar label="Jordan Hayes" initials="JH"></cs-avatar>
    <cs-avatar label="Mara Goldberg" initials="MG"></cs-avatar>
    <cs-avatar label="Beck Watts" initials="BW"></cs-avatar>
    <cs-avatar label="Avi Lin" initials="AL"></cs-avatar>
    <cs-avatar label="Rae Park" initials="RP"></cs-avatar>
    <cs-avatar label="Sam Cho" initials="SC"></cs-avatar>
  </cs-random-content>

  <cs-divider></cs-divider>

  <cs-button appearance="filled" onclick="document.getElementById('rc-layout').randomize()">Shuffle</cs-button>
</div>
```

Because the host is transparent, the component also works inline within a sentence.

```html {.example}
<div>
  <p>
    Have a
    <cs-random-content id="rc-inline">
      <span>wonderful</span>
      <span>fantastic</span>
      <span>marvelous</span>
      <span>splendid</span>
    </cs-random-content>
    day!
  </p>

  <cs-divider></cs-divider>

  <cs-button appearance="filled" onclick="document.getElementById('rc-inline').randomize()">Shuffle</cs-button>
</div>
```

Unselected children are hidden with the `hidden` attribute, so you can target whatever is currently shown with `:not([hidden])`:

```css
cs-random-content > :not([hidden]) {
  outline: var(--cs-border-width-s) solid var(--cs-color-brand-fill-loud);
}
```

### Reacting to Changes

The component emits a `cs-content-change` event whenever the displayed selection changes — on first render, on `randomize()`, and on each autoplay tick. `event.detail.items` is the array of elements now shown.

```javascript
const rc = document.querySelector('cs-random-content');

rc.addEventListener('cs-content-change', event => {
  console.log('Now showing:', event.detail.items);
});
```

### Server-Side Rendering

Until the component upgrades on the client, every child is visible, which can flash on first paint. Add the [`cs-cloak`](/utilities/fouce) class to hide content until Cornerstone is ready. Because the first selection is random, server- and client-rendered output can also differ; for a stable first paint, use `mode="sequence"`, which always starts at the first child.

### Using a Framework

The component selects from its slotted children by toggling the `hidden` attribute on them directly. Treat that content as static — if a framework owns and re-renders the children, its reconciliation can overwrite the hidden state. Render a fixed set of children, then drive the component imperatively: call `randomize()` through a ref and listen for `cs-content-change`.
