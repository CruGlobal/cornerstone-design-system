import { visit } from 'unist-util-visit';
import { highlightCode } from './highlight-code.js';

/**
 * Highlights every code block and gives each one a copy button.
 *
 * This is the pair of Eleventy transformers `highlight-code.js` and `copy-code.js`, merged into one
 * rehype pass. It runs over the whole document rather than only the example panels, so an authored
 * ```js fence in the Importing block gets the same treatment as an example's source — which is what
 * kept the Eleventy site visually consistent.
 *
 * The id shape is a contract, not decoration. `copy-code.css` selects `pre[id*='code-block-']` and
 * `code-highlighter.css` keys off the same, so both stylesheets port across unedited. The copy button
 * reads its text from the inner `<code>` by id, which is why both elements are named.
 *
 * Ids are derived from the block's position rather than a random uuid. The Eleventy site minted a
 * `crypto.randomUUID()` per block, which made every build produce a different document; a positional id
 * is stable, so a diff of the built output shows real changes only.
 */
export function rehypeCodeBlocks() {
  return (tree) => {
    let index = 0;

    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') {
        return;
      }

      const code = node.children.find((child) => child.type === 'element' && child.tagName === 'code');

      if (!code) {
        return;
      }

      const classes = Array.isArray(code.properties?.className) ? code.properties.className : [];
      const language = classes.find((name) => String(name).startsWith('language-'))?.replace(/^language-/, '');

      const preId = node.properties?.id ?? `code-block-${(index += 1)}`;
      const codeId = code.properties?.id ?? `${preId}-inner`;

      // Kept out of the search index. Pagefind takes its excerpts from body text, and a reference page is mostly
      // example source — so a search for "callout" was returning the raw markup of a demo as its summary rather
      // than the sentence that describes the component. The API tables are real tables, not code blocks, so
      // attribute and property names stay findable; what stops being searchable is the inside of an example.
      node.properties = {
        ...node.properties,
        id: preId,
        'data-pagefind-ignore': true,
      };
      code.properties = { ...code.properties, id: codeId };

      if (language) {
        const text = code.children
          .filter((child) => child.type === 'text')
          .map((child) => child.value)
          .join('');
        const highlighted = highlightCode(text, language);

        if (highlighted) {
          code.children = [{ type: 'raw', value: highlighted }];
        }
      }

      node.children.push({
        type: 'element',
        tagName: 'cs-copy-button',
        // `cs-dark` because the code surface is dark in both page themes, so the button's own colours
        // have to be the dark set regardless of the page.
        properties: { from: codeId, class: 'copy-button cs-dark' },
        children: [],
      });
    });
  };
}
