# @cruglobal/cornerstone-design-system

## 0.5.1

### Patch Changes

- [#56](https://github.com/CruGlobal/cornerstone-design-system/pull/56) [`dbf7b8b`](https://github.com/CruGlobal/cornerstone-design-system/commit/dbf7b8bdcd81d83feb18eae0a04b0ef35a8319ee) Thanks [@rguinee](https://github.com/rguinee)! - Fix `cru-dark` font families for body, label and button text.

  `_sys.string.font-family.{body,label,button}` aliased `_ref.string.font-family.cru.brand.sans-primary` (Sora, the display face) instead of `sans-secondary` (Inter). `cru-light` had the correct values, so only dark mode was affected — meaning published `cru-dark` rendered all body copy, form labels and button text in a display typeface.

  Figma had the correct values throughout; the repo had drifted.

- [#57](https://github.com/CruGlobal/cornerstone-design-system/pull/57) [`6868fe3`](https://github.com/CruGlobal/cornerstone-design-system/commit/6868fe312ff2c6ce2fb994ac77e3abbdb99ef2c7) Thanks [@rguinee](https://github.com/rguinee)! - Fix `_sys.number.space.none` and `cru-dark` body font weights.

  **`space.none` was not zero.** It aliased `_ref.number.space.2` in `cru-dark`, `fl-light` and `fl-dark` — only `cru-light` was correct — so a token named `none` emitted `2px` in three of four modes. Any component using it for zero padding or gap picked up 2px instead. Now `_ref.number.space.0` everywhere, emitting `0px`.

  **`cru-dark` body font weights** were `500` for `typography.body.{lg,md,sm}` where every other cru mode uses `400`, so dark-mode body copy rendered semi-bold. Now `400`, matching `cru-light`. The `500` weight remains correct for the `fl` modes, where Akkurat needs the extra weight at body sizes.

  After this change all four `sys/number` subtrees match the Figma file exactly.

## 0.5.0

### Minor Changes

- [#76](https://github.com/CruGlobal/cornerstone-design-system/pull/76) [`1e3069d`](https://github.com/CruGlobal/cornerstone-design-system/commit/1e3069dcd21399aa02fd744816b67cf8a08d4a22) Thanks [@rguinee](https://github.com/rguinee)! - Add the `cornerstone-skills` plugin: 25 general-purpose engineering and productivity skills forked from mattpocock/skills (MIT), scoped to Cornerstone's contributor personas. Two skills renamed (`ask-matt` → `ask`, `setup-matt-pocock-skills` → `setup-cornerstone-skills`) with all cross-references updated.

- [#49](https://github.com/CruGlobal/cornerstone-design-system/pull/49) [`c9d19b5`](https://github.com/CruGlobal/cornerstone-design-system/commit/c9d19b51c9fa9a7b198756f08f58eaa78245e4c4) Thanks [@rguinee](https://github.com/rguinee)! - Add a Material UI theme adapter under `libraries/mui` (new `./mui` export). `createCornerstoneTheme({ brand, mode })` and `cornerstoneThemeOptions()` map Cornerstone `_sys` tokens onto an MUI theme so MUI apps (mpdx-react, give-web) render with Cru / FamilyLife brand colors, typography, and radius. `@mui/material` is an optional peer dependency.

- [#50](https://github.com/CruGlobal/cornerstone-design-system/pull/50) [`e0d0bd8`](https://github.com/CruGlobal/cornerstone-design-system/commit/e0d0bd8adf909f7157f00f33903a2e174de0a3cd) Thanks [@rguinee](https://github.com/rguinee)! - Add 28 new `_sys.color` tokens across all four modes.

  **Status roles** — these complete the status families so components no longer have to reach for a neighbouring token:
  - `on-{information,success,warning,danger}-container` — foreground for content sitting on a `*-container` surface.
  - `{information,success,warning,danger}-outline` — border for a tinted container.
  - `{information,success,warning,danger}-on-inverse` — status colour for use **on an inverted surface** (`inverse-surface`). Needed because `<status>/default` inverts the wrong way there and drops below 3:1 in the dark modes, while `<status>-container` inverts correctly but is too low-chroma to distinguish hues. Each value is the most chromatic ramp step that still clears 4.5:1 against that mode's `inverse-surface`.
  - `success.on-pressed`, `warning.on-pressed` — foreground for the pressed state.

  **Structural roles** introduced by the surface restructure (see the accompanying major changeset for the tokens they replace):
  - `action-surface.{default,hover,pressed,selected}` — interactive surface states.
  - `surface-bright`, `surface-dim`, `surface-variant`, `background` — flattened surface roles.
  - `inverse-surface`, `inverse-surface-dim`, `inverse-on-surface`, `inverse-on-surface-variant`.
  - `disabled.default` — single disabled colour replacing the per-family variants.
  - `outline.dark`.

- [#50](https://github.com/CruGlobal/cornerstone-design-system/pull/50) [`e0d0bd8`](https://github.com/CruGlobal/cornerstone-design-system/commit/e0d0bd8adf909f7157f00f33903a2e174de0a3cd) Thanks [@rguinee](https://github.com/rguinee)! - **BREAKING CHANGE (shipped as `minor` — this package is still pre-1.0, where semver permits breaking changes in a minor release).** Restructure `_sys.color` surface and state tokens, flattening the nested `surface.*` group and removing the `surface-container.*` ramp. Syncs the MOA design-system work from Figma. The following 19 `_sys` tokens are **removed in all four modes** (`cru-light`, `cru-dark`, `fl-light`, `fl-dark`):

  | Removed                                                               | Replacement                                                     |
  | --------------------------------------------------------------------- | --------------------------------------------------------------- |
  | `_sys.color.surface.default`                                          | `_sys.color.action-surface.default`                             |
  | `_sys.color.surface.hover`                                            | `_sys.color.action-surface.hover`                               |
  | `_sys.color.surface.selected`                                         | `_sys.color.action-surface.selected`                            |
  | `_sys.color.surface.bright`                                           | `_sys.color.surface-bright`                                     |
  | `_sys.color.surface.dim`                                              | `_sys.color.surface-dim`                                        |
  | `_sys.color.surface.variant`                                          | `_sys.color.surface-variant`                                    |
  | `_sys.color.surface.inverse-surface`                                  | `_sys.color.inverse-surface`                                    |
  | `_sys.color.surface.inverse-on-surface`                               | `_sys.color.inverse-on-surface`                                 |
  | `_sys.color.surface.inverse-on-surface-variant`                       | `_sys.color.inverse-on-surface-variant`                         |
  | `_sys.color.surface.container`                                        | none — use `surface-variant`                                    |
  | `_sys.color.surface-container.lowest` / `.low` / `.high` / `.highest` | none — use `surface-bright` / `surface-dim` / `surface-variant` |
  | `_sys.color.background.default`                                       | `_sys.color.background`                                         |
  | `_sys.color.primary.disabled`                                         | `_sys.color.disabled.default`                                   |
  | `_sys.color.secondary.disabled`                                       | `_sys.color.disabled.default`                                   |
  | `_sys.color.outline-variant.default` / `.hover`                       | `_sys.color.outline.default` / `.hover`                         |

  Also removes `_cmp.button.secondary.filled.color.surface-focused` (superseded by `surface-focus`).

  Consumers referencing any removed token by its CSS custom property, SCSS variable, or JS export must migrate to the replacement above. `_cmp` tokens shipped in this package were updated in the same change, so components consuming only `_cmp` tokens need no action.

### Patch Changes

- [#78](https://github.com/CruGlobal/cornerstone-design-system/pull/78) [`8c7111a`](https://github.com/CruGlobal/cornerstone-design-system/commit/8c7111ae14953102cee94c6d5c252b54e95226c5) Thanks [@rguinee](https://github.com/rguinee)! - Bump js-yaml and brace-expansion (transitive dev dependencies) to patch Dependabot security advisories. No token API changes.

- [#47](https://github.com/CruGlobal/cornerstone-design-system/pull/47) [`ddf0e1a`](https://github.com/CruGlobal/cornerstone-design-system/commit/ddf0e1a7b4599953085b3a8cf6dbd3412b205236) Thanks [@rguinee](https://github.com/rguinee)! - Make the `/design-review` command configurable via `$ARGUMENTS` flags: `--passes` (tokens/heuristics/wcag/all), `--scope` (diff/path/Figma/screenshot), `--output` (report/overlay/apply), and `--severity` (minimum severity to surface). Defaults reproduce the prior full-report behavior. `--output overlay` is capability-gated and syncs findings into a project's in-app audit overlay (via `ui_audit:add`) when available, falling back to a report otherwise.

- [#77](https://github.com/CruGlobal/cornerstone-design-system/pull/77) [`0ccb863`](https://github.com/CruGlobal/cornerstone-design-system/commit/0ccb863795f77ff5192d8a33dcd7d537f47017f4) Thanks [@rguinee](https://github.com/rguinee)! - Mark the `/design-review` command deprecated (tokens/accessibility checks are moving to deterministic CI checks — see UIUX-93/96/97/98/100) and remove its now-dangling reference from `/onboard`'s follow-up suggestions. `design-review.md` stays in place for reference; no command is removed.

- [#81](https://github.com/CruGlobal/cornerstone-design-system/pull/81) [`5b16f12`](https://github.com/CruGlobal/cornerstone-design-system/commit/5b16f12dd342ae42a14c2a0301d1e70d4780a8ec) Thanks [@rguinee](https://github.com/rguinee)! - Correct CLAUDE.md's build-pipeline documentation to say Style Dictionary 5.x, matching the dependency bump merged in #48. No functional change.

- [#50](https://github.com/CruGlobal/cornerstone-design-system/pull/50) [`e0d0bd8`](https://github.com/CruGlobal/cornerstone-design-system/commit/e0d0bd8adf909f7157f00f33903a2e174de0a3cd) Thanks [@rguinee](https://github.com/rguinee)! - Retarget `_sys.color` values. No token names change; only what they alias.

  **Status colour accessibility fixes.** Every status pair now meets WCAG AA in all four modes (previous minimums in brackets):
  - `fl-light` / `fl-dark`: `on-<status>-container` had been aliased to the _same_ `_ref` as `<status>-container` for all four statuses, rendering text and icons invisible (1.00:1). Now 13.5–16:1.
  - `fl-light`: `on-<status>` was `contrast/white` over pale mid-tones — danger measured 1.82:1. Now aliases the hue's `/900`, giving 5.8–8.3:1.
  - `cru-dark`: `on-danger` was 3.78:1. Now 4.84:1.
  - 11 `<status>-outline` tokens were aliased identically to their own container across `cru-dark`, `fl-light` and `fl-dark`, so the border was invisible.

  **Dark-mode status retune.** `cru-dark` and `fl-dark` filled status colours were retargeted for consistent perceptual lightness — the L\* spread across the four statuses drops from 18 points to 7. `cru-dark` success moves off the pastel `cru/mint` ramp to `cru/green`, which is what made it read sage; its container and outline moved with it.

  **FamilyLife retune.** `fl-dark` `<status>-container` sat at `hue/900` (L\* 6–15, effectively black) and is now `/800`, or `/600` for `dark-green`. `fl-dark` fills moved off the desaturated dark steps — FL ramps lose chroma as they darken, so anything past `/500` reads muddy. `fl-light` filled L\* spread drops from 37 to 15.

  **MOA colour changes** carried over in the same sync: `cru-light` `secondary.*` moves from `orange` to `graphite`, `link.*` from `navy` to `turquoise`; `cru-dark` `link.*` to `sky`; plus `on-secondary`, `secondary-container` and `on-secondary-container` retargets.

  `_cmp` tokens for `breadcrumb`, `button`, `card`, `links`, `menu` and `paper` were retargeted onto the renamed `_sys` roles in the same change — 18 aliases in total — which is what keeps `npm run validate` passing.

## 0.4.1

### Patch Changes

- [#45](https://github.com/CruGlobal/cornerstone-design-system/pull/45) [`899379d`](https://github.com/CruGlobal/cornerstone-design-system/commit/899379d873ddf853fdb5af50bca2a7422cc41ccd) Thanks [@rguinee](https://github.com/rguinee)! - Add a Claude Code plugin (`cornerstone@cru`) bundling the `/onboard` and `/design-review` commands, distributed via the `cru` plugin marketplace. Consumers install it with `/plugin marketplace add CruGlobal/cornerstone-design-system` then `/plugin install cornerstone@cru`.

## 0.4.0

### Minor Changes

- [#43](https://github.com/CruGlobal/cornerstone-design-system/pull/43) [`ba80ca4`](https://github.com/CruGlobal/cornerstone-design-system/commit/ba80ca44719318a2af015502c7cc5791613f3455) Thanks [@rguinee](https://github.com/rguinee)! - Add Cru ministry icon library, `/onboard` and `/design-review` Claude commands, and improved consumer-facing README documentation.

## 0.3.2

### Patch Changes

- [#40](https://github.com/CruGlobal/cornerstone-design-system/pull/40) [`6f78634`](https://github.com/CruGlobal/cornerstone-design-system/commit/6f786348014a21167afc70ec36feec63be5af45f) Thanks [@rguinee](https://github.com/rguinee)! - Upgrade the npm CLI used in the release workflow from the pinned 11.5.1 to the latest release. npm 11.5.1 is the GA-boundary version with known OIDC trusted-publishing bugs that surface as a misleading `ENEEDAUTH` error during publish; upgrading resolves the authentication failure so the package can publish via trusted publishing.

## 0.3.1

### Patch Changes

- [#38](https://github.com/CruGlobal/cornerstone-design-system/pull/38) [`b9f3dc8`](https://github.com/CruGlobal/cornerstone-design-system/commit/b9f3dc874c291e54a1ae7ffaf7c933c486138a75) Thanks [@rguinee](https://github.com/rguinee)! - Fix the release pipeline so the package publishes via npm trusted publishing (OIDC). The previous version was versioned but never published because the publish step failed authentication and an empty changeset then blocked the retry. This patch routes the release through the normal changesets flow.

## 0.3.0

### Minor Changes

- [#35](https://github.com/CruGlobal/cornerstone-design-system/pull/35) [`a8a42b7`](https://github.com/CruGlobal/cornerstone-design-system/commit/a8a42b7d1d39e5a47b785e5a774d7dd22b751ac9) Thanks [@rguinee](https://github.com/rguinee)! - Add DaisyUI theme overrides for `cru-light` and `cru-dark` in `libraries/daisyui.css`

## 0.2.1

### Patch Changes

- [#30](https://github.com/CruGlobal/cornerstone-design-system/pull/30) [`93b8adc`](https://github.com/CruGlobal/cornerstone-design-system/commit/93b8adcef838f6c033ad2b98ac846697e33dce54) Thanks [@rguinee](https://github.com/rguinee)! - Fix version script to update package-lock.json after changeset version bump.

## 0.2.0

### Minor Changes

- [#18](https://github.com/CruGlobal/cornerstone-design-system/pull/18) [`70398c8`](https://github.com/CruGlobal/cornerstone-design-system/commit/70398c802785c8d380ee44db2a2c93bd785d58d0) Thanks [@rguinee](https://github.com/rguinee)! - Add diff-detecting Figma token pipeline and initial W3C DTCG token tree: tokens/ref.json, four sys mode files (cru-light, cru-dark, fl-light, fl-dark), and eight cmp files (accordion, breadcrumb, button, card, links, menu, paper, text-field).

### Patch Changes

- [#26](https://github.com/CruGlobal/cornerstone-design-system/pull/26) [`df30415`](https://github.com/CruGlobal/cornerstone-design-system/commit/df304156da6c6305be5a4327cb6fe7a53f020700) Thanks [@rguinee](https://github.com/rguinee)! - Flatten `on-*` and `*-container` system color tokens to top-level roles

  Previously these tokens were nested under their related role group (e.g. `primary.on-primary`, `primary.primary-container`), which produced doubled CSS variable names like `--sys-color-primary-on-primary` and `--sys-color-primary-primary-container`.

  Following industry convention (Material Design 3, GitHub Primer, Shopify Polaris), `on-*` and `*-container` tokens are independent semantic color roles and are now flat peers at the top of `_sys.color`:
  - `on-primary`, `on-secondary`, `on-information`, `on-success`, `on-warning`, `on-danger`, `on-surface`, `on-surface-variant`, `on-background`
  - `primary-container`, `on-primary-container`, `secondary-container`, `on-secondary-container`, `information-container`, `success-container`, `warning-container`, `danger-container`

  Also renames `warning.error-container` → `warning-container` and `danger.error-container` → `danger-container` for consistency.

  State groups (`default`, `hover`, `pressed`, `focus`, `disabled`) are unaffected and remain nested within their role groups.

  **Migration:** Update any CSS variable references from `--sys-color-{role}-on-{role}` to `--sys-color-on-{role}`, and from `--sys-color-{role}-{role}-container` to `--sys-color-{role}-container`.
