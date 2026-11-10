---
'@cruglobal/cornerstone-components': patch
---

Changed: CI decides which jobs a change needs in one tested module, runs the token checks as one job only when a change can reach them, and checks each pull request's changeset against the changeset rules, read with the parser the release uses. Repository tooling only; nothing that ships changes.
