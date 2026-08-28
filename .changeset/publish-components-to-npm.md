---
'@cruglobal/cornerstone-components': patch
---

Publish the component library to npm, and document how to install it.

The package sat in `.changeset/config.json`'s `ignore` list because it had never been published and the
registry question — npm under a paid organisation, or GitHub Packages — was open. It is settled: npm,
public, under the same scope the design tokens already publish under. The repository, the documentation
site and the MIT-licensed fork this descends from are all public, so `access: restricted` was gating
distribution of something nothing else hides, while costing a paid seat for every consumer and making the
install instructions on a public documentation site untrue.

**`prepublishOnly` is now `npm run build` rather than `npm run verify`.** Un-ignoring the package put that
hook on the release path for the first time, where it would have failed every release: `verify` ends in a
three-engine Playwright run and the release runner installs no browsers. Nothing is lost — `verify-components`
runs that exact gate on every pull request, and the WebKit session drops recorded in `CLAUDE.md` would have
made releases flaky rather than safe. The tokens package has said `npm run build` here all along.

**The first version is published by hand.** npm only lets a trusted publisher be configured for a package
that already exists, so OIDC cannot bootstrap a new one; `@cruglobal/cornerstone-design-system` hit the same
wall in #38 and #40 and got past it with a short-lived `NPM_TOKEN` in CI. This one goes out from a
maintainer's machine against an interactive 2FA challenge instead, leaving no standing credential behind —
npm removes direct publishing from bypass-2FA tokens in January 2027 regardless.

That is also why `publishConfig` sets `access` and not `provenance`. Trusted publishing attaches a
provenance attestation on its own; the flag exists to turn that off, and setting it true makes `npm publish`
refuse to run anywhere but a CI runner, which is precisely what a first publish cannot be. `packages/tokens`
keeps the flag because it only ever publishes from CI. Once `0.1.0` is on the registry and its trusted
publisher is configured, `release.yml` releases both packages the same way: with provenance, and with no
token.

**The Installation page now installs something.** The site's home page is the Installation entry in the
navigation and is compiled into the agent skill's `references/installation.md`, but it carried no
instructions at all — an import line, and a dead `#installing-via-npm` anchor that `usage.md` links to. It
now covers the install, the two builds in the package and which one a bundler wants, loading the stylesheet
and the components on both paths, the three ways a definition reaches the page — including why the
autoloader is not one of them behind a bundler, since it resolves its imports at runtime from its own
module URL — the `cs-dark` opt-in, and `cs-cloak`. React's install section loses its "not published to npm
yet, install from a tarball" warning, and the two plugin comments that gave "the package is not published"
as their reason for having no CDN tab now give the reason that outlives it: Cru serves the library from no
origin of its own.
