---
"@cruglobal/cornerstone-design-system": patch
---

Record the decision brief for the `onboard` / `setup-cornerstone-skills` tier conflict at `docs/analysis/onboard-tier-conflict.md`.

#75 decided to fold consumer onboarding into a context-aware `setup-cornerstone-skills`. That skill lives in the `cornerstone-skills` plugin, which #67 deliberately kept out of the base tier so a CSS-only consumer would not have 25 general engineering skills installed to satisfy pointers they cannot reach. The base tier's manifest declares no `dependencies` at all — correct per #67 — so the fold would put consumer onboarding somewhere consumers do not install it.

**Resolved: do not perform the fold.** `onboard` stays a command in the base `cornerstone` plugin, where it already satisfies every reachability requirement today. #75's other half stands unchanged — `design-review` is retired. The cost of not folding is that `commands/` is the older layout and #61's skill migration stays unexecuted for `onboard`, which is cosmetic next to making the guide unreachable for the audience it exists to serve.
