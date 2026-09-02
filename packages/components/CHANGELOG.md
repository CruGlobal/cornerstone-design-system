# @cruglobal/cornerstone-components

## 0.1.2

### Patch Changes

- [#113](https://github.com/CruGlobal/cornerstone-design-system/pull/113) [`e69a1a9`](https://github.com/CruGlobal/cornerstone-design-system/commit/e69a1a93ec30066de386946aff26492b61c3dd64) Thanks [@rguinee](https://github.com/rguinee)! - Stop `waitForEvent` waiting forever. It now takes a timeout, defaulting to five seconds, and resolves on it rather than rejecting — reaching 14 call sites across eight components.

- [#114](https://github.com/CruGlobal/cornerstone-design-system/pull/114) [`69cf9e1`](https://github.com/CruGlobal/cornerstone-design-system/commit/69cf9e14d986c8015f229fd6667b07ae2b87398f) Thanks [@rguinee](https://github.com/rguinee)! - **Tooling only — nothing that ships changes.** The component test suite is sharded across four CI runners and Playwright's browsers are cached, cutting the gate from ~29 minutes to ~10.

## 0.1.1

### Patch Changes

- [#112](https://github.com/CruGlobal/cornerstone-design-system/pull/112) [`95f69fb`](https://github.com/CruGlobal/cornerstone-design-system/commit/95f69fb08aa58918da618ab70a631c19ac16b99c) Thanks [@rguinee](https://github.com/rguinee)! - Delete the root `.npmrc`, whose `provenance=true` made every first publish in this workspace impossible.

- [#110](https://github.com/CruGlobal/cornerstone-design-system/pull/110) [`bdda35f`](https://github.com/CruGlobal/cornerstone-design-system/commit/bdda35f3300de39a337b21933664bcf1f2af48fa) Thanks [@rguinee](https://github.com/rguinee)! - Publish the component library to npm as `@cruglobal/cornerstone-components` — public, with provenance — and document how to install it. `prepublishOnly` is `npm run build` rather than `npm run verify`, because the release runner installs no browsers.
