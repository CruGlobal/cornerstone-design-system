---
"@cruglobal/cornerstone-design-system": major
---

**BREAKING:** restructure `_cmp.accordion` around a `tab` group, syncing the current Figma definition.

Removed:

| Removed | Replacement |
| --- | --- |
| `_cmp.accordion.text.color.primary` | `_cmp.accordion.tab.color.on-surface-expanded` |
| `_cmp.accordion.text.color.secondary` | `_cmp.accordion.tab.color.on-surface-collapsed` |
| `_cmp.accordion.text.color.disabled` | `_cmp.accordion.tab.color.on-surface-disabled` |

Added: `tab.border-width`, `tab.color.{surface,border,on-surface-collapsed,on-surface-expanded,on-surface-disabled}`, `tab.space.{top-bottom,gap}`.

The new shape reflects that the accordion's interactive row is a tab with its own surface, border and spacing, rather than a bare text colour set.
