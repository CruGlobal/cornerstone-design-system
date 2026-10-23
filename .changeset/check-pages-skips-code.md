---
'@cruglobal/cornerstone-components': patch
---

Fixed: the docs site's page check skips code, so a `:::` directive, `::roadmap` or Starlight aside markup shown in a code span or block no longer fails it. Docs tooling only; nothing that ships changes.
