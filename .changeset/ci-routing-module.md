---
'@cruglobal/cornerstone-components': patch
---

Changed: CI decides which jobs a change needs in one tested module, runs the token checks as one job only when a change can reach them, and checks for a changeset without installing the workspace. Repository tooling only; nothing that ships changes.
