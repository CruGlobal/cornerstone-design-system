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

## Claude Code plugins

If you're using [Claude Code](https://claude.ai/code), Cornerstone ships its tooling as four plugins in one marketplace, split by audience. Add the marketplace once, then install the single tier that matches what you do:

```sh
/plugin marketplace add CruGlobal/cornerstone-design-system

/plugin install cornerstone@cru            # you use Cornerstone in a product
/plugin install cornerstone-designer@cru   # you design with Cornerstone in Figma
/plugin install cornerstone-dev@cru        # you work on Cornerstone itself
```

Install one, not several. Each tier declares the plugins it needs, and Claude Code installs that whole dependency closure for you — so `cornerstone-dev` gets you `cornerstone` as well, and a dependency it can't resolve disables the tier rather than half-loading it.

| Tier | Install it if you | What it adds | Pulls in |
| --- | --- | --- | --- |
| `cornerstone` | use Cornerstone tokens in a product | **Daniel**, the front-door persona, plus the `/onboard` setup walkthrough | nothing |
| `cornerstone-designer` | design with Cornerstone and don't write code | a Figma-only prototyping skill — compose existing components and see the idea, never emit code | `cornerstone`, `figma` |
| `cornerstone-dev` | contribute to this repository | the four contributor personas: **Joseph** (components), **Sarah** (tokens, theming, Figma sync), **Esther** (accessibility), **Anna** (docs and stories) | `cornerstone`, `cornerstone-skills`, `figma` |
| `cornerstone-skills` | — nothing; it arrives as a dependency | the general engineering and productivity skills the contributor personas reach for, forked from [mattpocock/skills](https://github.com/mattpocock/skills) under MIT ([NOTICE](https://github.com/CruGlobal/cornerstone-design-system/blob/main/plugins/cornerstone-skills/NOTICE.md)) | nothing |

The tiers are plugins rather than a checklist of things to install by hand, and that is the whole point of them ([#67](https://github.com/CruGlobal/cornerstone-design-system/issues/67)): a written list of what a designer or a contributor "should have" drifts away from what anyone actually runs, and a list that *is* the install cannot. The four manifests at `plugins/*/.claude-plugin/plugin.json` are the source of truth for the table above — where they disagree with it, they're right and the table is stale. #67 intends that table to be *generated* from those manifests for exactly this reason; **generation is not built yet, so the table above is hand-maintained and can drift.** Only its "Pulls in" column is checkable against the manifests today, since `dependencies` is the one thing they declare — no manifest lists its own agents, commands or skills, so "What it adds" has nothing to be generated from until they do.

Each dependency is there for a reason worth stating:

- Both non-base tiers need **`figma`**, for different reasons. `cornerstone-designer` needs it because `see-it-in-figma` builds *in* Figma through `use_figma`, which requires the `figma:figma-use` skill first. `cornerstone-dev` needs it because `/pull-tokens` reads variable collections through the same tool, and because Joseph's design-to-code and motion paths carry the same mandatory pairing. A designer never runs `/pull-tokens` — it's a contributor command in this repo, not in any plugin — so it isn't the reason their tier carries the dependency.
- `cornerstone-dev` needs **`cornerstone-skills`** because the contributor personas name those skills in their own instructions; with the plugin missing, the pointers lead nowhere.
- Both need **`cornerstone`**, because it carries Daniel — the persona that routes a request to the right specialist in the first place.

`figma` lives in Anthropic's official marketplace rather than Cru's, which is why `.claude-plugin/marketplace.json` carries `allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]`. Cross-marketplace dependencies are refused outright without it, and only the allowlist of the marketplace you installed from is consulted — trust doesn't pass through a chain of dependencies.

You never type a persona's name. They're subagents, and Claude routes to one by matching your request against its description, the same way it picks any other subagent. Daniel, Sarah and Joseph pin an Opus floor because their work is judgment-heavy — routing, hand-authoring primitives, writing component code; Esther and Anna inherit whatever model your session is running.

### Check your own agent names before installing

Cornerstone's personas are called Daniel, Joseph, Sarah, Esther and Anna. Those are ordinary first names, so they can collide with agents you already have. Before installing, check your own agent files for the same five names — the `name:` in an agent's frontmatter is what counts, not the filename, and Claude Code skips a `.claude/agents/*.md` file that has no `name:` at all:

```sh
grep -rilE '^name:[[:space:]]*(daniel|joseph|sarah|esther|anna)[[:space:]]*$' \
  .claude/agents ~/.claude/agents 2>/dev/null
```

A hit means your agent wins and Cornerstone's is gone. Plugin agents are **not** namespaced, and Claude Code resolves agents by walking its sources in order — built-in, then plugin, then user settings, then project settings — into a single map keyed on the agent's name. Your own `sarah` is applied after the plugin's, so it evicts it: only one `sarah` loads, and it's yours. The shadowing is silent, because the duplicate-name warning only compares agents that came from the same source, so a cross-source collision is never reported. You get no error, no warning, and no indication that the plugin's version was replaced. (Verified against Claude Code 2.1.x.)

If you find one, rename yours before installing. There is no namespaced name to fall back on, so renaming is the whole remedy.

> **Note:** `/pull-tokens` syncs tokens from Figma into this repository. It's a contributor command living in this repo's own `.claude/commands/`, not in any plugin, so it isn't something a consumer installs or runs. `/design-review` still ships in the `cornerstone` plugin but is deprecated ([#75](https://github.com/CruGlobal/cornerstone-design-system/issues/75)) — left in place rather than deleted, and it won't be replaced by another command or skill. Its token-compliance and accessibility passes are handled by separately ticketed deterministic CI checks instead of a review pass driven by a model.

---

## Contributing to Cornerstone

The following sections are for contributors to this repository.

### Prerequisites

Install the `cornerstone-dev` tier (see [Claude Code plugins](#claude-code-plugins) above). It pulls in the Figma plugin for Claude Code, which `/pull-tokens` needs because the sync reads variable collections through Figma's `use_figma` MCP tool rather than a REST endpoint.

Two steps stay yours after the install:

1. Authenticate with your Figma account when prompted
2. Restart Claude Code

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
