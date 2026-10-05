# Architecture — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Layering & boundaries**

- Business logic lives in testable modules, not inline in entry points (route/page/controller/CLI
  handlers). Entry points compose and delegate
- Server-only code stays out of code paths that ship to a client or untrusted runtime
- Look for: domain math embedded in view code; a module reaching across layers it shouldn't know
  about; new circular dependencies

**Placement & structure**

- New files land where the existing convention says they belong; shared code goes to the shared
  location only when it is genuinely used by more than one feature
- Look for: one-off code dropped into a "shared"/"common"/"utils" bucket; parallel structures that
  duplicate an existing module instead of extending it; new top-level directories

**Pattern consistency**

- The change should look like the code around it. Deviating is fine when the existing pattern is
  what's being fixed — but then it should be fixed consistently, not forked
- Look for: a second way of doing something the codebase already does one way (data fetching, error
  handling, configuration, logging); framework features reimplemented by hand

**State & data flow**

- Cached/derived state has a clear owner, and writes invalidate or update what they affect
- Look for: the same state maintained in two places; refetching in an effect what a cache already
  owns; values threaded through three or more layers that would be better read closer to use

**Effects & lifecycle**

- Look for: effects whose dependency list omits referenced values (stale closures); work in an
  effect that belongs in an event handler or a derived value; subscriptions and timers without
  cleanup

**Concurrency & performance shape**

- Look for: sequential awaits on independent work that could run concurrently; N+1 query patterns;
  unbounded loops over remote calls; work done per-item that could be batched

**Error handling & resilience**

- Look for: swallowed errors (empty catch, error logged and ignored); failures that leave state
  half-written; missing error/loading boundaries on user-facing surfaces; retries without backoff or
  idempotency

**Technical debt**

- Weigh debt added against debt removed. A refactor that only moves code without improving clarity
  is neutral, not positive. When a convention is ambiguous, raise it as a question rather than a
  blocking finding

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## Cornerstone — Repo-Specific Focus Areas

An npm workspace of four packages: `packages/tokens` (Style Dictionary 5 over DTCG JSON, published),
`packages/components` (70 Lit 3 web components, published; a hard fork of Web Awesome at a fixed fork point
recorded in `NOTICE`), `packages/docs` (Astro/Starlight, deployed to Pages, never published) and
`packages/build-tools` (shared, private). No server, no database. The canonical conventions are
`packages/docs/src/content/docs/resources/contributing.md` and `packages/components/CLAUDE.md`; point at
them rather than restating them.

**The base classes and what they settle**

- Every component extends `CornerstoneElement` or, for form controls, `CornerstoneFormAssociatedElement`
  (`packages/components/src/internal/`). Never `LitElement` directly. Styles go on `static css`; the base
  class prepends host styles and exposes the result as `static styles`. A component declaring
  `static styles` itself silently loses the host styles.
- Controllers are instantiated in the class body: `HasSlotController`, `LocalizeController`. Reactive props
  use `@property`, internal state `@state`, cached shadow queries `@query`, change handlers `@watch`.
- Form controls override `static get validators()` and compose `MirrorValidator`, `RequiredValidator`,
  `CustomErrorValidator` from `src/internal/validators/`.

**Reach for these before writing a new one**

`src/internal/` already holds `dismissible-stack` (Escape coordination across open overlays), `scroll`
(scroll lock), `animate`, `drag`, `debounce`, `live-announcer`, `offset`, `parse`, `math` (`clamp`,
`uniqueId`), `event` (`waitForEvent`), `segmented-field/` (pickers), `rendered-watcher`, `default-value`,
`submit-on-enter` and `active-elements`. `src/utilities/` holds the public helpers: `animation` (the
registry), `base-path`, `form`, `localize`, `autoloader`, `ssr-hydration`, `clone`, `defined`.
Look for: a new helper duplicating one of these; a helper added to `src/utilities/` (exported, public API)
that belongs in `src/internal/` (not exported).

**Placement**

- A component is `src/components/<name>/<name>.ts`, `.styles.ts` and `.test.ts`, created by
  `npm run create`, which also writes the docs page and derives `@documentation` from
  `build-tools/site-url.js`.
- Events are one class per file in `src/events/`: `class Cs<Name>Event extends Event`, dispatched with
  `bubbles` and `composed: true`, augmenting `GlobalEventHandlersEventMap`. There is no `emit()` helper.
- Shared styles live in `src/styles/component/` (`size`, `variants`, `form-control`, `host`,
  `visually-hidden`). A component imports them into `static css`; it does not copy their declarations.
- The docs site reads the library's Custom Elements Manifest and copies its bundled build; it never reaches
  into `src/`. `packages/build-tools/` is what both share, and `build-tools/site-url.js` is the one source
  of the site's address.

**SSR is a first-class render path**

- Browser APIs (`document`, `window`, `ResizeObserver`, `MutationObserver`) are guarded with `isServer` in
  constructors, field initializers, `connectedCallback()` and module scope, and never shimmed on
  `globalThis`.
- A slot gated by `HasSlotController` in `render()` exposes a `with-*` attribute and uses the controller's
  own guard, `this.hasSlotController.test('label', 'withLabel')`. Never hand-roll the `hasUpdated` check.
- Never conditionally render a `<slot>`; use `hidden` so `slotchange` still fires.
- An overlay that closes on Escape registers with `dismissible-stack`, or every open overlay closes at once.

**Values are load-bearing and their reasons are unwritten**

The library arrived in one commit, already built. `cs-tag`'s height is
`calc(var(--cs-form-control-height) * 0.8)` and `cs-select` pads a tag-bearing combobox by `0.1` above and
below so the three sum to one; neither file names the other and no test asserts it. A change to a literal
is finished when every other reader of that value is named: grep for the constant, for the token it derives
from, and for the component that composes yours. Assume more pairs exist than you have found.

**One library, not seventy**

A fix that should apply to every component is a cross-cutting policy (`packages/components/CONTEXT.md`);
raise it rather than fixing one component in a way that forks the pattern. `size` sets one `font-size` on
the host and everything inside is `em`; radius and border width are `rem`. A per-component dimension token
or a `px` dimension inside a component breaks both.

**Status decides how far an API can move**

`@status stable | experimental | deprecated` is on every component. Check it before changing a public
surface, and see `rules/api-surface.md` for what counts as one.

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from.

- **A package declares what it uses.** Every binary a package's scripts run and every workspace package its
  source imports appears in that package's own `package.json`; "it ran locally" is not evidence, because
  npm hoisting decides which copy resolves. `packages/docs` resolved the root's Prettier 2 in CI after never
  declaring Prettier, and read the component manifest with no declared dependency on the library.
  <!-- evidence: PR #94, #98 -->
