---
'@cruglobal/cornerstone-components': patch
---

Shard the component suite across four runners and cache Playwright's browsers.

The gate was ~28 minutes, and almost all of it was serial rather than heavy. `concurrency` in
`web-test-runner.config.js` resolves to `max(floor((cores - 3) / 3), 1)`, which on a 4-core GitHub runner is
**1** — so each engine walked all 76 test files one page at a time, and the three engines already ran in
parallel with one another. Splitting by engine would have bought close to nothing; the file list was the
only axis with parallelism left in it.

`WTR_SHARD=2/4` now selects a quarter of the files, round-robin over the sorted list rather than in
contiguous chunks, since neighbouring test files tend to be related and similarly expensive. Unset, every
file runs, so `npm test` is unchanged for a developer. A malformed value throws rather than silently
selecting nothing.

Sharding meant breaking `npm run verify` into two CI jobs, which the previous single-job design avoided on
the grounds that CI should run exactly the command a developer runs. The split therefore lives in
`package.json` — `verify:static` is everything that is not the browser suite, and `verify` is
`verify:static && test` — so both halves stay runnable by hand and the CI graph cannot drift from the local
gate the way a list of YAML steps would.

The browsers are ~400 MB and only a Playwright bump invalidates them, so they are cached against the
lockfile hash; the version is pinned by the root `overrides`, which makes that hash change exactly when the
browsers need to. A cache hit still runs `playwright install-deps`, because `--with-deps` also installs apt
packages that live outside the cached directory.

Four shorter runs should also thin the failure CLAUDE.md records, where WebKit stops being able to open
pages near the end of a long run: no shard has a long tail any more.
