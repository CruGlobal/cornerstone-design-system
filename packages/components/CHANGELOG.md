# @cruglobal/cornerstone-components

## 0.1.3

### Patch Changes

- [#130](https://github.com/CruGlobal/cornerstone-design-system/pull/130) [`4f8d9f7`](https://github.com/CruGlobal/cornerstone-design-system/commit/4f8d9f7b96808a2432522383a075df1ed4b824c4) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: Every component's `@since` now reads `0.1`, the version it actually shipped in.

  The tag carried Web Awesome's numbers — `1.0` through `3.11` across the 70 components — which reached the
  Custom Elements Manifest, and from there the Since badge on every reference page.

- [#137](https://github.com/CruGlobal/cornerstone-design-system/pull/137) [`b811a00`](https://github.com/CruGlobal/cornerstone-design-system/commit/b811a00be73db696df9b3a5b2b56be16a9afe15a) Thanks [@rguinee](https://github.com/rguinee)! - Added: A "Why Web Components?" section on the Frameworks page.

  - A table of the six platforms Cru builds on, and how far Cornerstone reaches each
  - The three layers: tokens reach everything, components are the web layer, platform-native implementations are a possible third
  - The trade-offs accepted, and the principles the library was specified against
  - Rails and WordPress badges corrected from "Tested" to "Testing"

- [#138](https://github.com/CruGlobal/cornerstone-design-system/pull/138) [`4c41a78`](https://github.com/CruGlobal/cornerstone-design-system/commit/4c41a784a590ce8dc2d92fea2dce59be545d83de) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: The changelog page lists released versions instead of one `## Unreleased` block.

  - `0.1.1` and `0.1.2` are generated from `CHANGELOG.md`; `0.1.0` stays hand-written as the fork
  - Each entry's category renders as its bullet icon, with a legend
  - Issue and pull request references render as badges
  - Duplicate category blocks merged, and version anchors fixed to `#v0-1-2`

## 0.1.2

### Patch Changes

- [#113](https://github.com/CruGlobal/cornerstone-design-system/pull/113) [`e69a1a9`](https://github.com/CruGlobal/cornerstone-design-system/commit/e69a1a93ec30066de386946aff26492b61c3dd64) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: Stop `waitForEvent` waiting forever. It now takes a timeout, defaulting to five seconds, and resolves on it rather than rejecting — reaching 14 call sites across eight components.

- [#114](https://github.com/CruGlobal/cornerstone-design-system/pull/114) [`69cf9e1`](https://github.com/CruGlobal/cornerstone-design-system/commit/69cf9e14d986c8015f229fd6667b07ae2b87398f) Thanks [@rguinee](https://github.com/rguinee)! - Changed: **Tooling only — nothing that ships changes.** The component test suite is sharded across four CI runners and Playwright's browsers are cached, cutting the gate from ~29 minutes to ~10.

## 0.1.1

### Patch Changes

- [#112](https://github.com/CruGlobal/cornerstone-design-system/pull/112) [`95f69fb`](https://github.com/CruGlobal/cornerstone-design-system/commit/95f69fb08aa58918da618ab70a631c19ac16b99c) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: Delete the root `.npmrc`, whose `provenance=true` made every first publish in this workspace impossible.

- [#110](https://github.com/CruGlobal/cornerstone-design-system/pull/110) [`bdda35f`](https://github.com/CruGlobal/cornerstone-design-system/commit/bdda35f3300de39a337b21933664bcf1f2af48fa) Thanks [@rguinee](https://github.com/rguinee)! - Added: Publish the component library to npm as `@cruglobal/cornerstone-components` — public, with provenance — and document how to install it. `prepublishOnly` is `npm run build` rather than `npm run verify`, because the release runner installs no browsers.
