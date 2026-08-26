---
title: Customizing
description: Override Cornerstone with plain CSS, and reach inside a component through its CSS parts, custom properties, and custom states.
synonyms:
  - styling
  - custom styles
  - override
  - theming
  - css parts
  - css custom properties
  - css variables
  - design tokens
use-cases:
  - theme
  - brand
  - css parts
  - custom properties
  - custom states
  - shadow dom
---

Cornerstone is built to be customized. Every component is styled with design tokens you can
override, and each one exposes CSS parts, custom properties and custom states so you can reach
inside it without fighting the shadow DOM.

## Customizing with CSS

For even more customizations, you can off-road and override any theme just with CSS — no preprocessor required. All tokens use the `--cs-` prefix to prevent collisions with other libraries. Write a stylesheet that overrides Cornerstone's [design tokens](/tokens) and you're off to the races.

Here's a starter that tweaks fonts, spacing, and corner radius across both color schemes:

```css
/* Custom CSS — applies to both light and dark mode */
:where(:root),
.cs-light,
.cs-dark,
.cs-invert {
  --cs-font-family-body: 'Inter', sans-serif;
  --cs-font-family-heading: 'Crimson Pro', serif;
  --cs-border-radius-scale: 1.5;
  --cs-space-scale: 1.125;
}
```

To create your own light mode styles, scope your styles to the following selectors:

```css
:where(:root),
.cs-light,
.cs-dark .cs-invert {
  /* your styles here */
}
```

To create your own dark mode styles, scope your styles to these selectors:

```css
.cs-dark,
.cs-invert {
  /* your styles here */
}
```

| Selector              | What It Targets                                                                |
| --------------------- | ------------------------------------------------------------------------------ |
| `:where(:root)`       | The default scope, with low specificity so other theme classes can override it |
| `.cs-light`           | Explicit light sections                                                        |
| `.cs-dark`            | Explicit dark sections                                                         |
| `.cs-invert`          | Flips the current color scheme for the section it's applied to                 |
| `.cs-dark .cs-invert` | An inverted descendant inside a dark section (becomes light)                   |

For a complete list of all custom properties used for theming, refer to `src/styles/themes/default.css` in the project's source code.

## Customizing Components

While themes offer a high-level way to customize the library, individual components offer different hooks as a low-level way to customize them one at a time. Cornerstone components use a [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) to encapsulate their styles and behaviors. As a result, you can't simply target their internals with the usual CSS selectors. Instead, components expose a set of CSS parts, custom properties, and custom states that can be targeted to customize their appearance.

### CSS Parts

CSS parts offer the most flexibility to customize individual components. The "parts" exposed by each component can be targeted with the [CSS part selector](https://developer.mozilla.org/en-US/docs/Web/CSS/::part), or `::part()`.

Parts allow you to style _any_ standard CSS property, not just those exposed through custom properties. Here's an example that modifies buttons with the `gradient-button` class.

```html {.example}
<cs-button class="gradient-button"> Gradient Button </cs-button>

<style>
  .gradient-button::part(button) {
    background: linear-gradient(217deg, var(--cs-color-sky-50), var(--cs-color-purple-50), var(--cs-color-cerise-50));
    border: solid 1px var(--cs-color-purple-50);
    transition:
      transform 100ms,
      box-shadow 100ms;
  }

  .gradient-button::part(button):hover {
    box-shadow: var(--cs-shadow-m);
    transform: translateY(-3px);
  }

  .gradient-button::part(button):active {
    box-shadow: inset var(--cs-shadow-s);
    transform: translateY(0);
  }

  .gradient-button::part(label) {
    color: white;
    text-shadow: rgb(0 0 0 / 0.3) 0 -1px;
  }
</style>
```

CSS parts have a few important advantages:

- Customizations can be made to components with explicit selectors, such as `::part(icon)`, rather than implicit selectors, such as `.button > div > span + .icon`, that are much more fragile.

- The internal structure of a component will likely change as it evolves. By exposing CSS parts through an API, the internals can be reworked without fear of breaking customizations as long as its parts remain intact.

- It encourages us to think more about how components are designed and how customizations should be allowed before users can take advantage of them. Once we opt a part into the component's API, it's guaranteed to be supported and can't be removed until a major version of the library is released.

Most (but not all) components expose parts. You can find them in each component's API documentation under the "CSS Parts" section.

#### Part names

A component's outermost element takes a part named after the component itself, so `<cs-button>` exposes `button` and `<cs-details>` exposes `details`. Where an inner element already holds that name — `<cs-input>` names its native control `input` — the wrapper takes a `-wrapper` suffix instead: `input-wrapper`, `textarea-wrapper`.

Not every component has one. When a component's outer element is the host, style it directly instead — `cs-card { ... }` rather than a part.

### Custom Properties

Components expose custom properties that are scoped to the component, not global, so they do not have the same `--cs-` prefix as a theme's custom properties. These custom properties reflect common qualities of a component, such as `--background-color`, `--border-style`, `--size`, etc.

You can set custom properties on a component in your stylesheet.

```css
cs-avatar {
  --size: 6rem;
}
```

This will also work if you need to target a subset of components with a specific class.

```css
cs-avatar.your-class {
  --size: 6rem;
}
```

Alternatively, you can set them inline directly on the element.

```html
<cs-avatar style="--size: 6rem;"></cs-avatar>
```

The custom properties exposed by each component can be found in the component's API documentation.

### Custom States

Components can expose custom states that allow you to style them based on their current condition using the `:state()` selector. Custom states provide a way to target specific component states that aren't covered by standard pseudo-classes like `:hover` or `:focus`.
Here's an example that styles a checkbox that's checked.

```css
cs-checkbox:state(checked) {
  outline: dotted 2px tomato;
}
```

Custom states can be combined with CSS parts and custom properties to create sophisticated customizations. The custom states exposed by each component can be found in the component's API documentation under the "Custom States" section.

### Native Elements

If you're using [native styles](/utilities/native), any custom styles added for a component should also target the corresponding native element. In general, the same styles you declare for components will work just the same to style their native counterparts.

For example, we can give `<input type="checkbox">` the same custom styles as `<cs-checkbox>` by using standard CSS properties and CSS parts:

```html {.example}
<cs-checkbox class="pinkify">Cornerstone checkbox</cs-checkbox>
<br />
<label>
  <input type="checkbox" class="pinkify" />
  HTML checkbox
</label>

<style>
  cs-checkbox.pinkify::part(control),
  input[type='checkbox'].pinkify {
    border-width: 3px;
  }

  cs-checkbox.pinkify:state(checked)::part(control),
  input[type='checkbox'].pinkify:checked {
    background-color: hotpink;
    border-color: hotpink;
    color: lavenderblush;
  }
</style>
```
