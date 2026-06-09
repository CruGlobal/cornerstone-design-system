# @cruglobal/cornerstone-design-system

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
