# Cornerstone Design System

Design tokens and primitives for Cru Global's Cornerstone design system. Ships CSS custom properties, SCSS variables, ESM/CJS JavaScript, and TypeScript declarations for the **Cru** and **FamilyLife (FL)** brands across light and dark themes.

---

## Using Cornerstone

### 1. Install

```sh
npm install @cruglobal/cornerstone-design-system
```

### 2. Import CSS

Import the baseline ref tokens and the file that matches your brand and theme. Apply `data-brand` and `data-theme` attributes to your root element to activate the right variables.

```html
<!-- HTML root element -->
<html data-brand="cru" data-theme="light">
```

```css
/* CSS or JS entry point */
@import "@cruglobal/cornerstone-design-system/css/ref.css";
@import "@cruglobal/cornerstone-design-system/css/cru-light.css";
```

| Brand | Theme | File |
| --- | --- | --- |
| Cru | Light | `css/cru-light.css` |
| Cru | Dark | `css/cru-dark.css` |
| FamilyLife | Light | `css/fl-light.css` |
| FamilyLife | Dark | `css/fl-dark.css` |

For dynamic theme switching, import all mode files you need and toggle the `data-theme` attribute at runtime.

### 3. Use tokens in CSS

Tokens follow a three-layer naming convention. In most cases, use `sys` (semantic) tokens in your components:

```css
.my-button {
  background-color: var(--sys-color-primary);
  color: var(--sys-color-on-primary);
  border-radius: var(--sys-number-border-radius-medium);
  font-size: var(--sys-number-font-size-body-medium);
}
```

**Token layers:**

| Prefix | Purpose | When to use |
| --- | --- | --- |
| `--ref-*` | Raw primitives (hex colors, unitless values) | Only when building custom `sys` aliases |
| `--sys-*` | Semantic aliases per brand/theme | Primary choice for component styles |
| `--cmp-*` | Component-specific tokens | When styling a specific Cornerstone component |

### 4. JavaScript / TypeScript

Resolved token values are available as named exports for use in JS-based styling (e.g. React Native, runtime style calculations):

```js
// ESM
import { RefColorCruBlue500 } from '@cruglobal/cornerstone-design-system';

// Per-mode tokens
import * as cruLight from '@cruglobal/cornerstone-design-system/js/cru-light';
```

TypeScript declarations are included automatically.

---

## Icons

### Material Sharp

Cornerstone uses the [Material Symbols Sharp](https://fonts.google.com/icons?icon.style=Sharp) icon set. Add the Google Fonts stylesheet to your app:

```html
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

Use icons with the `material-symbols-sharp` class:

```html
<span class="material-symbols-sharp">home</span>
<span class="material-symbols-sharp">arrow_forward</span>
<span class="material-symbols-sharp">favorite</span>
```

Browse the full catalog at [fonts.google.com/icons](https://fonts.google.com/icons?icon.style=Sharp).

### Cru Ministry Icons

Custom Cru ministry topic SVG icons ship with this package under `libraries/cru-icons/`:

```text
node_modules/@cruglobal/cornerstone-design-system/libraries/cru-icons/<icon-name>.svg
```

Reference them in `<img>` tags or inline them as SVG. With a bundler that supports SVG imports (Vite, webpack with file-loader):

```js
import bibleStudyIcon from '@cruglobal/cornerstone-design-system/libraries/cru-icons/bible-study.svg';
```

---

## Get set up faster with Claude Code

If you're using [Claude Code](https://claude.ai/code), Cornerstone ships a plugin with two commands. Install it once:

```sh
/plugin marketplace add CruGlobal/cornerstone-design-system
/plugin install cornerstone@cru
```

Then, from within your project:

- `/onboard` — personalized setup instructions for your framework and build tooling.
- `/design-review` — audit any UI against Cornerstone token standards, Nielsen's usability heuristics, and WCAG 2.2 AA.

> **Note:** `/pull-tokens` is an internal command for syncing tokens from Figma into this repository. It is not part of the consumer plugin.

---

## Contributing to Cornerstone

The following sections are for contributors to this repository.

### Prerequisites

The `/pull-tokens` command syncs design tokens from the Figma source file and requires the Figma plugin for Claude Code.

1. Run `/plugins` in Claude Code to open the plugin marketplace
2. Search for **Figma** and install it
3. Authenticate with your Figma account when prompted
4. Restart Claude Code

### Commands

```sh
npm run validate       # lint the token tree (exits 1 on any error)
npm run build          # compile tokens → build/ via Style Dictionary
npm run version        # consume changesets → bump package.json + write CHANGELOG.md
npm run release        # publish to npm (runs automatically via release.yml)
npx changeset          # interactively add a changeset before merging a PR
npx changeset status   # preview what the next version bump would be
```

`build/` is gitignored. Built artifacts live only in the published npm package.

### Token architecture

Tokens are organized in three layers with strict aliasing rules:

```text
tokens/
  ref.json          # _ref.*  — raw primitives
  sys/
    cru-light.json  # _sys.*  — semantic aliases per brand × theme
    cru-dark.json
    fl-light.json
    fl-dark.json
  cmp/
    *.json          # _cmp.*  — component-level aliases
```

All files use [W3C DTCG](https://design-tokens.github.io/community-group/format/) format (`$type` / `$value`). See `CLAUDE.md` for full details on aliasing rules, the build pipeline, and changeset conventions.
