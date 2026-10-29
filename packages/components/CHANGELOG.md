# @cruglobal/cornerstone-components

## 0.10.1

### Fixed

- [#304](https://github.com/CruGlobal/cornerstone-design-system/pull/304) [`4f85178`](https://github.com/CruGlobal/cornerstone-design-system/commit/4f85178867b9199ff9224fea0c66e1ad4d65ddfe) Thanks [@joannacatanus-ux](https://github.com/joannacatanus-ux)! - the docs site's Inspiration Screens axe check sets aside `cs-page`'s skip link under `region`, an axe-core shadow DOM bug now in the accessibility gap register. Docs tooling only; nothing that ships changes.

- [#296](https://github.com/CruGlobal/cornerstone-design-system/pull/296) [`b800c64`](https://github.com/CruGlobal/cornerstone-design-system/commit/b800c64368891e7a3bd8167aad95ddc5be6a0331) Thanks [@rguinee](https://github.com/rguinee)! - the docs site's page check skips code, so a `:::` directive, `::roadmap` or Starlight aside markup shown in a code span or block no longer fails it. Docs tooling only; nothing that ships changes.

## 0.10.0

### Breaking

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - Every component custom property is renamed to `--cs-<component>-<property>` or one of seven shared names (`--spacing` on `<cs-card>` is now `--cs-card-spacing`), and none is set on the host, so each can be set on the page, a section or one element. The layout utilities' `--min-column-size`, `--flank-size` and `--content-percentage` become `--cs-grid-min-column-size`, `--cs-flank-size` and `--cs-flank-content-percentage`, and the themes no longer set `--cs-tooltip-*`, so your own CSS that reads one outside a `<cs-tooltip>` gets nothing.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - Components no longer set unprefixed custom properties on their host for app CSS to inherit. `<cs-page>` drops `--scroll-margin-top` (anchors still clear the header) and stops writing a footer height, and `<cs-qr-code>`'s `--corner-color` is now the documented `--cs-qr-code-corner-color`.

### Added

- [#261](https://github.com/CruGlobal/cornerstone-design-system/pull/261) [`bc26cf5`](https://github.com/CruGlobal/cornerstone-design-system/commit/bc26cf5b9652031b116badf1177f7d3eae34b09d) Thanks [@rguinee](https://github.com/rguinee)! - `cs-button` takes `orientation="vertical"` to stack its `start` slot above the label and `end` below it, spaced by `--cs-button-stacked-gap`, `--cs-button-stacked-padding-block` and `--cs-button-stacked-padding-inline`. It reads `--cs-button-justify-content` to align a one-row button's content. Buttons in a horizontal `cs-button-group` share one height. The Button page gains Stacked, Navigation Bar and Content Alignment examples.

- [#257](https://github.com/CruGlobal/cornerstone-design-system/pull/257) [`80c65bb`](https://github.com/CruGlobal/cornerstone-design-system/commit/80c65bb874e4102bd90ae54a36322bbcdee1d7ac) Thanks [@joannacatanus-ux](https://github.com/joannacatanus-ux)! - The docs site now runs axe on every Inspiration Screen state file in light and dark mode after it builds, and fails on any violation, missing file or page error. Docs tooling and an unshipped page only; nothing that ships changes.

- [#228](https://github.com/CruGlobal/cornerstone-design-system/pull/228) [`dc56943`](https://github.com/CruGlobal/cornerstone-design-system/commit/dc56943af8095c571e8f1cc0351420174359ce71) Thanks [@rguinee](https://github.com/rguinee)! - glossary terms for component properties and shared properties.

### Changed

- [#282](https://github.com/CruGlobal/cornerstone-design-system/pull/282) [`692dac3`](https://github.com/CruGlobal/cornerstone-design-system/commit/692dac383eccb905848377f8f820693e14cfeb3b) Thanks [@rguinee](https://github.com/rguinee)! - the test suite runs on Playwright 1.55.1 (Chromium 140, Firefox 141, WebKit 26.0) instead of the pinned 1.52.0, which closes GHSA-7mvr-c777-76hp. No package output changes.

- [#278](https://github.com/CruGlobal/cornerstone-design-system/pull/278) [`80fc778`](https://github.com/CruGlobal/cornerstone-design-system/commit/80fc778f823134f3e1ac4c72a3a0976e236d0885) Thanks [@rguinee](https://github.com/rguinee)! - The roadmap lists a fourth 1.0.0 entry criterion, that the known defects in what ships are fixed. Docs site only; the package's output is unchanged.

### Fixed

- [#260](https://github.com/CruGlobal/cornerstone-design-system/pull/260) [`fa39049`](https://github.com/CruGlobal/cornerstone-design-system/commit/fa3904923251f3a68797c8fe0b3e8f3ed5406ec9) Thanks [@rguinee](https://github.com/rguinee)! - The tooltip placement example gives each button visible text, so none relies on its tooltip for a name. The accessibility and browser support pages now claim only what the test record shows, and a docs check fails the build when a contrast ratio or colour the accessibility page prints stops matching the shipped themes.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - The Accessibility page scopes its reduced-motion claim to show and hide animations, corrects its focus-indicator contrast, and lists the remaining contrast and motion gaps.

- [#277](https://github.com/CruGlobal/cornerstone-design-system/pull/277) [`5551146`](https://github.com/CruGlobal/cornerstone-design-system/commit/555114680b140b931aad099af6512bf9d149c675) Thanks [@rguinee](https://github.com/rguinee)! - A failed agent-file step now fails the build. An error while writing the agent skills or `llms.txt` exits non-zero instead of 0.

- [#261](https://github.com/CruGlobal/cornerstone-design-system/pull/261) [`b030ca5`](https://github.com/CruGlobal/cornerstone-design-system/commit/b030ca5a8952a3ffe5849cda6f609dc18985fdc0) Thanks [@rguinee](https://github.com/rguinee)! - `cs-button` with `with-caret` keeps a `cs-badge` in its `end` slot, so it shows and its text joins the button's accessible name; the caret still hides anything else there.

- [#276](https://github.com/CruGlobal/cornerstone-design-system/pull/276) [`767b6df`](https://github.com/CruGlobal/cornerstone-design-system/commit/767b6dfe96ec21f882153b2538cb643a731c160a) Thanks [@rguinee](https://github.com/rguinee)! - the Accessibility page drops the closed `cs-callout` SSR gap; docs site only, the package's output is unchanged.

- [#280](https://github.com/CruGlobal/cornerstone-design-system/pull/280) [`5b1a7a4`](https://github.com/CruGlobal/cornerstone-design-system/commit/5b1a7a483f247f3783d629ae76e6a9fb72e40538) Thanks [@rguinee](https://github.com/rguinee)! - `cs-callout`'s variant accessibility check is one test per variant instead of all seven in one.

- [#264](https://github.com/CruGlobal/cornerstone-design-system/pull/264) [`baa92f8`](https://github.com/CruGlobal/cornerstone-design-system/commit/baa92f8b24a2d549e3a705b6235a2506fe0c3a06) Thanks [@rguinee](https://github.com/rguinee)! - CI runs the component tests in Playwright's container image instead of installing browser libraries on each shard, so a slow Ubuntu mirror no longer stalls them. No package output changes.

- [#275](https://github.com/CruGlobal/cornerstone-design-system/pull/275) [`478925b`](https://github.com/CruGlobal/cornerstone-design-system/commit/478925bb2d4cb10162f6cd3edb4bd7f32ce95b84) Thanks [@rguinee](https://github.com/rguinee)! - The badge, button, callout, tag, toast item and toast tests now cover the `highlight` and `information` variants. No package output changes.

- [#274](https://github.com/CruGlobal/cornerstone-design-system/pull/274) [`e329a8e`](https://github.com/CruGlobal/cornerstone-design-system/commit/e329a8e4ca3d8ef399522b01312379565584eddb) Thanks [@rguinee](https://github.com/rguinee)! - the docs and the shipped agent skills now show the `highlight` and `information` variants. The Badge, Button, Callout, Tag, Toast and Toast Item examples include both, and the Theming, Color Variants and Native Styles pages list all seven roles.

- [#279](https://github.com/CruGlobal/cornerstone-design-system/pull/279) [`b6381ab`](https://github.com/CruGlobal/cornerstone-design-system/commit/b6381ab6341ec903bca5b05fce35843309ad4932) Thanks [@rguinee](https://github.com/rguinee)! - the docs home page and the shipped skill's installation reference no longer say the site is being ported.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - the `<cs-qr-code>` image examples in the docs and agent skill pointed at logos that don't exist, so they drew no image. They now use the Cornerstone mark.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - Every animation that reads `--cs-show-duration` or `--cs-hide-duration` now finishes at once when the user prefers reduced motion, including `<cs-time-input>`'s popup. Anchors in a `<cs-page>` clear a sticky banner as well as the header, and `<cs-skeleton>` stays visible in forced colors mode.

- [#279](https://github.com/CruGlobal/cornerstone-design-system/pull/279) [`4acff5b`](https://github.com/CruGlobal/cornerstone-design-system/commit/4acff5bbeaaef2d17f130cd923a69b07c680bfd8) Thanks [@rguinee](https://github.com/rguinee)! - `:::note`, `:::tip`, `:::caution` and `:::danger` render as styled callouts on the docs site; in the shipped skill, four suggestions now read **Tip** instead of **Info**.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - Calling `openSubmenu()` or `closeSubmenu()` on `<cs-dropdown-item>` runs the transition once, so a submenu closed that way animates instead of vanishing.

- [#262](https://github.com/CruGlobal/cornerstone-design-system/pull/262) [`628cf46`](https://github.com/CruGlobal/cornerstone-design-system/commit/628cf4657215bf5045f44aedf941c576ec4df725) Thanks [@rguinee](https://github.com/rguinee)! - Components no longer read unprefixed custom properties a page happens to define, such as `--color` in `<cs-color-picker>` and `--box-shadow` in `<cs-input>`. A one-row `<cs-textarea>` is now as tall as an input, and a dropdown submenu closes over `--cs-hide-duration` instead of the show duration.

## 0.9.0

### Added

- [#256](https://github.com/CruGlobal/cornerstone-design-system/pull/256) [`4096e05`](https://github.com/CruGlobal/cornerstone-design-system/commit/4096e05878b61459b29f4b2ef517d53d4cd9e6df) Thanks [@rguinee](https://github.com/rguinee)! - `cs-text-truncate-2` through `cs-text-truncate-5` cut text to that many lines with an ellipsis, and `cs-text-truncate-1` does the same as `cs-text-truncate`.

- [#237](https://github.com/CruGlobal/cornerstone-design-system/pull/237) [`854fd4b`](https://github.com/CruGlobal/cornerstone-design-system/commit/854fd4bf486c87ad594dc8601163aef2b3663352) Thanks [@joannacatanus-ux](https://github.com/joannacatanus-ux)! - The docs site's component check now also reads the HTML examples under `public/assets/examples/`, so an unknown `cs-*` tag in a screen fails the build. Docs tooling only; nothing that ships changes.

### Changed

- [#223](https://github.com/CruGlobal/cornerstone-design-system/pull/223) [`63deae0`](https://github.com/CruGlobal/cornerstone-design-system/commit/63deae04e378006a1c8c1af8463e2214f0b3b342) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-badge>` no longer announces its text as a live region, so its text now joins the accessible name of the button, link or other control it is in. Apps that need a change announced keep their own live region outside the control. The Badge and Button pages, and so the shipped `cornerstone` skill, say so.

### Fixed

- [#234](https://github.com/CruGlobal/cornerstone-design-system/pull/234) [`3a6baf5`](https://github.com/CruGlobal/cornerstone-design-system/commit/3a6baf5953de1f895e6a983fb28dd29c049d4382) Thanks [@joannacatanus-ux](https://github.com/joannacatanus-ux)! - The accessibility page's Known gaps table now records that `cs-callout`'s variant axe test is skipped under SSR. Docs only; nothing that ships changes.

- [#251](https://github.com/CruGlobal/cornerstone-design-system/pull/251) [`ed0ebc6`](https://github.com/CruGlobal/cornerstone-design-system/commit/ed0ebc62a59823fc71c2e79957e566137532a385) Thanks [@rguinee](https://github.com/rguinee)! - The agent skill's `SKILL.md` now lists the themes and palettes that ship (Cru, FamilyLife and Default) and says the loaded stylesheet picks the theme, not a class.

- [#254](https://github.com/CruGlobal/cornerstone-design-system/pull/254) [`fd46d34`](https://github.com/CruGlobal/cornerstone-design-system/commit/fd46d34831f070871c5b5a1673c82ae69d720bc6) Thanks [@rguinee](https://github.com/rguinee)! - `cs-zoomable-frame`'s `with-theme-sync` docs no longer call the classes it copies theme selectors, and say the iframe must load the host page's theme stylesheet.

## 0.8.1

### Added

- [#253](https://github.com/CruGlobal/cornerstone-design-system/pull/253) [`dd35656`](https://github.com/CruGlobal/cornerstone-design-system/commit/dd35656dac50570827e8c2813f45ffad5158fc81) Thanks [@rguinee](https://github.com/rguinee)! - Cru and FamilyLife choices in the docs site's header menu, which the palette and color token pages follow. The shipped skill's Theming and Color tokens pages change to match.

- [#250](https://github.com/CruGlobal/cornerstone-design-system/pull/250) [`f1192c9`](https://github.com/CruGlobal/cornerstone-design-system/commit/f1192c994fe6bea3c9de8f3d452d63c024def8fc) Thanks [@rguinee](https://github.com/rguinee)! - a FamilyLife theme preview on the Built-in Themes page, under Cru's. Docs site only; the package's output is unchanged.

## 0.8.0

### Added

- [#239](https://github.com/CruGlobal/cornerstone-design-system/pull/239) [`e241861`](https://github.com/CruGlobal/cornerstone-design-system/commit/e2418617165c085b69984262b0a0dab346b85d58) Thanks [@LizzyRandall](https://github.com/LizzyRandall)! - a FamilyLife theme, `styles/themes/fl.css`. Load it after `cornerstone.css` to switch a site to FamilyLife; Cru stays the default.

### Fixed

- [#246](https://github.com/CruGlobal/cornerstone-design-system/pull/246) [`860835a`](https://github.com/CruGlobal/cornerstone-design-system/commit/860835a8a1ea4dd5d3b9677847c297cdffa56cda) Thanks [@rguinee](https://github.com/rguinee)! - The FamilyLife theme now asks for the `Akkurat` family that FamilyLife's sites load, and sets semibold and bold to 700 so buttons, actions and form labels render in Bold. The theming docs also say which cuts a site supplies.

- [#235](https://github.com/CruGlobal/cornerstone-design-system/pull/235) [`469c3a4`](https://github.com/CruGlobal/cornerstone-design-system/commit/469c3a4de2476e414578112b8ae17de2f99b239d) Thanks [@rguinee](https://github.com/rguinee)! - Component tests no longer wait a fixed time for an animation or a frame. They finish the animation, or step a faked frame clock, so a busy CI runner can't fail them, and check each animation's configured length against its duration token instead of timing it. Tests only; the published package is unchanged.

- [#249](https://github.com/CruGlobal/cornerstone-design-system/pull/249) [`5d8f5a5`](https://github.com/CruGlobal/cornerstone-design-system/commit/5d8f5a5e30e55f36e7612514346a8e974f93b1e4) Thanks [@rguinee](https://github.com/rguinee)! - The Cornerstone agents and review standards now say the loaded stylesheet picks the theme, not a `cs-theme-*` class.

- [#247](https://github.com/CruGlobal/cornerstone-design-system/pull/247) [`284804e`](https://github.com/CruGlobal/cornerstone-design-system/commit/284804e3b0e548c493c70e7aae54ccfdf49889c8) Thanks [@rguinee](https://github.com/rguinee)! - The shipped theming, color and typography docs and the themes reference now say the loaded stylesheet picks the theme, not a `cs-theme-*` class, and cover FamilyLife's theme.

- [#245](https://github.com/CruGlobal/cornerstone-design-system/pull/245) [`2720e09`](https://github.com/CruGlobal/cornerstone-design-system/commit/2720e09f0e52f927e6286ed1bd16e17f8a8f3248) Thanks [@rguinee](https://github.com/rguinee)! - The design skill's theming reference no longer says a `cs-theme-*` or `cs-palette-*` class switches or scopes a theme, and it lists FamilyLife's 10 hues.

## 0.7.1

### Added

- [#214](https://github.com/CruGlobal/cornerstone-design-system/pull/214) [`9f3ecc1`](https://github.com/CruGlobal/cornerstone-design-system/commit/9f3ecc13c6935d2fae316da388bb57120ae5247f) Thanks [@joannacatanus-ux](https://github.com/joannacatanus-ux)! - a glossary for the documentation site's Inspiration library. Docs only; nothing that ships changes.

### Changed

- [#232](https://github.com/CruGlobal/cornerstone-design-system/pull/232) [`fcc8d22`](https://github.com/CruGlobal/cornerstone-design-system/commit/fcc8d22f201adff3b104f36c87b988ce6338f698) Thanks [@rguinee](https://github.com/rguinee)! - each release in `CHANGELOG.md` groups its entries under a heading per category (Added, Fixed, ...) instead of by bump level.

## 0.7.0

### Added

- [#199](https://github.com/CruGlobal/cornerstone-design-system/pull/199) [`df20c95`](https://github.com/CruGlobal/cornerstone-design-system/commit/df20c959a8a5fec2e2d84b883b9ba58f8b9e0e94) Thanks [@rguinee](https://github.com/rguinee)! - `restart()` on `<cs-animation>`, which rewinds the animation to the start and plays it again, whether it has finished, is paused or is still running.

- [#204](https://github.com/CruGlobal/cornerstone-design-system/pull/204) [`6ad9c16`](https://github.com/CruGlobal/cornerstone-design-system/commit/6ad9c16dd26568320481778cebf1550b17b1be61) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-color-picker>` swatches accept `var(--cs-*)` design tokens, with an optional fallback, resolved against the picker each time it opens.

- [#198](https://github.com/CruGlobal/cornerstone-design-system/pull/198) [`25257da`](https://github.com/CruGlobal/cornerstone-design-system/commit/25257da22591f99ad09d7ce7f529f7ce3e72bf11) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-page>` documents its `desktop-navigation-*`, `mobile-navigation-*` and `skip-to-content-target` slots. The Page docs also cover when each navigation slot shows, presetting `--header-height` to stop a layout shift, and that there is no rule between regions yet.

- [#192](https://github.com/CruGlobal/cornerstone-design-system/pull/192) [`e133a9b`](https://github.com/CruGlobal/cornerstone-design-system/commit/e133a9b71db23867abd20faf385e4927716bffca) Thanks [@rguinee](https://github.com/rguinee)! - the Button page, and so the shipped `cornerstone` skill, shows an icon button with a badge in the `end` slot, the count in the icon's label, and how to announce a count the user changed.

- [#172](https://github.com/CruGlobal/cornerstone-design-system/pull/172) [`bfb8a0a`](https://github.com/CruGlobal/cornerstone-design-system/commit/bfb8a0a1eb1e686c9c2f54fbef2b89ec39a96110) Thanks [@rguinee](https://github.com/rguinee)! - the installation guide, and so the shipped `cornerstone` skill's `installation.md`, shows the `.claude/settings.json` that installs the Cornerstone plugin for Claude Code.

- [#190](https://github.com/CruGlobal/cornerstone-design-system/pull/190) [`256aabd`](https://github.com/CruGlobal/cornerstone-design-system/commit/256aabd8e7c11713fbd28daa787b64f52ee9ae31) Thanks [@rguinee](https://github.com/rguinee)! - a "Porting an existing app from another framework" section to the `cornerstone-design` agent skill, right after its design-system-first ladder.

- [#188](https://github.com/CruGlobal/cornerstone-design-system/pull/188) [`401d5c2`](https://github.com/CruGlobal/cornerstone-design-system/commit/401d5c28d2305a92a80c00ca0154e926d8ff737b) Thanks [@rguinee](https://github.com/rguinee)! - the Details page, and so the shipped `cornerstone` skill, now notes that `open` already holds the new state inside a `click` handler, and shows how to track open and close with `cs-show` and `cs-hide` instead.

- [#196](https://github.com/CruGlobal/cornerstone-design-system/pull/196) [`0dfacdb`](https://github.com/CruGlobal/cornerstone-design-system/commit/0dfacdb4d4449f5f62aaee8b1c4efb05eb21bfdc) Thanks [@rguinee](https://github.com/rguinee)! - a Tailwind CSS guide under Frameworks, for running Cornerstone Components and Tailwind v4 on the same page, and the `cornerstone` skill now ships it as `references/frameworks/tailwind.md`.

- [#187](https://github.com/CruGlobal/cornerstone-design-system/pull/187) [`5c78fef`](https://github.com/CruGlobal/cornerstone-design-system/commit/5c78feff3290326e4f8099e11c7475a68ab84284) Thanks [@rguinee](https://github.com/rguinee)! - the Reducing FOUCE page now warns that `cs-cloak` on `<html>` or `<body>` re-hides the page whenever an undefined custom element appears later, and the Rails page points to it. The `cornerstone` skill's copies of both pages change too.

- [#195](https://github.com/CruGlobal/cornerstone-design-system/pull/195) [`9d3b772`](https://github.com/CruGlobal/cornerstone-design-system/commit/9d3b772d9a15837ed64477068afb97ec7f060102) Thanks [@rguinee](https://github.com/rguinee)! - the Page docs now list the layout `<cs-page>` gives each slot wrapper. They and the `cornerstone-design` skill's page-layout reference show a rail beside a sidebar in `slot="navigation"` built from layout utilities.

- [#186](https://github.com/CruGlobal/cornerstone-design-system/pull/186) [`08bc5c5`](https://github.com/CruGlobal/cornerstone-design-system/commit/08bc5c50eaabcc3481d7f432ea7169775061a063) Thanks [@rguinee](https://github.com/rguinee)! - the Rails guide and the `cornerstone` skill's `references/frameworks/rails.md` now warn that a Stimulus action on a `cs-*` element must name its event (`click->modal#open`, not `modal#open`), with a before/after example.

- [#205](https://github.com/CruGlobal/cornerstone-design-system/pull/205) [`cc37343`](https://github.com/CruGlobal/cornerstone-design-system/commit/cc37343adb161b44f07bf767578293b49bbdf709) Thanks [@rguinee](https://github.com/rguinee)! - code review standards in `docs/standards/`, and ast-grep rules in the component library's `npm run lint`. Tooling only; nothing that ships changes.

### Removed

- [#171](https://github.com/CruGlobal/cornerstone-design-system/pull/171) [`f13b4cb`](https://github.com/CruGlobal/cornerstone-design-system/commit/f13b4cb6f65fa82038f765744006d490cfcaede4) Thanks [@rguinee](https://github.com/rguinee)! - leftover upstream "moved over from Pro" callouts on the Page, Toast and Toast Item pages, and the Pro tier line in the Accordion example.

### Fixed

- [#169](https://github.com/CruGlobal/cornerstone-design-system/pull/169) [`241dd19`](https://github.com/CruGlobal/cornerstone-design-system/commit/241dd19f8e1034ebec592fbae895ed4f31c1c80f) Thanks [@rguinee](https://github.com/rguinee)! - the button page's Customizing example now builds its pink shadow from the shadow geometry longhands. It appended a colour to `--cs-shadow-m`, which already ends in one, so the declaration held two colours, was invalid, and the shadow never rendered.

- [#204](https://github.com/CruGlobal/cornerstone-design-system/pull/204) [`bf52568`](https://github.com/CruGlobal/cornerstone-design-system/commit/bf525684a5615a5f6563828bd29b4469fc954ac5) Thanks [@rguinee](https://github.com/rguinee)! - the `<cs-color-picker>` `label` docs no longer say the label is hidden; it is displayed.

- [#167](https://github.com/CruGlobal/cornerstone-design-system/pull/167) [`2547435`](https://github.com/CruGlobal/cornerstone-design-system/commit/25474352ae91c7fa5b493dc97d8eb01c1e266923) Thanks [@rguinee](https://github.com/rguinee)! - generated brand themes now define `--cs-color-shadow`, so `--cs-shadow-s`/`-m`/`-l` resolve again. Dialogs, drawers, dropdowns, popovers, selects, cards and toasts had been rendering with no shadow under the Cru theme.

- [#185](https://github.com/CruGlobal/cornerstone-design-system/pull/185) [`b9a2592`](https://github.com/CruGlobal/cornerstone-design-system/commit/b9a25923b1fa83af30876a8d10ddb00b49a3cc4c) Thanks [@rguinee](https://github.com/rguinee)! - the `cornerstone-design` agent skill's links to the documentation site. Fourteen of them pointed under a `/docs/` path the site does not have, so each one was a 404. `verify:skills` now checks absolute docs links as well as relative ones.

- [#202](https://github.com/CruGlobal/cornerstone-design-system/pull/202) [`d6955ea`](https://github.com/CruGlobal/cornerstone-design-system/commit/d6955ea05d8efc8445d5d13ea058ac82305528cb) Thanks [@rguinee](https://github.com/rguinee)! - `cs-details` and the native `<details>` styles now make the summary `border-box`, so an icon-only `cs-button` inside it stays square.

- [#194](https://github.com/CruGlobal/cornerstone-design-system/pull/194) [`6e8933f`](https://github.com/CruGlobal/cornerstone-design-system/commit/6e8933f9cf31f8ed806da9b304c19f0f3ab55925) Thanks [@rguinee](https://github.com/rguinee)! - the divider page and the `--spacing` description now say that as a direct child of a layout utility such as `cs-stack` or `cs-cluster`, `--spacing` has no effect and the container's `cs-gap-*` sets the space around the divider. The page's vertical divider example no longer draws its lines with no space around them.

- [#201](https://github.com/CruGlobal/cornerstone-design-system/pull/201) [`6588e2f`](https://github.com/CruGlobal/cornerstone-design-system/commit/6588e2f812f0136cb9e7d1ddc1597bbe36364fa7) Thanks [@rguinee](https://github.com/rguinee)! - the documentation site now builds inside a checkout nested in another one, such as a worktree under `.claude/worktrees/`, and no longer drops ratios like "3:1" from its pages. Docs site only; the package's output is unchanged.

- [#191](https://github.com/CruGlobal/cornerstone-design-system/pull/191) [`4c0b38e`](https://github.com/CruGlobal/cornerstone-design-system/commit/4c0b38e4f8532f616623621d89b391315ed77629) Thanks [@rguinee](https://github.com/rguinee)! - the agent and design skill maintainer READMEs now say the skills are generated by `npm run build`, not an Eleventy build, and the root `CLAUDE.md` and the docs standard no longer say `check-docs-url.js` catches every literal address.

- [#189](https://github.com/CruGlobal/cornerstone-design-system/pull/189) [`3606efc`](https://github.com/CruGlobal/cornerstone-design-system/commit/3606efc01fc2caec2d7f016ce85a36a0563106de) Thanks [@rguinee](https://github.com/rguinee)! - `check-docs-url.js --fix` now re-points today's docs address after a move, and a second run no longer doubles the path. `KNOWN_ROOTS` lists the current `homepage`, and the check fails when it is missing.

- [#193](https://github.com/CruGlobal/cornerstone-design-system/pull/193) [`c6717a2`](https://github.com/CruGlobal/cornerstone-design-system/commit/c6717a2191aed6e856e40e4642427d58c8e7258c) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-drawer>`'s summary and docs now say it slides in from an edge of the viewport, not of a container.

- [#222](https://github.com/CruGlobal/cornerstone-design-system/pull/222) [`5c1c2a8`](https://github.com/CruGlobal/cornerstone-design-system/commit/5c1c2a88f1932c624a08bac3d2fe57e8d621a891) Thanks [@rguinee](https://github.com/rguinee)! - `packages/components/CLAUDE.md` names event classes `Cs<Name>Event`, as the code does, and says to add a changeset instead of editing the changelog page. Contributor guidance only; nothing that ships changes.

- [#200](https://github.com/CruGlobal/cornerstone-design-system/pull/200) [`f4a56f6`](https://github.com/CruGlobal/cornerstone-design-system/commit/f4a56f6cd79c11c156172f5205dea9ef57ff5fee) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-page>` now puts back its measured slot heights, such as `--header-height`, when a DOM morph (Turbo 8, idiomorph, Alpine) resets its `style` attribute.

- [#198](https://github.com/CruGlobal/cornerstone-design-system/pull/198) [`d837a3d`](https://github.com/CruGlobal/cornerstone-design-system/commit/d837a3dd9b4bf978bb0d3a424a30c3acf5bd326d) Thanks [@rguinee](https://github.com/rguinee)! - the `cornerstone` skill's list of valid `<cs-page>` slots now includes every slot the page renders, read from the manifest.

- [#197](https://github.com/CruGlobal/cornerstone-design-system/pull/197) [`b33ecb9`](https://github.com/CruGlobal/cornerstone-design-system/commit/b33ecb977fd938543ef02fc3315faf5bb1221aaf) Thanks [@rguinee](https://github.com/rguinee)! - `<cs-select>`, `<cs-tooltip>` and `<cs-popover>` no longer hide their content when reopened during the close animation, and no longer emit `cs-after-show` when closed during the open animation. Cancelling `cs-hide` on `<cs-select>` now keeps it open.

## 0.6.2

### Fixed

- [#165](https://github.com/CruGlobal/cornerstone-design-system/pull/165) [`8186852`](https://github.com/CruGlobal/cornerstone-design-system/commit/81868526f6ebc2049d424b684459c95e9a9bbced) Thanks [@rguinee](https://github.com/rguinee)! - the Support page's "Open an issue" button now links to the template chooser at `/issues/new/choose` rather than the bare `/issues/new`.

## 0.6.1

### Added

- [#162](https://github.com/CruGlobal/cornerstone-design-system/pull/162) [`823c8ad`](https://github.com/CruGlobal/cornerstone-design-system/commit/823c8ade77dd0aa0a187322d7a19670e0fe5d882) Thanks [@rguinee](https://github.com/rguinee)! - A public roadmap at `/resources/roadmap`, generated from the repository's GitHub milestones.

  - One card per planned release, with curated copy and a count of open questions — no percentage, since a release with nothing open has not been scoped rather than finished
  - Only issues carrying the `roadmap` label render a title; the tracker's decisions stay off the page
  - Fixed: the Support page claimed the packages are published privately. Both are public on npm; the support model is what is internal

### Changed

- [#163](https://github.com/CruGlobal/cornerstone-design-system/pull/163) [`ab4255c`](https://github.com/CruGlobal/cornerstone-design-system/commit/ab4255ccb1c7b238c966a60749a9c78e60262cc1) Thanks [@rguinee](https://github.com/rguinee)! - both packages now share a single version number. `@cruglobal/cornerstone-components` moves from `0.1.3` to align with the design-system package — `0.2` through `0.5` never existed, so no published version is affected.

## 0.1.3

### Added

- [#137](https://github.com/CruGlobal/cornerstone-design-system/pull/137) [`b811a00`](https://github.com/CruGlobal/cornerstone-design-system/commit/b811a00be73db696df9b3a5b2b56be16a9afe15a) Thanks [@rguinee](https://github.com/rguinee)! - A "Why Web Components?" section on the Frameworks page.

  - A table of the six platforms Cru builds on, and how far Cornerstone reaches each
  - The three layers: tokens reach everything, components are the web layer, platform-native implementations are a possible third
  - The trade-offs accepted, and the principles the library was specified against
  - Rails and WordPress badges corrected from "Tested" to "Testing"

### Fixed

- [#130](https://github.com/CruGlobal/cornerstone-design-system/pull/130) [`4f8d9f7`](https://github.com/CruGlobal/cornerstone-design-system/commit/4f8d9f7b96808a2432522383a075df1ed4b824c4) Thanks [@rguinee](https://github.com/rguinee)! - Every component's `@since` now reads `0.1`, the version it actually shipped in.

  The tag carried Web Awesome's numbers — `1.0` through `3.11` across the 70 components — which reached the
  Custom Elements Manifest, and from there the Since badge on every reference page.

- [#138](https://github.com/CruGlobal/cornerstone-design-system/pull/138) [`4c41a78`](https://github.com/CruGlobal/cornerstone-design-system/commit/4c41a784a590ce8dc2d92fea2dce59be545d83de) Thanks [@rguinee](https://github.com/rguinee)! - The changelog page lists released versions instead of one `## Unreleased` block.

  - `0.1.1` and `0.1.2` are generated from `CHANGELOG.md`; `0.1.0` stays hand-written as the fork
  - Each entry's category renders as its bullet icon, with a legend
  - Issue and pull request references render as badges
  - Duplicate category blocks merged, and version anchors fixed to `#v0-1-2`

## 0.1.2

### Changed

- [#114](https://github.com/CruGlobal/cornerstone-design-system/pull/114) [`69cf9e1`](https://github.com/CruGlobal/cornerstone-design-system/commit/69cf9e14d986c8015f229fd6667b07ae2b87398f) Thanks [@rguinee](https://github.com/rguinee)! - **Tooling only — nothing that ships changes.** The component test suite is sharded across four CI runners and Playwright's browsers are cached, cutting the gate from ~29 minutes to ~10.

### Fixed

- [#113](https://github.com/CruGlobal/cornerstone-design-system/pull/113) [`e69a1a9`](https://github.com/CruGlobal/cornerstone-design-system/commit/e69a1a93ec30066de386946aff26492b61c3dd64) Thanks [@rguinee](https://github.com/rguinee)! - Stop `waitForEvent` waiting forever. It now takes a timeout, defaulting to five seconds, and resolves on it rather than rejecting — reaching 14 call sites across eight components.

## 0.1.1

### Added

- [#110](https://github.com/CruGlobal/cornerstone-design-system/pull/110) [`bdda35f`](https://github.com/CruGlobal/cornerstone-design-system/commit/bdda35f3300de39a337b21933664bcf1f2af48fa) Thanks [@rguinee](https://github.com/rguinee)! - Publish the component library to npm as `@cruglobal/cornerstone-components` — public, with provenance — and document how to install it. `prepublishOnly` is `npm run build` rather than `npm run verify`, because the release runner installs no browsers.

### Fixed

- [#112](https://github.com/CruGlobal/cornerstone-design-system/pull/112) [`95f69fb`](https://github.com/CruGlobal/cornerstone-design-system/commit/95f69fb08aa58918da618ab70a631c19ac16b99c) Thanks [@rguinee](https://github.com/rguinee)! - Delete the root `.npmrc`, whose `provenance=true` made every first publish in this workspace impossible.
