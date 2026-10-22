/**
 * A built page with its displayed source removed: every `<pre>` block, in any case, and every HTML comment.
 *
 * Shared by the checks that read built pages, because each of them needs the same answer to "what does this page
 * show as source rather than apply or say". Load-bearing in both directions. `native.md` documents
 * `<link rel="stylesheet" href="/dist/styles/themes/default.css">` as a snippet; read literally, that made the whole
 * reference theme, and every hue in `palettes/default.css`, look reachable to `check-tokens.js`, which silently
 * masked the dead-hue bug that check exists to find. Example source is prose about CSS, not CSS.
 *
 * @param {string} html
 * @returns {string}
 */
export const withoutDisplayedSource = (html) =>
  html.replace(/<pre\b[\s\S]*?<\/pre>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
