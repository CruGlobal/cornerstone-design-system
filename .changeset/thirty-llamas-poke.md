---
"@cruglobal/cornerstone-design-system": patch
---

Flatten `on-*` and `*-container` system color tokens to top-level roles

Previously these tokens were nested under their related role group (e.g. `primary.on-primary`, `primary.primary-container`), which produced doubled CSS variable names like `--sys-color-primary-on-primary` and `--sys-color-primary-primary-container`.

Following industry convention (Material Design 3, GitHub Primer, Shopify Polaris), `on-*` and `*-container` tokens are independent semantic color roles and are now flat peers at the top of `_sys.color`:

- `on-primary`, `on-secondary`, `on-information`, `on-success`, `on-warning`, `on-danger`, `on-surface`, `on-surface-variant`, `on-background`
- `primary-container`, `on-primary-container`, `secondary-container`, `on-secondary-container`, `information-container`, `success-container`, `warning-container`, `danger-container`

Also renames `warning.error-container` → `warning-container` and `danger.error-container` → `danger-container` for consistency.

State groups (`default`, `hover`, `pressed`, `focus`, `disabled`) are unaffected and remain nested within their role groups.

**Migration:** Update any CSS variable references from `--sys-color-{role}-on-{role}` to `--sys-color-on-{role}`, and from `--sys-color-{role}-{role}-container` to `--sys-color-{role}-container`.
