---
"@cruglobal/cornerstone-design-system": minor
---

**BREAKING CHANGE (shipped as `minor` — this package is still pre-1.0, where semver permits breaking changes in a minor release).** Restructure `_sys.color` surface and state tokens, flattening the nested `surface.*` group and removing the `surface-container.*` ramp. Syncs the MOA design-system work from Figma. The following 19 `_sys` tokens are **removed in all four modes** (`cru-light`, `cru-dark`, `fl-light`, `fl-dark`):

| Removed | Replacement |
| --- | --- |
| `_sys.color.surface.default` | `_sys.color.action-surface.default` |
| `_sys.color.surface.hover` | `_sys.color.action-surface.hover` |
| `_sys.color.surface.selected` | `_sys.color.action-surface.selected` |
| `_sys.color.surface.bright` | `_sys.color.surface-bright` |
| `_sys.color.surface.dim` | `_sys.color.surface-dim` |
| `_sys.color.surface.variant` | `_sys.color.surface-variant` |
| `_sys.color.surface.inverse-surface` | `_sys.color.inverse-surface` |
| `_sys.color.surface.inverse-on-surface` | `_sys.color.inverse-on-surface` |
| `_sys.color.surface.inverse-on-surface-variant` | `_sys.color.inverse-on-surface-variant` |
| `_sys.color.surface.container` | none — use `surface-variant` |
| `_sys.color.surface-container.lowest` / `.low` / `.high` / `.highest` | none — use `surface-bright` / `surface-dim` / `surface-variant` |
| `_sys.color.background.default` | `_sys.color.background` |
| `_sys.color.primary.disabled` | `_sys.color.disabled.default` |
| `_sys.color.secondary.disabled` | `_sys.color.disabled.default` |
| `_sys.color.outline-variant.default` / `.hover` | `_sys.color.outline.default` / `.hover` |

Also removes `_cmp.button.secondary.filled.color.surface-focused` (superseded by `surface-focus`).

Consumers referencing any removed token by its CSS custom property, SCSS variable, or JS export must migrate to the replacement above. `_cmp` tokens shipped in this package were updated in the same change, so components consuming only `_cmp` tokens need no action.
