# CLAUDE.md

Cornerstone — Cru-internal Lit-based web component library (`@cruglobal/cornerstone-components`). One package in the `cornerstone-design-system` workspace, alongside `packages/tokens`, `packages/docs` and `packages/build-tools`. A hard fork of Web Awesome taken over deliberately rather than adopted. The repo root has its own `CLAUDE.md` for workspace-wide concerns.

## Commands

```bash
npm start                  # Rebuild the library on change (watch mode)
npm run start:docs         # Docs site dev server (Astro, localhost:4321)
npm run build              # Production build (esbuild)
npm test                   # Run all component tests (web-test-runner)
npm run test:component -- --watch --group button  # Watch single component tests
npm run create             # Create new component (interactive Plop prompt)
npm run verify             # prettier + build + test (full check)
npm run check-types        # TypeScript type checking
npm run prettier:fix       # Format code
```

## Component Anatomy

Each component lives in `src/components/<name>/` with three files:

- `<name>.ts` — Component class (Lit web component)
- `<name>.styles.ts` — Styles using Lit `css` tagged template
- `<name>.test.ts` — Tests (web-test-runner + @open-wc/testing)

Create new components with `npm run create` (Plop templates in `scripts/plop/`). It prompts for the tag name,
which must start with `cs-`, and writes four files: the three above plus a docs page.

## Base Classes

**Never extend `LitElement` directly.** Use these base classes from `src/internal/`:

- **`CornerstoneElement`** (`cornerstone-element.ts`) — Base for all components. Use `static css` (not Lit's `static styles`) — host styles are auto-prepended. Supports SSR, ElementInternals, custom states.
- **`CornerstoneFormAssociatedElement`** (`cornerstone-form-associated-element.ts`) — For form controls. Adds form association, constraint validation, `ElementInternals`. Override `static get validators()` to return an array of validation rules.

## Decorators & Reactivity

- `@customElement('cs-name')` — Registers the custom element.
- `@property({ reflect: true })` — Reactive public property, reflects to HTML attribute.
- `@state()` — Reactive internal state (no attribute reflection).
- `@query('.selector')` — Cached shadow DOM query.
- `@watch('propertyName')` — Runs handler when a property changes. Use `{ waitUntilFirstUpdate: true }` to skip the initial value.

## Controllers

Instantiate in the class body (not constructor):

- `HasSlotController(this, 'slot-name')` — Tracks whether named slots have content. Used for conditional rendering.
- `LocalizeController(this)` — i18n/l10n for component strings. Translations in `src/translations/`.

## Code Conventions

The published [contributing guide](../docs/src/content/docs/resources/contributing.md) is the canonical convention doc (component structure, BEM class names, `with-*`/`without-*` boolean props, event naming). The rules below are the mechanical ones most often gotten wrong:

- Event handler parameters are named `event`, not `e`. Read from it directly (`event.key`, `event.target`, `event.preventDefault()`).
- Event handlers are named `handle<Subject>` (`handleInput`, `handleClearClick`), not `onX`.
- Relative imports end in `.js` (NodeNext ESM), e.g. `import styles from './button.styles.js'`.
- Custom events are one class per file in `src/events/`: `class Wa<Name>Event extends Event`, dispatched via `super('cs-<kebab>', { bubbles, cancelable, composed: true })`, augmenting `GlobalEventHandlersEventMap`. Fire them with `this.dispatchEvent(new Wa<Name>Event(...))`. There is no `emit()` helper.
- Multi-word properties declare an explicit kebab `attribute:`. Lit lowercases attribute names, so `passwordToggle` needs `attribute: 'password-toggle'`.

## Style Conventions

- Export default `css` tagged template literal from `component.styles.ts`.
- Wrap component styles in `@layer cs-component { ... }`.
- Use CSS custom properties with `--cs-*` prefix.
- Import shared styles: `variantStyles` (`brand` `neutral` `success` `warning` `danger` `information` `highlight`), `sizeStyles` (`xs` `s` `m` `l` `xl`) from `src/styles/component/`.
- Combine via `static css = [styles, variantStyles, sizeStyles]`.
- Style host states via `:host(:state(loading))`, variants via `:host([variant='brand'])`.

## JSDoc Requirements (Critical)

Every component class **must** have these JSDoc tags — they drive Custom Elements Manifest (CEM) generation and documentation:

```
@summary       — One-line description
@documentation — URL to docs page. `npm run create` fills this in from `build-tools/site-url.js`, the one
               place the docs address is written down; don't hand-write a domain.
@status        — stable | experimental | deprecated
@since         — Version number (e.g., 1.0)
@dependency    — Each cs-* sub-component used (one tag per dependency)
@slot          — Each slot (use `@slot -` for the default slot)
@event         — Each custom event emitted (e.g., `cs-change`)
@csspart       — Each shadow DOM part exposed
@cssstate      — Each CSS custom state (e.g., disabled, loading)
@cssproperty   — Each CSS custom property exposed
```

Missing tags will cause missing documentation and incomplete CEM output.

## Testing

- **Framework**: `@open-wc/testing` with `web-test-runner` (Playwright: Chromium, Firefox, WebKit).
- **Fixture**: Import `{ fixtures }` from `src/internal/test/fixture.js` — an array of CSR/SSR-aware fixture functions (`clientFixture`, `hydratedFixture`). For simple CSR-only tests, `fixture` from `@open-wc/testing` also works.
- **Accessibility**: `await expect(el).to.be.accessible();`
- **Form controls**: `runFormControlBaseTests({ tagName: 'cs-input', formValue: { dirtyValue: 'x' } })` from `src/internal/test/form-control-base-tests.js` — validity **and** reset. Pass `formValue` or reset goes untested: `property: 'checked'` for boolean controls (the dirty value is derived), `dirtyValue` for everything else. Use `init` when the value must match a child, as `cs-select` does with its options. Omit `formValue` only when the control owns no value — `cs-button`, `cs-radio` — which records that rather than hiding it.
- **Spies/stubs**: Sinon. **Async helpers**: `aTimeout(ms)`, `waitUntil(() => condition)`.
- **Run single component**: `npm run test:component -- --watch --group <name>` (group = component name without `cs-` prefix).
- **Stop `npm start` before `npm run build` or the full suite.** Both write `dist/`, so a concurrent build reads a half-written file and a concurrent test run times out.
- **A component change does not reach the tests until you build.** `web-test-runner.config.js`'s `testRunnerHtml` imports every component from `/dist/bundled/`; esbuild compiles only the `.test.ts` file from source. So editing a component and re-running its group tests the _previous_ build — silently, with no error. Run `npm run build` first, or use `npm run verify`, which builds before testing. Editing only the test file needs no build.
- **A mass failure is usually load, not a regression.** The runner fills the machine on purpose, so a busy one crosses the 3000ms timeout and cascades — dozens of failures concentrated in one heavy component on one engine, all passing in isolation. Two causes seen: a watcher running alongside, and simply a loaded machine. Confirm with **`WTR_CONCURRENCY=1 npm test`**, which is serial, ~2.4× slower, and reliable — `--concurrency` is a no-op, see the comment in `web-test-runner.config.js`. Only failures that survive that are real.
- **Read the totals, not just the failure count — WebKit drops tests without failing them.** A distinct problem from the one above, and **serial running does not fix it**: near the end of a full run WebKit stops being able to open pages at all, reporting `The browser was unable to create and start a test page after 30000ms` / `page.goto: Timeout 30000ms exceeded`. Those are session-start errors, not assertions, so they are counted **nowhere** — the summary reads `0 failed` while WebKit's passed total sits ~400 short of Chromium's and `web-test-runner` exits 1 with a bare "Error while running tests." Reproduced twice serially: 7 sessions lost, always the tail of the alphabet (`tooltip`, `tree`, `tree-item`, `zoomable-frame`), all 266 of their tests passing when run as single groups. So compare the three engines' passed counts against each other before believing a green run, and treat an exit-1-with-0-failures as this until proven otherwise. Not yet diagnosed or ticketed; `browserStartTimeout` is the first knob to try.

## Build System

Custom esbuild-based build (`scripts/build.js`). Generates:

- `dist/unbundled/` — the **unbundled build**: ES modules that keep dependencies as bare specifiers, plus TypeScript declarations. What `exports` points at, so `@cruglobal/cornerstone-components/components/button/button.js` resolves here.
- `dist/bundled/` — the **bundled build**: dependencies inlined, loadable in a browser without a bundler. Reached through the `bundled/` specifier. Also where every build step writes first; `dist/unbundled/` is a copy of it with unbundled JS written over the top.
- Custom Elements Manifest (`custom-elements.json`)
- React wrappers (`src/react/`)
- Agent skills (`dist/unbundled/skills/cornerstone/`, `.../cornerstone-design/`) and `llms.txt` — AI-ready
  docs. Generated from `../docs/src/content/docs/` plus the CEM, so the skill and the site cannot
  disagree. Also copied to `dist/bundled/skills/` and `.claude/skills/` (gitignored) so agents working
  in this repo load exactly what the package publishes.

Import specifiers do not contain `dist`: it is a container for the two builds, not part of the public API.

## Key Directories

- `src/components/` — All components
- `src/internal/` — Base classes, decorators (`watch.ts`), controllers (`slot.ts`), validators
- `src/styles/` — Shared styles, themes, color palettes, CSS utilities
- `src/events/` — Custom event class definitions
- `src/translations/` — i18n message files (30+ locales)
- `packages/docs/` (a sibling package) — Documentation site (Astro + Starlight). `src/content/docs/` is the page source, and the
  agent skills and `llms.txt` are generated from it.

## Common Tasks

- **New component**: Run `npm run create`, enter `cs-component-name`. Generates three files in `src/components/<name>/` plus a docs page. Add JSDoc tags (see above), implement `render()`, add styles.
- **Add a property**: `@property({ reflect: true }) propName: Type = default;` — use `reflect: true` if it should be settable via HTML attribute.
- **Add a slot**: Add `<slot name="name"></slot>` in `render()`, add `@slot name` JSDoc tag, optionally track with `HasSlotController`.
- **Add a CSS part**: Add `part="name"` to element in `render()`, add `@csspart name` JSDoc tag.
- **Add a custom event**: Create event class in `src/events/`, dispatch with `this.dispatchEvent(new CsEventClass())`, add `@event cs-event-name` JSDoc tag.
- **Add a test**: Import `{ fixtures }` from `src/internal/test/fixture.js`, loop `for (const fixture of fixtures)`, use `await fixture<Type>(html`...`)`.
- **Doc page**: Create `../docs/src/content/docs/components/name.md` with front matter (`title`, `description`, `category`). Use ` ```html {.example} ` for live code blocks. The API reference is appended from the CEM by `remark-component-api`, so don't hand-write it.
- **Update the changelog**: Add entries to the "Unreleased" section in `../docs/src/content/docs/resources/changelog.md`. Create the section if it doesn't exist. Group entries under `:::added`, `:::fixed`, `:::changed`, `:::deprecated`, `:::removed`, `:::breaking` containers in that order; omit any category with no entries. **Keep entries clear and succinct** — announce what changed at a glance, trim redundant prose, and nest closely related additions as sub-bullets so the parent reads as a topic and children carry the detail.
