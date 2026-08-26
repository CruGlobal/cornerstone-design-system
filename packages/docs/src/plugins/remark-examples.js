import { visit } from 'unist-util-visit';

/**
 * Turns ```html {.example} fences into the live-example card.
 *
 * The fence syntax is the one the reference pages already use, so no page is edited to move here: a
 * remark plugin reads `node.meta` itself, which is what markdown-it-attrs did on the Eleventy side.
 *
 * The emitted structure matches `docs/_transformers/code-examples.js:164-233` element for element and
 * class for class, because three other things select into it and none of them is negotiable:
 *
 *   - `code-examples.css` styles the card, and positions `.code-example-resizer` against
 *     `.code-example-preview` — without that wrapper the resizer has no positioned ancestor.
 *   - `code-examples.js` toggles `.open`, `.is-animating`, `.is-dragging`, `.is-syncing-scheme` and
 *     `cs-light`/`cs-dark`, and reads the collapse durations back out of computed style.
 *   - `component-anatomy.js` finds the example it clones with `.code-example-content[data-anatomy-subject]`.
 *
 * The example body is emitted twice from one source: once as raw HTML into the page's light DOM, where
 * the custom elements upgrade and the demo runs, and once as the original code node so the source panel
 * shows it. It has to be the code node rather than a fence inside a raw HTML block — markdown nested in
 * raw HTML is not parsed, so a fence there reaches the reader as literal backticks.
 *
 * Two of Eleventy's controls are not reproduced. The CodePen "Edit" button posted to a Font Awesome kit
 * on a host Cru does not own, so it is dropped rather than pointed somewhere invented. And
 * `.no-preview` / `.no-buttons` are not implemented: no fence in the corpus uses either.
 *
 * Icon `src` values are placeholders. Only the class names are load-bearing — the stylesheet rotates
 * `.code-example-toggle cs-icon` and swaps `.code-example-theme-light` against `-dark` — so these swap
 * cleanly when the library moves to Material Symbols.
 */

/** Flags a fence can carry, beyond `.example` itself. */
const FLAGS = ['anatomy', 'anatomy-only', 'no-edit', 'no-dir', 'no-color-scheme', 'open'];

const icon = (name, rest = '') => `<cs-icon name="${name}"${rest ? ` ${rest}` : ''}></cs-icon>`;

/**
 * A preview containing an iframe cannot be re-themed or flipped from the host page — a class on the
 * host does not reach into another document — so those two controls are omitted, as Eleventy did.
 */
const hasFrame = (code) => /<(iframe|cs-zoomable-frame)\b/.test(code);

export function remarkExamples() {
  return (tree) => {
    let counter = 0;

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'html' || !node.meta?.includes('.example') || index === undefined) {
        return;
      }

      const flags = new Set(
        [...node.meta.matchAll(/\.([a-z-]+)/g)].map((match) => match[1]).filter((flag) => FLAGS.includes(flag)),
      );

      const isAnatomy = flags.has('anatomy') || flags.has('anatomy-only');
      const isOpen = flags.has('open');
      const framed = hasFrame(node.value);
      const sourceId = `code-example-${(counter += 1)}`;

      const buttons = [
        `<button class="code-example-toggle" type="button" aria-expanded="${isOpen}" aria-controls="${sourceId}">Code ${icon('keyboard_arrow_down')}</button>`,
        !framed &&
          !flags.has('no-color-scheme') &&
          `<button class="code-example-theme" type="button">` +
            `${icon('light_mode', 'class="code-example-theme-light" label="Show in dark mode"')}` +
            `${icon('dark_mode', 'class="code-example-theme-dark" label="Show in light mode"')}` +
            `</button>`,
        !framed &&
          !flags.has('no-dir') &&
          `<button class="code-example-dir" type="button">` +
            `${icon('format_align_left', 'class="code-example-dir-ltr" label="Change direction to RTL"')}` +
            `${icon('format_align_right', 'class="code-example-dir-rtl" label="Change direction to LTR"')}` +
            `</button>`,
      ].filter(Boolean);

      const classes = [
        'code-example',
        'cs-not-prose',
        isOpen && 'open',
        flags.has('anatomy-only') && 'code-example-anatomy-only',
      ]
        .filter(Boolean)
        .join(' ');

      parent.children.splice(
        index,
        1,
        {
          type: 'html',
          value:
            `<div class="${classes}">` +
            `<div class="code-example-preview cs-not-prose">` +
            `<div class="code-example-content"${isAnatomy ? ' data-anatomy-subject="true"' : ''}>${node.value}</div>` +
            `<div class="code-example-resizer" aria-hidden="true">${icon('drag_indicator')}</div>` +
            `</div>` +
            `<div class="code-example-source" id="${sourceId}" role="region" aria-label="Example source code"${isOpen ? '' : ' aria-hidden="true"'}>`,
        },
        { ...node, meta: null },
        {
          type: 'html',
          value: `</div><div class="code-example-buttons">${buttons.join('')}</div></div>`,
        },
      );

      // Skip the three nodes just spliced in, or the code node is visited again.
      return index + 3;
    });
  };
}
