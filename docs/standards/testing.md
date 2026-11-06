# Testing — Focus Areas

A generic baseline, followed by this repo's test conventions; keep both.

Applies to every diff.

**Prefer pure-function unit tests**

- Business and domain logic should be extracted out of UI/handler code into plain functions and
  tested directly, rather than asserted through a rendered surface or an HTTP round trip
- Look for: new logic that is only reachable through a component or endpoint, with no seam to test

**Use the repo's existing test framework and idioms**

- Match the repo's test runner, assertion style, mocking helpers, and import conventions. Do not
  assume a framework, rendering harness, or helper library that the repo does not already depend on
- Look for: tests introducing a second runner or harness; imports of libraries absent from the
  manifest

**Mock at module/external boundaries**

- External services (databases, third-party APIs, mail, payments, LLMs) are mocked at the module
  boundary, not by patching global network primitives ad hoc
- Look for: real network or filesystem access in unit tests; mocks that drift from the real
  signature; over-mocking that leaves the logic under test unexercised

**Determinism**

- Time-dependent logic uses the runner's fake-timer/clock control rather than real system time.
  Random values are seeded or injected
- Look for: tests that depend on the current date, timezone, ordering of a map/set, or on another
  test having run first

**Coverage of the shape of the input**

- Every new test should exercise: empty, zero / one / many, boundary values, and at least one happy
  path
- Look for: tests that only assert the happy path; parameters whose invalid values are never tested

**Error paths**

- Validation rejections, rejected promises, timeouts, and the failure branches of domain functions
  are tested, not just success
- Look for: `catch` branches with no covering test

**Test placement and naming**

- Follow the repo's convention for where tests live and how they're named
- Test names describe the behavior asserted, not the function name alone

**Quality gates**

- The repo's test, type-check, lint, and format commands must all pass
- Look for: skipped or `.only` tests left behind; loosely-typed mocks that defeat type checking;
  assertions that can never fail (e.g. asserting on the mock's own return)

## Cornerstone — Repo-Specific Focus Areas

`@open-wc/testing` on `web-test-runner`, driving Chromium, Firefox and WebKit through Playwright, in two
render modes: client-rendered and server-rendered-then-hydrated. One component:
`npm run test:component -- --watch --group <name>` (the name without `cs-`). The suite:
`npm test --workspace @cruglobal/cornerstone-components`. The whole gate: `npm run verify`.

**Build before you test.** `web-test-runner.config.js` imports every component from `dist/`, so a component
edit is not under test until `npm run build` runs. A PR body that says "tests pass" after editing a component
and running only the group has tested the previous build.

**The fixtures loop is the contract**

- Tests iterate `for (const fixture of fixtures)` from `src/internal/test/fixture.js` so every assertion runs
  in both render modes. A test outside the loop is client-only; say so in its name or move it in.
- **A branch that returns early under `fixture.type === 'ssr-client-hydrated'` passes while asserting
  nothing.** UIUX-119 tracks the ones still in the suite. Flag any new one as a blocker; an existing one the
  PR touches is fixed or gets its reason recorded in the test.
- Form controls call `runFormControlBaseTests({ tagName, formValue })` from
  `src/internal/test/form-control-base-tests.js`. Omitting `formValue` leaves reset untested; it is omitted
  only for controls that own no value (`cs-button`, `cs-radio`).

**Accessibility assertions**

- Every component with an interactive surface asserts `await expect(el).to.be.accessible()` per fixture type
  and per variant (`button.test.ts` is the model). axe sees only the rendered DOM: open the popup, dialog or
  drawer before asserting. An `ignoredRules` list (as `cs-breadcrumb` passes for `color-contrast`) carries
  a comment saying why.

**Tests that cannot fail, in this runner's idiom**

- Asserting a reflected attribute without `await el.updateComplete` first.
- `aTimeout(1)` as the synchronisation point for an animation or event.
- A sinon spy created and never asserted, or an event awaited only through `waitForEvent` from
  `src/internal/event.js`, which resolves on a 5 s timeout and so cannot fail on a missing event.
- A fixture that is the same markup as its expectation.

**Wait for the event, not the clock**

`src/internal/test/` holds the deterministic replacements for a fixed wait. `finishAnimations` and
`settleAnimations` (`finish-animations.ts`) jump every finite animation, shadow roots included, to its end;
`useFakeFrameClock` (`fake-frame-clock.ts`) fakes `requestAnimationFrame` and `performance.now()` for a frame
loop such as `cs-toast-item`'s countdown; `expectAnimationDuration` and `expectNoMotion`
(`expect-animation-duration.ts`) assert a duration and a reduced-motion path; `expectEvent`
(`expect-event.ts`) asserts that an action fires an event. Look for: a new `aTimeout(n)` or `setTimeout`
that waits for an animation, a frame or an event when one of these fits. A "should not close" assertion
after a fixed sleep cannot fail (#235).

**Reading a run**

- A mass failure concentrated in one heavy component on one engine is load, not a regression; confirm with
  `WTR_CONCURRENCY=1 npm test`.
- WebKit drops tests without failing them near the end of a long run: compare the three engines' passed
  totals, and treat exit 1 with 0 failures as this until proven otherwise.

**The check scripts are tests too**

`test:parts` (`check-css-parts.js`), `test:properties` (`check-css-properties.js`), `test:base-path`,
`test:docs-url`, `verify:skills` and `lint:ast-grep` (whose `ast-grep test` runs `ast-grep/rule-tests/`
first) in `packages/components`; `check:assets`, `check:pages` (with `test:displayed-source`, for the code
it skips), `check:tokens`, `check:components`, `check:anatomy`, `check:contrast`, `check:variants`,
`check:a11y` (with `test:a11y`, which proves it can fail), `test:inspiration` and `check:markdown-remark`
(run before every build) in `packages/docs`; and `npm test` in `packages/build-tools` are the repo's
deterministic gates. A change to what one guards updates the script in the same PR; a narrowed regex or an
added exemption is a finding until justified.

The scripts' own tests use `node:test` and `node:assert/strict` under `node --test`, not the browser
runner. A check that guards a new failure gets a fixture and a case proving it fails, as
`check-a11y.test.js` runs `check-a11y.js --screens` against `scripts/fixtures/check-a11y/` and
`inspiration.test.js` builds a throwaway library with `tempLibrary`. Fixtures are never built into the site.

**Hygiene.** Each test declares its own hand-crafted fixture. Tests do not log.

---

## Mined from merged PR history

Rules derived from 96 merged PRs: #49–#169 (October 2026) and #228–#329 (November 2026). Each carries
the PRs it came from.

- **A change to test infrastructure or an internal helper ships with a test.** `src/internal/*.ts` helpers
  and the selection logic in `web-test-runner.config.js` have a dozen call sites each; `waitForEvent` gained
  a resolve-on-timeout with no `event.test.ts`, and `WTR_SHARD` round-robin selection was verified by a
  hand-run table nothing re-runs. A guard with no test and no comment is a reason to stop and add the test
  first, not to delete it: the first draft of #113 removed `cs-accordion-item`'s `animationGeneration` guard
  as "the bug", and the existing rapid-toggling test failed on all three engines.
  <!-- evidence: PR #113, #114 -->
- **A built-output check asserts the invariant, not an allowlist of today's layout.**
  `check-asset-paths.js` passed on every run while navigation was broken, because it listed the
  directories it believed were "ours" instead of asserting that every single-leading-slash reference sits
  under the base path. Reject a diff that narrows such a regex to named paths, and require the script's
  PASSED line to name what it actually checked.
  <!-- evidence: PR #97, #98, #100 -->

- **A new test or check is shown failing first.** A fix, a new test or a new check shows in its PR body the
  new case failing on `main` (or with the fix reverted, or on the rejected alternative) and passing on the
  branch, with per-engine counts for component tests. A guard shown only green may be unable to fail, and
  this repo has shipped several that were.
  <!-- evidence: PR #247, #250, #251, #253, #256, #257, #260, #261, #262, #274, #277, #279, #280, #296, #304, #324 -->
- **One axe pass per `it()`.** Inside the `fixtures` loop, generate one `it()` per variant for
  `to.be.accessible()`, the shape `button.test.ts` and `badge.test.ts` use. A single `it()` that renders,
  hydrates and runs axe for every variant shares one 5000 ms timeout: #275 passed CI once with seven
  variants in one test, then timed out on all three engines on an unrelated PR. Raising the timeout in
  `web-test-runner.config.js` is not the fix.
  <!-- evidence: PR #275, #280 -->
- **A check script cannot exit 0 while its claim is false.** In `packages/docs/scripts/check-*.js`, a scan for
  leftover markup runs over `withoutCode()` or `withoutDisplayedSource()`, never `html.includes()` over the
  whole page (a changeset naming `:::` in backticks broke `main`, #296). A missing input fails rather than
  warns, and the script sets `process.exitCode = 1` under CI. Every failure branch the header promises has a
  fixture under `scripts/fixtures/<check>/`; an unreachable branch is deleted. Look for: guessing from
  markup shape instead of the rendered result, a timer not reset after a scheme switch, a number matched
  anywhere on the page instead of in its row.
  <!-- evidence: PR #257, #260, #277, #296 -->
- **Test value lists follow the component's union.** When a diff adds a value to a public union (variant,
  size, appearance) or to the shared colour roles in `variants.styles.ts`, every consuming component's
  `*.test.ts` value array names it, in the union's order. `check:variants` covers docs examples only, so
  nothing else catches a test that still walks five of seven roles.
  <!-- evidence: PR #274, #275 -->
