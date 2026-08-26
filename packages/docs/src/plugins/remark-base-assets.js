/**
 * Rewrites root-absolute asset references in raw HTML so they resolve under the site's base path.
 *
 * The site is served under a base — GitHub Pages gives a project site `/<repo>/` — and Astro serves
 * `public/` under it rather than at the domain root. Astro rewrites its own routes and
 * `import.meta.env.BASE_URL`, but it never touches a path written into content. So
 * `src="/assets/images/logo.svg"` is a 404 in production and correct on a developer's machine at a domain
 * root, which is the worse way round: the failure appears only where nobody is looking.
 *
 * This has to run over `html` nodes rather than at the rehype stage. Markdown's raw HTML stays a single raw
 * node all the way through unless `rehype-raw` is enabled, and this site's pages use raw HTML heavily —
 * so does `remark-examples.js`, which emits the live copy of every example as one `html` node. A rehype pass
 * over element attributes sees none of it.
 *
 * Registered last, so it sees what the other plugins emit as well as what the author wrote.
 *
 * Displayed source is untouched, because by this point a fenced block is a `code` node and not an `html`
 * one. That is deliberate: a reader should not be shown this site's deployment path inside an import
 * statement or a script tag.
 */
import { DOCS_BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { visit } from 'unist-util-visit';

/** The directories this site serves out of `public/`. Anything else absolute belongs to someone else. */
const OURS = ['/dist/', '/assets/', '/scripts/', '/patterns/'];

export function remarkBaseAssets() {
  return (tree) => {
    // At a domain root there is nothing to prefix, and the walk is pure cost.
    if (!DOCS_BASE_PATH) {
      return;
    }

    visit(tree, 'html', (node) => {
      let value = node.value;
      for (const dir of OURS) {
        // Quoted only, so a path inside prose or a comment is left alone. Both quote styles appear.
        value = value
          .replaceAll(`"${dir}`, `"${DOCS_BASE_PATH}${dir}`)
          .replaceAll(`'${dir}`, `'${DOCS_BASE_PATH}${dir}`);
      }
      node.value = value;
    });
  };
}
