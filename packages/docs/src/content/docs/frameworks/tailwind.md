---
title: Tailwind CSS
description: Running Cornerstone Components and Tailwind v4 on the same page while your app moves from one to the other.
officialDocs: https://tailwindcss.com/docs
sidebar:
  badge:
    text: Testing
    variant: caution
---

<div class="cs-cluster cs-gap-2xs cs-not-prose">
  <cs-badge variant="success" appearance="filled" pill>
    <cs-icon name="check_circle" slot="start"></cs-icon>Verified on Tailwind 4.3
  </cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>Tailwind CLI</cs-badge>
  <cs-badge variant="neutral" appearance="filled" pill>esbuild</cs-badge>
</div>

Partway through a move from Tailwind v4 to Cornerstone Components, an app runs both on the same page. That works,
but not with the obvious setup. Four things go wrong:

1. **The Cornerstone Components stylesheet never loads.** Tailwind leaves its `@import url()` lines in place, and
   the browser either skips them or looks for the files in the wrong folder.
2. **Preflight flattens components.** Tailwind's reset strips the padding, margins and borders that components give
   themselves, so dropdown items lose their padding and dividers disappear.
3. **Spacing utilities grow inside some components.** Tailwind's `--spacing` unit has the same name as a component
   property, so `p-4` inside a card comes out six times too big.
4. **The wrong library wins.** Whichever one you import second outranks the other, so either Preflight undoes
   the styles Cornerstone Components gives native elements, or Cornerstone Components overrides your Tailwind
   classes.

The setup below fixes all four with one script that runs before Tailwind and one entry stylesheet.
[Why each piece is there](#why-each-piece-is-there) says what breaks without it.

## Setup

Install esbuild alongside Tailwind. The script uses it to flatten the Cornerstone Components stylesheet.

```bash
npm install @cruglobal/cornerstone-components tailwindcss @tailwindcss/cli esbuild
```

Save this script at the root of your project:

```js
// build-cornerstone-css.mjs: run before every Tailwind build.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const out = 'tmp/cornerstone';
mkdirSync(out, { recursive: true });

// 1. The Cornerstone Components stylesheet, flattened into one file.
await build({
  entryPoints: [require.resolve('@cruglobal/cornerstone-components/styles/cornerstone.css')],
  bundle: true,
  outfile: `${out}/cornerstone.css`,
});

// Tag names from the manifest the package ships, so both lists follow the package.
const manifest = require('@cruglobal/cornerstone-components/custom-elements.json');
const components = manifest.modules.flatMap((module) => module.declarations ?? []).filter((d) => d.tagName);
const tags = components.map((d) => d.tagName).join(', ');
const spacingTags = components
  .filter((d) => d.cssProperties?.some((property) => property.name === '--spacing'))
  .map((d) => d.tagName)
  .join(', ');

// 2. Preflight, with its universal reset kept off every cs-* element.
const preflight = readFileSync(require.resolve('tailwindcss/preflight.css'), 'utf8');
const resetSelector = '*,\n::after,';
if (!preflight.includes(resetSelector)) {
  throw new Error('tailwindcss/preflight.css no longer opens with `*,`. Update this script.');
}
writeFileSync(`${out}/preflight.css`, preflight.replace(resetSelector, `:where(:not(${tags})),\n::after,`));

// 3. Tailwind's spacing unit, back on the content of components with a --spacing of their own.
const rule = `:is(${spacingTags}) > :not(${spacingTags}) {\n  --spacing: --theme(--spacing inline);\n}\n`;
writeFileSync(`${out}/spacing.css`, spacingTags ? rule : '');
```

It writes three files to `tmp/cornerstone/`. Keep that folder out of git, because the files are rebuilt from
whatever versions are installed. Keep it out of anything your asset pipeline serves on its own, too: the files are
input for Tailwind, not stylesheets to link. Rails' `stylesheet_link_tag :app`, for one, links every CSS file under
`app/assets`.

Import the three files from your Tailwind entry stylesheet, in this order. The paths are relative to the entry file,
so adjust them if yours lives in another folder.

```css
/* app.css */
@layer theme, base, cornerstone, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import './tmp/cornerstone/preflight.css' layer(base);
@import './tmp/cornerstone/spacing.css' layer(base);
@import './tmp/cornerstone/cornerstone.css' layer(cornerstone);
@import 'tailwindcss/utilities.css' layer(utilities);
```

Then run the script ahead of every Tailwind build:

```json
{
  "scripts": {
    "build:css": "node build-cornerstone-css.mjs && tailwindcss -i app.css -o build/app.css"
  }
}
```

Load the components the way you would without Tailwind. See [Installation](/#loading-the-library).

## Why each piece is there

### Flattening the stylesheet

`styles/cornerstone.css` is a chain of `@import url()` lines, and the files it imports import more. A browser
follows the chain. Tailwind does not: it inlines imports written as quoted paths, and it
[keeps `url()` imports in its output as they are](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/at-import.ts#L106-L110).

So `@import '@cruglobal/cornerstone-components/styles/cornerstone.css'` in a Tailwind entry builds without an error
and loads nothing from Cornerstone Components: no theme, no native styles, no utilities. How it fails depends on
where you put it:

- **After `@import 'tailwindcss'`**, the lines sit below Tailwind's own rules, and
  [an `@import` after other rules is invalid](https://www.w3.org/TR/css-cascade-5/#at-import). The browser skips
  them with no request and no console message, so there is nothing to spot.
- **Before it**, the lines stay at the top, and the browser looks for each file next to the compiled stylesheet,
  where none of them are. Each one is a 404.

The script's first step bundles the chain into one file with esbuild, which Tailwind can inline.

### The Preflight copy

[Preflight](https://tailwindcss.com/docs/preflight) is Tailwind's set of base styles, and it opens with a reset on
every element:

```css
*,
::after,
::before,
::backdrop,
::file-selector-button {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
```

Each `cs-*` component sets its own padding, margins and borders on its host element, from inside its shadow root
with `:host`. Any rule in the page that matches the same element beats a `:host` rule, whatever its layer or
specificity, because the cascade [compares where a rule comes from](https://www.w3.org/TR/css-cascade-5/#cascade-context)
first. So `*` wins: dropdown items lose their padding, dividers lose their line and margins, and cards lose their
border. No layer order can fix that, which is why the script edits Preflight instead.

The copy changes only that one selector, to `:where(:not(cs-badge, cs-button, …))`. The reset skips every `cs-*`
element and still reaches everything else, and `:where()` keeps its specificity at zero, the same as `*`. The tag
list comes from the `custom-elements.json` the package ships, so a new component is covered when you update. If a
later Tailwind release changes how Preflight opens, the script stops with an error rather than writing a copy that
still resets components.

Tailwind [documents importing Preflight on its own](https://tailwindcss.com/docs/preflight#disabling-preflight),
which is what lets the copy stand in for it. Leaving Preflight out is the other way to stop the reset. Keep it if the
markup you have not ported yet depends on it.

### The spacing reset

Tailwind v4 builds its spacing utilities from one theme variable: [`p-4` is `calc(var(--spacing) * 4)`](https://tailwindcss.com/docs/padding),
and [`--spacing` is `0.25rem`](https://tailwindcss.com/docs/theme) unless you change it. Some `cs-*` components
have a `--spacing` property of their own, set on their host. Custom properties inherit, so content inside those
components reads the component's value instead of Tailwind's. In the checks below, `p-4` came out 96px instead of
16px inside a `<cs-card>`.

The script finds those components in `custom-elements.json` (they are the ones whose API reference lists
`--spacing`) and writes one rule for them:

```css
:is(cs-card, cs-details, …) > :not(cs-card, cs-details, …) {
  --spacing: --theme(--spacing inline);
}
```

- **The `>` reaches the component's own children**, the content you put in it, and everything deeper inherits from
  them. The component's shadow root still reads the host's value, so a card keeps its own padding.
- **The `:not(…)` skips those same components** when one sits right inside another. Without it, a `<cs-divider>`
  placed straight in a card takes Tailwind's unit as its own spacing, and its margins shrink from 16px to 4px.
- **`--theme(--spacing inline)` writes Tailwind's value**, `0.25rem` or whatever your `@theme` sets. The `inline`
  matters. Without it Tailwind writes `var(--spacing)`, a property that
  [refers to itself](https://www.w3.org/TR/css-variables-1/#cycles), which CSS treats as invalid, and every spacing
  utility inside the component computes to nothing. Tailwind's documentation does not describe `--theme()`, but its
  `inline` option is [in Tailwind's source](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/css-functions.ts#L99-L103),
  and Tailwind's own Preflight uses the function.

This is a workaround. Whether the components' `--spacing` should be renamed so the two stop clashing is
[an open decision](https://github.com/CruGlobal/cornerstone-design-system/issues/182), so keep the rule until it is
settled. If a later release drops `--spacing` from every component, the script writes an empty file and the rule is
gone.

### The layer order

Both libraries put their page styles in [cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer).
Tailwind declares `theme`, `base` (where Preflight lives), `components` and `utilities`. Cornerstone Components
declares its own `cs-*` layers in `styles/layers.css`, starting with its native element styles. Layers rank in the
order they are first named, so with no statement at the top, the library you import second outranks the first:

- **Cornerstone Components first:** Preflight outranks Cornerstone Components' native element styles. Plain
  headings shrink to body text and lists lose their bullets.
- **Tailwind first:** Cornerstone Components outranks every Tailwind utility. `text-sm mb-8` on a heading does
  nothing, and `bg-red-600` on a button loses to Cornerstone Components' button style.

The statement puts Preflight lowest, then Cornerstone Components, then Tailwind's components and utilities. So the
native element styles win over the reset, and any Tailwind class you write still wins over Cornerstone Components.

`layer(cornerstone)` puts all of Cornerstone Components into one layer, with its own layers nested inside in their
own order. Naming its layers one by one in the statement gives the same result today. The difference is later: a
layer the statement does not name ranks after `utilities`, so a layer added in a future Cornerstone Components
release would outrank every Tailwind class. One parent layer cannot fall out of step.

## What has been verified

:::info
Checked in a scratch project with Tailwind CSS 4.3.3, the Tailwind CLI, esbuild 0.28.2 and this package at 0.6.2, in
headless Chromium, Firefox and WebKit. Each problem was reproduced first and then shown fixed by the setup above, with
the same numbers in all three browsers.

- **The `@import url()` chain:** Tailwind kept the lines. Placed after Tailwind, every browser dropped them with no
  request and no console message. Placed before it, every browser requested them from the compiled file's folder and
  got 404s. Either way, no `--cs-*` token was set. The flattened file gave the same value for every standard
  property on the test page, in light and dark. The only differences were in how esbuild spaces and quotes a few
  custom property values.
- **Preflight:** `<cs-dropdown-item>` had no padding, and `<cs-divider>` had no line or margins. With the copy, the
  item had 8px by 16px of padding and the divider a 1px line with 16px margins.
- **`--spacing`:** `p-4` came out 96px inside `<cs-card>`, `<cs-dialog>` and `<cs-drawer>`, and 64px inside
  `<cs-details>` and `<cs-accordion-item>`. With the reset it was 16px in all five, and the card kept its 24px padding.
  Without `inline`, `p-4` came out 0. Without `:not(…)`, a divider straight in a card dropped to 4px margins. A custom
  `--spacing` in `@theme` carried through to the reset.
- **Layer order:** both failures above were reproduced. With the statement, Cornerstone Components' heading styles
  and list bullets held, and `text-sm`, `mb-8` and `bg-red-600` all applied. Naming Cornerstone Components' layers
  one by one instead of using `layer(cornerstone)` gave the same value for every property.

**Not yet verified:** Tailwind's Vite and PostCSS plugins. The `url()` handling is in Tailwind's core, but a bundler
can process imports before Tailwind sees them, so check your compiled CSS for any leftover `@import url(` lines.
:::
