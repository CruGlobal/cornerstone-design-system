# @cruglobal/cornerstone-components

## 0.1.2

### Patch Changes

- [#113](https://github.com/CruGlobal/cornerstone-design-system/pull/113) [`e69a1a9`](https://github.com/CruGlobal/cornerstone-design-system/commit/e69a1a93ec30066de386946aff26492b61c3dd64) Thanks [@rguinee](https://github.com/rguinee)! - Stop `waitForEvent` waiting forever.

  Every `show()`, `hide()`, `expand()` and `collapse()` in the library resolves on a completion event that is
  dispatched at the end of an animation — and a browser is entitled not to finish an animation. WebKit
  throttles them on a backgrounded page, and `scrollend`, which `<cs-carousel>` waits on, is not guaranteed at
  all. With no timeout the promise never settles, so the caller's `await` hangs for the life of the page
  instead of failing, and nothing logs a word. That is the shape CI hit on WebKit in run #220:
  `cs-accordion-after-collapse` fired zero times because `await item.collapse()` never returned.

  `waitForEvent` now takes a timeout, defaulting to five seconds, and **resolves** on it rather than
  rejecting — every caller is a state transition whose state has already changed by the time the animation
  runs, so the event only reports that it settled. Rejecting would turn a cosmetic stall into an unhandled
  rejection in eight components. It reaches 14 call sites.

  `<cs-accordion-item>`'s generation guard is unchanged and now carries a comment saying why: a superseded
  transition deliberately does not emit a completion event, because a consumer must not see a collapse that
  never happened. `rapid toggling > should only fire the final after event when the animation is interrupted`
  holds that line, and the cost — a superseded caller's promise going unsettled — is what the timeout above
  bounds.

  This does not on its own fix the WebKit failure. That test asserts inside a one-second window, and the
  backstop is deliberately far longer, because it is insurance against a wedged promise rather than a timing
  mechanism. Sharding the suite is the change that addresses the load.

- [#114](https://github.com/CruGlobal/cornerstone-design-system/pull/114) [`69cf9e1`](https://github.com/CruGlobal/cornerstone-design-system/commit/69cf9e14d986c8015f229fd6667b07ae2b87398f) Thanks [@rguinee](https://github.com/rguinee)! - **Tooling only — nothing that ships changes.** The component test suite is sharded across four CI runners
  and Playwright's browsers are cached, cutting the gate from ~29 minutes to ~10.

  `npm run verify` is now `verify:static && test` so the two halves can run as separate jobs, and
  `WTR_SHARD=2/4` selects a quarter of the test files. Unset, `npm test` behaves exactly as before.

## 0.1.1

### Patch Changes

- [#112](https://github.com/CruGlobal/cornerstone-design-system/pull/112) [`95f69fb`](https://github.com/CruGlobal/cornerstone-design-system/commit/95f69fb08aa58918da618ab70a631c19ac16b99c) Thanks [@rguinee](https://github.com/rguinee)! - Delete the root `.npmrc`, which made every first publish in this workspace impossible.

  One line — `provenance=true` — added in `2e7bfc3` to "enable provenance for npm trusted publishing". It did
  not do that. npm attaches a provenance attestation to a trusted-publishing release on its own; the config
  exists to turn that behaviour _off_. What the line did instead was apply to every package in the workspace
  and make `npm publish` refuse to run outside a CI runner:

  ```
  npm error code EUSAGE
  npm error Automatic provenance generation not supported for provider: null
  ```

  That is not a corner case. npm only lets a trusted publisher be configured for a package that already
  exists, so **every** package's first version has to be published by hand — and this file guaranteed that
  every one of them would fail, with an error naming neither the file nor the setting. It caught
  `@cruglobal/cornerstone-components` at exactly that step. Removing the flag from the package manifest was
  not enough, because a project `.npmrc` outranks nothing in the manifest: it is a separate, higher-level
  source that had to be found before `--no-provenance` on the command line could get past it.

  `packages/tokens` keeps `publishConfig.provenance` in its own manifest, so the one package that publishes
  only from CI still declares it explicitly, and nothing that a maintainer runs by hand is affected. Nothing
  about what either package ships changes.

- [#110](https://github.com/CruGlobal/cornerstone-design-system/pull/110) [`bdda35f`](https://github.com/CruGlobal/cornerstone-design-system/commit/bdda35f3300de39a337b21933664bcf1f2af48fa) Thanks [@rguinee](https://github.com/rguinee)! - Publish the component library to npm, and document how to install it.

  The package sat in `.changeset/config.json`'s `ignore` list because it had never been published and the
  registry question — npm under a paid organisation, or GitHub Packages — was open. It is settled: npm,
  public, under the same scope the design tokens already publish under. The repository, the documentation
  site and the MIT-licensed fork this descends from are all public, so `access: restricted` was gating
  distribution of something nothing else hides, while costing a paid seat for every consumer and making the
  install instructions on a public documentation site untrue.

  **`prepublishOnly` is now `npm run build` rather than `npm run verify`.** Un-ignoring the package put that
  hook on the release path for the first time, where it would have failed every release: `verify` ends in a
  three-engine Playwright run and the release runner installs no browsers. Nothing is lost — `verify-components`
  runs that exact gate on every pull request, and the WebKit session drops recorded in `CLAUDE.md` would have
  made releases flaky rather than safe. The tokens package has said `npm run build` here all along.

  **The first version is published by hand.** npm only lets a trusted publisher be configured for a package
  that already exists, so OIDC cannot bootstrap a new one; `@cruglobal/cornerstone-design-system` hit the same
  wall in #38 and #40 and got past it with a short-lived `NPM_TOKEN` in CI. This one goes out from a
  maintainer's machine against an interactive 2FA challenge instead, leaving no standing credential behind —
  npm removes direct publishing from bypass-2FA tokens in January 2027 regardless.

  That is also why `publishConfig` sets `access` and not `provenance`. Trusted publishing attaches a
  provenance attestation on its own; the flag exists to turn that off, and setting it true makes `npm publish`
  refuse to run anywhere but a CI runner, which is precisely what a first publish cannot be. `packages/tokens`
  keeps the flag because it only ever publishes from CI. Once `0.1.0` is on the registry and its trusted
  publisher is configured, `release.yml` releases both packages the same way: with provenance, and with no
  token.

  **The Installation page now installs something.** The site's home page is the Installation entry in the
  navigation and is compiled into the agent skill's `references/installation.md`, but it carried no
  instructions at all — an import line, and a dead `#installing-via-npm` anchor that `usage.md` links to. It
  now covers the install, the two builds in the package and which one a bundler wants, loading the stylesheet
  and the components on both paths, the three ways a definition reaches the page — including why the
  autoloader is not one of them behind a bundler, since it resolves its imports at runtime from its own
  module URL — the `cs-dark` opt-in, and `cs-cloak`. React's install section loses its "not published to npm
  yet, install from a tarball" warning, and the two plugin comments that gave "the package is not published"
  as their reason for having no CDN tab now give the reason that outlives it: Cru serves the library from no
  origin of its own.
