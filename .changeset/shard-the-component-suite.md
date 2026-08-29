---
'@cruglobal/cornerstone-components': patch
---

**Tooling only — nothing that ships changes.** The component test suite is sharded across four CI runners
and Playwright's browsers are cached, cutting the gate from ~29 minutes to ~10.

`npm run verify` is now `verify:static && test` so the two halves can run as separate jobs, and
`WTR_SHARD=2/4` selects a quarter of the test files. Unset, `npm test` behaves exactly as before.
