import Prism from 'prismjs';
import PrismLoader from 'prismjs/components/index.js';
import 'prismjs/plugins/custom-class/prism-custom-class.js';

/**
 * Syntax highlighting, with Prism.
 *
 * Ported unchanged in behaviour from the Eleventy site's `docs/_transformers/highlight-code.js`,
 * including the `code-` class prefix, because the stylesheet that colours the output selects on it:
 * `code-token`, `code-tag`, `code-keyword` and so on.
 *
 * Prism rather than Starlight's Expressive Code, deliberately. Expressive Code renders through Shiki,
 * which bakes each token's colour into the markup as an inline hex value. The Eleventy stylesheet
 * instead resolves every token colour through a `--cs-*` token — `var(--code-keyword,
 * var(--cs-color-purple-70))` — so code follows the brand along with everything else. In a library whose
 * whole theming effort is generating colour per brand, a code block that cannot follow a brand is the
 * wrong trade. Nothing imports Starlight's `<Code>` component, so Expressive Code is switched off and
 * there is one highlighter in the build rather than two.
 */

PrismLoader('diff');
PrismLoader.silent = true;
Prism.plugins.customClass.prefix('code-');

/**
 * Highlights a string of code.
 *
 * @param {string} code The code to highlight.
 * @param {string} language A Prism language name. `diff-*` renders as a diff of that language.
 */
export function highlightCode(code, language = 'plain') {
  const alias = language.replace(/^diff-/, '');
  const isDiff = /^diff-/i.test(language);

  if (!Prism.languages[alias]) {
    PrismLoader(alias);

    if (!Prism.languages[alias]) {
      // Unlike the Eleventy transformer this does not throw. A reference page is authored markdown,
      // and one unknown language in one fence should leave that block unhighlighted rather than fail
      // a 70-page build.
      return null;
    }
  }

  if (isDiff) {
    Prism.languages[language] = Prism.languages.diff;
  }

  return Prism.highlight(code, Prism.languages[language], language);
}
