---
paths:
  - ".npmrc"
  - "**/.npmrc"
  - ".github/workflows/release.yml"
  - "package.json"
  - "packages/*/package.json"
  - ".changeset/**"
---

# Publishing: trusted publishing and provenance

Trusted publishing is configured **per package** on npmjs.com, and npm only lets you configure it for a
package that already exists — so a package's very first version has to be published by hand before OIDC
can take over. `@cruglobal/cornerstone-design-system` did that from CI with a short-lived `NPM_TOKEN`
(added in `ca23090`, removed in `900ea4e`); `@cruglobal/cornerstone-components` did it from a maintainer's
machine, answering an interactive 2FA challenge. Prefer the second for the next one: it creates no standing
credential, and npm removes direct publishing from bypass-2FA tokens in January 2027, leaving OIDC and
staged publishing.

Provenance is declared in exactly one place: `packages/tokens`' own `publishConfig`. Trusted publishing
attaches an attestation by itself — the flag exists to turn that _off_ — while setting it true makes
`npm publish` refuse to run anywhere but a CI runner, which is precisely what a first publish cannot be.
A root `.npmrc` carrying `provenance=true` used to apply that to every package in the workspace, and it is
what failed `@cruglobal/cornerstone-components`' bootstrap publish with `Automatic provenance generation
not supported for provider: null`. It bought nothing OIDC was not already doing, so it is gone. The flag
survives only in the tokens manifest, where it reaches one package that publishes from CI and nowhere else.

Neither package runs its test suite at publish time. `prepublishOnly` is `npm run build` in both, because
the release runner installs no browsers — `npm run verify` in `packages/components` ends in a
three-engine Playwright run that would fail there, and CI has already run that exact gate on the commit
being released.
