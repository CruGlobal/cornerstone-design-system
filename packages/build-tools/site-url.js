/**
 * Where the documentation and the CDN live — the one place either address is written down.
 *
 * The build had asserted **three** different homes, in five source literals, and none of them worked:
 *
 *   - `https://cornerstone.com` — `scripts/agent-skill.js`, `scripts/llms.js`, and the Plop component
 *     template, so every newly scaffolded component was born with a dead `@documentation` tag. The domain
 *     is not Cru's. It resolves to Cornerstone OnDemand, an unrelated company, and `/docs` there is a 404.
 *   - `https://ka-f.cornerstone.com` — `docs/.eleventy.js`, the CDN host the shipped installation guide
 *     tells every reader to load the library from. It is Font Awesome's `ka-f.fontawesome.com` with the
 *     rename applied and it does not resolve at all, so the first and most prominent install path in the
 *     published package could never have worked.
 *   - `https://cruglobal.github.io/cornerstone-components` — `package.json`'s `homepage` and the manifest's
 *     `DOCS_BASE`. The only one that was Cru's, and the placeholder this replaced.
 *
 * Between them those five literals produced **198 files carrying `cornerstone.com` inside the shipped
 * tarball**, 144 of them naming the dead CDN host. Re-pointing that by hand is not a change anyone would
 * make correctly twice, which is what this module is for: the dev has settled that Cru will stand up its
 * own domain doing the same job, so the address needs to be one edit before it is chosen, not after.
 *
 * `DOCS_URL` derives from `package.json`'s `homepage`, so the manifest stays the single source of truth
 * and `npm` shows the same address the documentation does.
 *
 * There is deliberately **no CDN export**. One existed, versioned, deriving a `/cdn/{version}/` path from
 * `DOCS_URL` — but it was never called, nothing in the shipped package contains such a path, and the
 * install guide tells readers to use npm and the autoloader. It was a placeholder for a hosting answer
 * that has not been needed. If Cru ever serves the built library from an origin, that is a hosting
 * decision and belongs here then, not before.
 *
 * `scripts/check-docs-url.js` enforces what this module claims. A JSDoc `@documentation` tag is a literal
 * that no module can reach, so 136 of them named the placeholder host long after `homepage` moved — which
 * put a dead address into 287 shipped files. The claim needs a gate, not a convention.
 *
 * See the documentation-hosting ticket. Nothing here decides where the site deploys; it only makes that
 * decision cheap to apply.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The components package's manifest, by sibling path rather than by module resolution: this package is
// a dependency *of* that one, so resolving it by name would make the workspace dependency circular.
// This is the seam if the documentation address ever moves to the workspace root — see ticket 33.
const packageData = JSON.parse(
  readFileSync(join(dirname(dirname(fileURLToPath(import.meta.url))), 'components', 'package.json'), 'utf8'),
);

/** The documentation root, without a trailing slash. */
export const DOCS_URL = packageData.homepage.replace(/\/$/, '');

/**
 * The origin and the path, split — because GitHub Pages serves a *project* site under `/<repo>/`, and
 * Astro wants those as two separate options: `site` takes the origin, `base` takes the path.
 *
 * Deriving both from one field keeps them consistent. A custom domain later means `homepage` loses its
 * path, `DOCS_BASE_PATH` becomes `/`, and nothing else changes.
 */
export const DOCS_ORIGIN = new URL(DOCS_URL).origin;

/** The path the site is served under, with a leading slash and no trailing one. `''` at a domain root. */
export const DOCS_BASE_PATH = new URL(DOCS_URL).pathname.replace(/\/$/, '');

/**
 * Prefixes a root-absolute asset path with the base the site is served under.
 *
 * Astro serves `public/` under `base`, so `public/dist/cornerstone.loader.js` is reachable at
 * `{base}/dist/cornerstone.loader.js`. A bare `/dist/...` reference is a 404 on a project site and works
 * only at a domain root, which is why every live asset reference goes through here.
 */
export const asset = (path) => `${DOCS_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;

/** The component reference, which every `@documentation` tag and every CEM reference points into. */
export const DOCS_COMPONENTS_URL = `${DOCS_URL}/components`;
