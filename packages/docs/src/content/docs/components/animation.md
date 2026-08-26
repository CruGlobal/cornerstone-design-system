---
title: Animation
category: Helpers
synonyms:
  - motion
  - transition
  - keyframes
  - animate
use-cases:
  - entrance animation
  - exit animation
  - attention seeker
  - scroll animation
description: "Animate elements declaratively with nearly 100 baked-in presets, or roll your own with custom keyframes. Powered by the Web Animations API."
---

To animate an element, wrap it in `<cs-animation>` and set the `name` attribute. The animation will not start until you add the `play` attribute. Refer to the [properties table](#attributes-and-properties) for a list of all animation options.

```html {.example}
<div class="animation-overview">
  <cs-animation name="bounce" duration="2000" play><div class="box"></div></cs-animation>
  <cs-animation name="jello" duration="2000" play><div class="box"></div></cs-animation>
  <cs-animation name="heartBeat" duration="2000" play><div class="box"></div></cs-animation>
  <cs-animation name="flip" duration="2000" play><div class="box"></div></cs-animation>
</div>

<style>
  .animation-overview .box {
    display: inline-block;
    width: 100px;
    height: 100px;
    background-color: var(--cs-color-brand-fill-loud);
    margin: var(--cs-space-l);
  }
</style>
```

:::info
The animation will only be applied to the first child element found in `<cs-animation>`.
:::

:::warning
<strong>Respect users who prefer reduced motion.</strong><br />
`<cs-animation>` plays regardless of the user's motion preferences. Gate decorative animations behind a [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query so they don't play for people who've asked to minimize motion.
:::

## Examples

### Animations & Easings

This example demonstrates all of the baked-in animations and easings. Animations are based on those found in the popular [Animate.css](https://animate.style/) library.

```html {.example}
<div class="animation-sandbox">
  <cs-animation name="bounce" easing="ease-in-out" duration="2000" play>
    <div class="box"></div>
  </cs-animation>

  <cs-divider></cs-divider>

  <div class="controls">
    <cs-select label="Animation" value="bounce"></cs-select>
    <cs-select label="Easing" value="linear"></cs-select>
    <cs-input label="Playback Rate" type="number" min="0" max="2" step=".25" value="1"></cs-input>
  </div>
</div>

<script type="module">
  import { getAnimationNames, getEasingNames } from '/dist/cornerstone.js';

  const container = document.querySelector('.animation-sandbox');
  const animation = container.querySelector('cs-animation');
  const animationName = container.querySelector('.controls cs-select:nth-child(1)');
  const easingName = container.querySelector('.controls cs-select:nth-child(2)');
  const playbackRate = container.querySelector('cs-input[type="number"]');
  const animations = getAnimationNames();
  const easings = getEasingNames();

  animations.map(name => {
    const option = Object.assign(document.createElement('cs-option'), {
      textContent: name,
      value: name,
    });
    animationName.appendChild(option);
  });

  easings.map(name => {
    const option = Object.assign(document.createElement('cs-option'), {
      textContent: name,
      value: name,
    });
    easingName.appendChild(option);
  });

  animationName.addEventListener('change', () => (animation.name = animationName.value));
  easingName.addEventListener('change', () => (animation.easing = easingName.value));
  playbackRate.addEventListener('input', () => (animation.playbackRate = playbackRate.value));
</script>

<style>
  .animation-sandbox .box {
    width: 100px;
    height: 100px;
    background-color: var(--cs-color-brand-fill-loud);
  }

  .animation-sandbox .controls {
    max-width: 300px;
    margin-top: var(--cs-space-xl);
  }

  .animation-sandbox .controls cs-select {
    margin-bottom: var(--cs-space-m);
  }
</style>
```

### Using Intersection Observer

Use an [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to control the animation when an element enters or exits the viewport. For example, scroll the box below in and out of your screen. The animation stops when the box exits the viewport and restarts each time it enters the viewport.

```html {.example}
<div class="animation-scroll">
  <cs-animation name="jackInTheBox" duration="2000" iterations="1"><div class="box"></div></cs-animation>
</div>

<script type="module">
  const container = document.querySelector('.animation-scroll');
  const animation = container.querySelector('cs-animation');
  const box = animation.querySelector('.box');

  // Watch for the box to enter and exit the viewport. Note that we're observing the box, not the animation element!
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      // Start the animation when the box enters the viewport
      animation.play = true;
    } else {
      animation.play = false;
      animation.currentTime = 0;
    }
  });
  observer.observe(box);
</script>

<style>
  .animation-scroll .box {
    display: inline-block;
    width: 100px;
    height: 100px;
    background-color: var(--cs-color-brand-fill-loud);
  }
</style>
```

### Custom Keyframe Formats

Supply your own [keyframe formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats) to build custom animations.

```html {.example}
<div class="animation-keyframes">
  <cs-animation easing="ease-in-out" duration="2000" play>
    <div class="box"></div>
  </cs-animation>
</div>

<script type="module">
  const animation = document.querySelector('.animation-keyframes cs-animation');
  animation.keyframes = [
    {
      offset: 0,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
      fillMode: 'both',
      transformOrigin: 'center center',
      transform: 'rotate(0)',
    },
    {
      offset: 1,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
      fillMode: 'both',
      transformOrigin: 'center center',
      transform: 'rotate(90deg)',
    },
  ];
</script>

<style>
  .animation-keyframes .box {
    width: 100px;
    height: 100px;
    background-color: var(--cs-color-brand-fill-loud);
  }
</style>
```

### Playing Animations on Demand

Animations won't play until you apply the `play` attribute. You can omit it initially, then apply it on demand such as after a user interaction. In this example, the button will animate once every time the button is clicked.

```html {.example}
<div class="animation-form">
  <cs-animation name="rubberBand" duration="1000" iterations="1">
    <cs-button appearance="filled" variant="brand">Click me</cs-button>
  </cs-animation>
</div>

<script type="module">
  const container = document.querySelector('.animation-form');
  const animation = container.querySelector('cs-animation');
  const button = container.querySelector('cs-button');

  button.addEventListener('click', () => {
    animation.play = true;
  });
</script>
```
