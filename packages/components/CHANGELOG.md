# @cruglobal/cornerstone-components

## 0.7.0

### Minor Changes

- [#199](https://github.com/CruGlobal/cornerstone-design-system/pull/199) [`df20c95`](https://github.com/CruGlobal/cornerstone-design-system/commit/df20c959a8a5fec2e2d84b883b9ba58f8b9e0e94) Thanks [@rguinee](https://github.com/rguinee)! - Added: `restart()` on `<cs-animation>`, which rewinds the animation to the start and plays it again, whether it has finished, is paused or is still running.

- [#204](https://github.com/CruGlobal/cornerstone-design-system/pull/204) [`6ad9c16`](https://github.com/CruGlobal/cornerstone-design-system/commit/6ad9c16dd26568320481778cebf1550b17b1be61) Thanks [@rguinee](https://github.com/rguinee)! - Added: `<cs-color-picker>` swatches accept `var(--cs-*)` design tokens, with an optional fallback, resolved against the picker each time it opens.

- [#198](https://github.com/CruGlobal/cornerstone-design-system/pull/198) [`25257da`](https://github.com/CruGlobal/cornerstone-design-system/commit/25257da22591f99ad09d7ce7f529f7ce3e72bf11) Thanks [@rguinee](https://github.com/rguinee)! - Added: `<cs-page>` documents its `desktop-navigation-*`, `mobile-navigation-*` and `skip-to-content-target` slots. The Page docs also cover when each navigation slot shows, presetting `--header-height` to stop a layout shift, and that there is no rule between regions yet.

### Patch Changes

- [#192](https://github.com/CruGlobal/cornerstone-design-system/pull/192) [`e133a9b`](https://github.com/CruGlobal/cornerstone-design-system/commit/e133a9b71db23867abd20faf385e4927716bffca) Thanks [@rguinee](https://github.com/rguinee)! - Added: the Button page, and so the shipped `cornerstone` skill, shows an icon button with a badge in the `end` slot, the count in the icon's label, and how to announce a count the user changed.

- [#169](https://github.com/CruGlobal/cornerstone-design-system/pull/169) [`241dd19`](https://github.com/CruGlobal/cornerstone-design-system/commit/241dd19f8e1034ebec592fbae895ed4f31c1c80f) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the button page's Customizing example now builds its pink shadow from the shadow geometry longhands. It appended a colour to `--cs-shadow-m`, which already ends in one, so the declaration held two colours, was invalid, and the shadow never rendered.

- [#172](https://github.com/CruGlobal/cornerstone-design-system/pull/172) [`bfb8a0a`](https://github.com/CruGlobal/cornerstone-design-system/commit/bfb8a0a1eb1e686c9c2f54fbef2b89ec39a96110) Thanks [@rguinee](https://github.com/rguinee)! - Added: the installation guide, and so the shipped `cornerstone` skill's `installation.md`, shows the `.claude/settings.json` that installs the Cornerstone plugin for Claude Code.

- [#204](https://github.com/CruGlobal/cornerstone-design-system/pull/204) [`bf52568`](https://github.com/CruGlobal/cornerstone-design-system/commit/bf525684a5615a5f6563828bd29b4469fc954ac5) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the `<cs-color-picker>` `label` docs no longer say the label is hidden; it is displayed.

- [#167](https://github.com/CruGlobal/cornerstone-design-system/pull/167) [`2547435`](https://github.com/CruGlobal/cornerstone-design-system/commit/25474352ae91c7fa5b493dc97d8eb01c1e266923) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: generated brand themes now define `--cs-color-shadow`, so `--cs-shadow-s`/`-m`/`-l` resolve again. Dialogs, drawers, dropdowns, popovers, selects, cards and toasts had been rendering with no shadow under the Cru theme.

- [#185](https://github.com/CruGlobal/cornerstone-design-system/pull/185) [`b9a2592`](https://github.com/CruGlobal/cornerstone-design-system/commit/b9a25923b1fa83af30876a8d10ddb00b49a3cc4c) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the `cornerstone-design` agent skill's links to the documentation site. Fourteen of them pointed under a `/docs/` path the site does not have, so each one was a 404. `verify:skills` now checks absolute docs links as well as relative ones.

- [#190](https://github.com/CruGlobal/cornerstone-design-system/pull/190) [`256aabd`](https://github.com/CruGlobal/cornerstone-design-system/commit/256aabd8e7c11713fbd28daa787b64f52ee9ae31) Thanks [@rguinee](https://github.com/rguinee)! - Added: a "Porting an existing app from another framework" section to the `cornerstone-design` agent skill, right after its design-system-first ladder.

- [#202](https://github.com/CruGlobal/cornerstone-design-system/pull/202) [`d6955ea`](https://github.com/CruGlobal/cornerstone-design-system/commit/d6955ea05d8efc8445d5d13ea058ac82305528cb) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `cs-details` and the native `<details>` styles now make the summary `border-box`, so an icon-only `cs-button` inside it stays square.

- [#188](https://github.com/CruGlobal/cornerstone-design-system/pull/188) [`401d5c2`](https://github.com/CruGlobal/cornerstone-design-system/commit/401d5c28d2305a92a80c00ca0154e926d8ff737b) Thanks [@rguinee](https://github.com/rguinee)! - Added: the Details page, and so the shipped `cornerstone` skill, now notes that `open` already holds the new state inside a `click` handler, and shows how to track open and close with `cs-show` and `cs-hide` instead.

- [#194](https://github.com/CruGlobal/cornerstone-design-system/pull/194) [`6e8933f`](https://github.com/CruGlobal/cornerstone-design-system/commit/6e8933f9cf31f8ed806da9b304c19f0f3ab55925) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the divider page and the `--spacing` description now say that as a direct child of a layout utility such as `cs-stack` or `cs-cluster`, `--spacing` has no effect and the container's `cs-gap-*` sets the space around the divider. The page's vertical divider example no longer draws its lines with no space around them.

- [#201](https://github.com/CruGlobal/cornerstone-design-system/pull/201) [`6588e2f`](https://github.com/CruGlobal/cornerstone-design-system/commit/6588e2f812f0136cb9e7d1ddc1597bbe36364fa7) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the documentation site now builds inside a checkout nested in another one, such as a worktree under `.claude/worktrees/`, and no longer drops ratios like "3:1" from its pages. Docs site only; the package's output is unchanged.

- [#196](https://github.com/CruGlobal/cornerstone-design-system/pull/196) [`0dfacdb`](https://github.com/CruGlobal/cornerstone-design-system/commit/0dfacdb4d4449f5f62aaee8b1c4efb05eb21bfdc) Thanks [@rguinee](https://github.com/rguinee)! - Added: a Tailwind CSS guide under Frameworks, for running Cornerstone Components and Tailwind v4 on the same page, and the `cornerstone` skill now ships it as `references/frameworks/tailwind.md`.

- [#191](https://github.com/CruGlobal/cornerstone-design-system/pull/191) [`4c0b38e`](https://github.com/CruGlobal/cornerstone-design-system/commit/4c0b38e4f8532f616623621d89b391315ed77629) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the agent and design skill maintainer READMEs now say the skills are generated by `npm run build`, not an Eleventy build, and the root `CLAUDE.md` and the docs standard no longer say `check-docs-url.js` catches every literal address.

- [#189](https://github.com/CruGlobal/cornerstone-design-system/pull/189) [`3606efc`](https://github.com/CruGlobal/cornerstone-design-system/commit/3606efc01fc2caec2d7f016ce85a36a0563106de) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `check-docs-url.js --fix` now re-points today's docs address after a move, and a second run no longer doubles the path. `KNOWN_ROOTS` lists the current `homepage`, and the check fails when it is missing.

- [#193](https://github.com/CruGlobal/cornerstone-design-system/pull/193) [`c6717a2`](https://github.com/CruGlobal/cornerstone-design-system/commit/c6717a2191aed6e856e40e4642427d58c8e7258c) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `<cs-drawer>`'s summary and docs now say it slides in from an edge of the viewport, not of a container.

- [#222](https://github.com/CruGlobal/cornerstone-design-system/pull/222) [`5c1c2a8`](https://github.com/CruGlobal/cornerstone-design-system/commit/5c1c2a88f1932c624a08bac3d2fe57e8d621a891) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `packages/components/CLAUDE.md` names event classes `Cs<Name>Event`, as the code does, and says to add a changeset instead of editing the changelog page. Contributor guidance only; nothing that ships changes.

- [#187](https://github.com/CruGlobal/cornerstone-design-system/pull/187) [`5c78fef`](https://github.com/CruGlobal/cornerstone-design-system/commit/5c78feff3290326e4f8099e11c7475a68ab84284) Thanks [@rguinee](https://github.com/rguinee)! - Added: the Reducing FOUCE page now warns that `cs-cloak` on `<html>` or `<body>` re-hides the page whenever an undefined custom element appears later, and the Rails page points to it. The `cornerstone` skill's copies of both pages change too.

- [#200](https://github.com/CruGlobal/cornerstone-design-system/pull/200) [`f4a56f6`](https://github.com/CruGlobal/cornerstone-design-system/commit/f4a56f6cd79c11c156172f5205dea9ef57ff5fee) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `<cs-page>` now puts back its measured slot heights, such as `--header-height`, when a DOM morph (Turbo 8, idiomorph, Alpine) resets its `style` attribute.

- [#198](https://github.com/CruGlobal/cornerstone-design-system/pull/198) [`d837a3d`](https://github.com/CruGlobal/cornerstone-design-system/commit/d837a3dd9b4bf978bb0d3a424a30c3acf5bd326d) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the `cornerstone` skill's list of valid `<cs-page>` slots now includes every slot the page renders, read from the manifest.

- [#195](https://github.com/CruGlobal/cornerstone-design-system/pull/195) [`9d3b772`](https://github.com/CruGlobal/cornerstone-design-system/commit/9d3b772d9a15837ed64477068afb97ec7f060102) Thanks [@rguinee](https://github.com/rguinee)! - Added: the Page docs now list the layout `<cs-page>` gives each slot wrapper. They and the `cornerstone-design` skill's page-layout reference show a rail beside a sidebar in `slot="navigation"` built from layout utilities.

- [#186](https://github.com/CruGlobal/cornerstone-design-system/pull/186) [`08bc5c5`](https://github.com/CruGlobal/cornerstone-design-system/commit/08bc5c50eaabcc3481d7f432ea7169775061a063) Thanks [@rguinee](https://github.com/rguinee)! - Added: the Rails guide and the `cornerstone` skill's `references/frameworks/rails.md` now warn that a Stimulus action on a `cs-*` element must name its event (`click->modal#open`, not `modal#open`), with a before/after example.

- [#171](https://github.com/CruGlobal/cornerstone-design-system/pull/171) [`f13b4cb`](https://github.com/CruGlobal/cornerstone-design-system/commit/f13b4cb6f65fa82038f765744006d490cfcaede4) Thanks [@rguinee](https://github.com/rguinee)! - Removed: leftover upstream "moved over from Pro" callouts on the Page, Toast and Toast Item pages, and the Pro tier line in the Accordion example.

- [#205](https://github.com/CruGlobal/cornerstone-design-system/pull/205) [`cc37343`](https://github.com/CruGlobal/cornerstone-design-system/commit/cc37343adb161b44f07bf767578293b49bbdf709) Thanks [@rguinee](https://github.com/rguinee)! - Added: code review standards in `docs/standards/`, and ast-grep rules in the component library's `npm run lint`. Tooling only; nothing that ships changes.

- [#197](https://github.com/CruGlobal/cornerstone-design-system/pull/197) [`b33ecb9`](https://github.com/CruGlobal/cornerstone-design-system/commit/b33ecb977fd938543ef02fc3315faf5bb1221aaf) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: `<cs-select>`, `<cs-tooltip>` and `<cs-popover>` no longer hide their content when reopened during the close animation, and no longer emit `cs-after-show` when closed during the open animation. Cancelling `cs-hide` on `<cs-select>` now keeps it open.

## 0.6.2

### Patch Changes

- [#165](https://github.com/CruGlobal/cornerstone-design-system/pull/165) [`8186852`](https://github.com/CruGlobal/cornerstone-design-system/commit/81868526f6ebc2049d424b684459c95e9a9bbced) Thanks [@rguinee](https://github.com/rguinee)! - Fixed: the Support page's "Open an issue" button now links to the template chooser at `/issues/new/choose` rather than the bare `/issues/new`.

## 0.6.1

### Patch Changes

- [#163](https://github.com/CruGlobal/cornerstone-design-system/pull/163) [`ab4255c`](https://github.com/CruGlobal/cornerstone-design-system/commit/ab4255ccb1c7b238c966a60749a9c78e60262cc1) Thanks [@rguinee](https://github.com/rguinee)! - Changed: both packages now share a single version number. `@cruglobal/cornerstone-components` moves from `0.1.3` to align with the design-system package — `0.2` through `0.5` never existed, so no published version is affected.

- [#162](https://github.com/CruGlobal/cornerstone-design-system/pull/162) [`823c8ad`](https://github.com/CruGlobal/cornerstone-design-system/commit/823c8ade77dd0aa0a187322d7a19670e0fe5d882) Thanks [@rguinee](https://github.com/rguinee)! - Added: A public roadmap at `/resources/roadmap`, generated from the repository's GitHub milestones.

  - One card per planned release, with curated copy and a count of open questions — no percentage, since a release with nothing open has not been scoped rather than finished
  - Only issues carrying the `roadmap` label render a title; the tracker's decisions stay off the page
  - Fixed: the Support page claimed the packages are published privately. Both are public on npm; the support model is what is internal

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
