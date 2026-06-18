---
description: Guided setup for integrating Cornerstone Design System into your project.
allowed-tools:
  - Read
  - Bash(find:*)
  - Bash(ls:*)
  - Bash(cat:*)
  - Bash(node:*)
  - Bash(npm:*)
---

# Onboard to Cornerstone Design System

Goal: understand the developer's project and produce step-by-step, tailored instructions for integrating `@cruglobal/cornerstone-design-system` — including install, CSS imports, HTML attribute setup, and usage patterns specific to their stack.

Do not assume anything about the project before asking. Be conversational, not bureaucratic — ask the questions below naturally, in one message if possible, and adapt based on what you can already infer from the working directory.

## Step 1 — Inspect the project (no questions yet)

Before asking anything, silently gather context:

- Look for `package.json` in the working directory. Note the framework (React, etc.) and build tool (Vite, webpack, Next.js, Create React App, etc.) from dependencies.
- Look for CSS entry points, `tailwind.config.*`, `vite.config.*`, `webpack.config.*`, or similar config files.
- Check whether `@cruglobal/cornerstone-design-system` is already in `package.json` dependencies.

Use this to pre-fill answers you already know and skip those questions.

**If there is no `package.json`**, don't assume a JS toolchain — this is likely a plain HTML/CSS site or a non-JS project. Ask the developer what kind of project it is, and in Step 3 favor the no-build `<link>` / `@import` integration path over bundler-specific imports.

## Step 2 — Ask what you still need to know

Ask only the questions you could not infer from inspection. Combine them into a single friendly message. The questions are:

1. **Brand**: Is this a Cru app or a FamilyLife (FL) app?
2. **Theme**: Light only, dark only, or does it need to support both (dynamic switching)?
3. **CSS approach**: How is styling applied? (vanilla CSS, CSS Modules, SCSS, styled-components/Emotion, Tailwind utility classes, or something else)
4. **Framework** (if not obvious): React or other?
5. **Build tool** (if not obvious): Vite, webpack, Next.js, or other?

## Step 3 — Produce tailored setup instructions

Based on the answers (and what you already inferred), output a complete, copy-pasteable setup guide. The guide must cover every step in order:

### a. Install

```sh
npm install @cruglobal/cornerstone-design-system
```

### b. Import CSS

Always import `ref.css` first, then the brand+theme file(s). Show the exact import statement for their setup:

- **Vanilla CSS / SCSS (no build)**: `@import` at the top of the main stylesheet
- **Bundler (Vite, webpack, CRA) — React**: `import` in the JS entry point (e.g. `main.jsx`, `main.ts`)
- **Next.js**: `import` in `_app.tsx` or `app/layout.tsx`
- **Tailwind**: add `@import` in the `globals.css` / base stylesheet before `@tailwind` directives

Show the correct file path. Supported mode files:
- `@cruglobal/cornerstone-design-system/css/cru-light.css`
- `@cruglobal/cornerstone-design-system/css/cru-dark.css`
- `@cruglobal/cornerstone-design-system/css/fl-light.css`
- `@cruglobal/cornerstone-design-system/css/fl-dark.css`

If both themes are needed, import both and explain the runtime switching pattern.

### c. Set root attributes

Show where and how to set `data-brand` and `data-theme` on the root element. Tailor to framework:
- **HTML**: `<html data-brand="cru" data-theme="light">`
- **React / Next.js**: `document.documentElement.dataset.brand = 'cru'` or the `<html>` tag in `_document.tsx`

For dynamic theme switching, show a small example of toggling `data-theme` on user action.

### d. Use tokens

Show a short example of a styled component using `--sys-*` CSS custom properties appropriate to their stack:

- **CSS / SCSS / CSS Modules**: `var(--sys-color-primary)`
- **styled-components / Emotion**: `color: var(--sys-color-primary)` inside a template literal
- **Tailwind**: explain that Cornerstone tokens are CSS custom properties and can be referenced in `arbitrary values` (`bg-[var(--sys-color-primary)]`) or configured in `tailwind.config` as `extend.colors`

### e. Icons (always include)

Show the Material Sharp setup:

```html
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

```html
<span class="material-symbols-sharp">home</span>
```

Mention that Cru ministry SVG icons are available at `@cruglobal/cornerstone-design-system/libraries/cru-icons/<name>.svg`.

### f. What NOT to run

Explicitly tell the developer: `/pull-tokens` is a contributor command for syncing tokens from Figma into this repo. They should not run it.

## Step 4 — Offer next steps

After the setup guide, offer three optional follow-ups the developer can ask for:

1. A sample component (button, card, form field) fully styled with Cornerstone tokens for their framework
2. A `/design-review` audit of any existing UI they paste or point to
3. A list of all available `--sys-*` token names for their chosen brand/theme
