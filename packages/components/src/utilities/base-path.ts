let basePath = '';
let iconPath = '';

/** Sets the library's base path to the specified directory or URL. */
export function setBasePath(path: string) {
  basePath = path;
}

/**
 * The package root, derived from this module's own URL.
 *
 * Every chunk esbuild emits lands in `chunks/` — `scripts/build.js` sets
 * `chunkNames: 'chunks/[name].[hash]'` for both builds — so this module always resolves exactly one level
 * below the package root, whatever its file is called. `scripts/check-base-path.js` asserts that layout so a
 * chunking change cannot break resolution quietly.
 *
 * This replaces matching `<script src>` against three literal filenames, which was defeated by anything that
 * renamed the file: a fingerprinting asset pipeline's digest, WordPress's `?ver=` query string, or a rename.
 */
function packageRoot() {
  return new URL('../', import.meta.url).href.replace(/\/$/, '');
}

/**
 * Gets the library's base path.
 *
 * The base path is where components, styles and icon assets are loaded from. It resolves in three steps, first
 * match winning:
 *
 * 1. whatever `setBasePath()` was called with;
 * 2. a `data-cornerstone` attribute on any element, which may be a local path or an absolute URL such as a
 *    CDN — `<script src="bundle.js" data-cornerstone="/custom/base/path"></script>`;
 * 3. this module's own location, which needs no configuration and survives digests, query strings, renames
 *    and cross-origin hosting alike.
 *
 * @param subpath - An optional path to append to the base path.
 */
export function getBasePath(subpath = '') {
  if (!basePath) {
    const el = document.querySelector('[data-cornerstone]');
    const attribute = el?.getAttribute('data-cornerstone');

    if (attribute) {
      // Resolve against the document so a relative value works, and keep the origin so a cross-origin value
      // works too. Reading `.pathname` here used to discard the origin, which silently broke the CDN case
      // this doc comment advertises.
      setBasePath(new URL(attribute, window.location.href).href.replace(/\/$/, ''));
    } else {
      setBasePath(packageRoot());
    }
  }

  // Return the base path without a trailing slash. If one exists, append the subpath separated by a slash.
  return basePath.replace(/\/$/, '') + (subpath ? `/${subpath.replace(/^\//, '')}` : ``);
}

/**
 * Sets the path where the default icon library resolves SVG icons from. When set, the default icon library will load
 * icons from this path instead of the Material Symbols CDN. The expected directory structure mirrors the
 * `@material-symbols/svg-{weight}` packages, nested one level deeper by weight, e.g. `{path}/400/sharp/home.svg` or
 * `{path}/400/sharp/star-fill.svg`.
 *
 * This should be called before Cornerstone components are loaded.
 */
export function setIconPath(path: string) {
  iconPath = path;
}

/**
 * Gets the path where the default icon library resolves SVG icons from. When set, the default icon library will load
 * icons from this path instead of the Material Symbols CDN.
 */
export function getIconPath() {
  return iconPath.replace(/\/$/, '');
}
