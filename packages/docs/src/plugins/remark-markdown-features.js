import { visit } from 'unist-util-visit';

/**
 * Restores the three markdown extensions the Eleventy site had and Starlight does not.
 *
 * Without these, authored content reaches the reader as source: `:::info` blocks lose their callout,
 * `[[Left]]` prints its own brackets, and `==text==` prints its equals signs. All three are silent —
 * the build passes and the page looks finished — so they are handled here rather than by editing 44
 * pages to work around a missing plugin.
 *
 * The containers become `<cs-callout>`, which is both what Eleventy emitted (docs/_utils/markdown.js:24-50)
 * and what the design skill's ladder requires: a callout is a component the system already has, so the
 * site uses it rather than restyling Starlight's own aside. Variant and icon names are carried across
 * unchanged, and each was checked against the component's manifest entry before use — `cs-callout`
 * documents an `icon` slot and the variants `brand | neutral | success | warning | danger`.
 *
 * The icons render in Material Symbols' default outlined cut. Eleventy drew Font Awesome glyphs through
 * upstream's Pro kit, so the names here are not the ones it used.
 *
 * Starlight's native `:::note` / `:::tip` / `:::caution` / `:::danger` asides are left alone. Nothing in
 * the reference authors them, and taking them over would mean owning Starlight's aside markup for no
 * gain.
 */

/** The container types the reference actually uses, with the markup Eleventy gave each. */
const CALLOUTS = {
  info: { variant: 'brand', icon: 'lightbulb' },
  warning: { variant: 'warning', icon: 'warning' },
  new: { variant: 'neutral', icon: 'campaign', className: 'new' },
};

/** Splits a text node on a pattern, replacing each match with a raw HTML node. */
function replaceInText(node, index, parent, pattern, toHtml) {
  const parts = [];
  let last = 0;

  for (const match of node.value.matchAll(pattern)) {
    if (match.index > last) {
      parts.push({ type: 'text', value: node.value.slice(last, match.index) });
    }

    parts.push({ type: 'html', value: toHtml(match) });
    last = match.index + match[0].length;
  }

  if (!parts.length) {
    return false;
  }

  if (last < node.value.length) {
    parts.push({ type: 'text', value: node.value.slice(last) });
  }

  parent.children.splice(index, 1, ...parts);
  return true;
}

export function remarkMarkdownFeatures() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      const callout = CALLOUTS[node.name];

      if (!callout) {
        return;
      }

      node.data = {
        ...node.data,
        hName: 'cs-callout',
        hProperties: { variant: callout.variant, ...(callout.className ? { class: callout.className } : {}) },
      };

      // The icon is a slotted child rather than an attribute, so it is prepended as an element.
      node.children.unshift({
        type: 'paragraph',
        data: {
          hName: 'cs-icon',
          hProperties: { slot: 'icon', name: callout.icon },
        },
        children: [],
      });
    });

    // `[[Key]]` and `==mark==` are inline. Only text nodes are visited, so neither can fire inside a
    // fenced example or an inline code span — which matters, because the reference documents both.
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      if (replaceInText(node, index, parent, /\[\[([^\]]+)\]\]/g, (match) => `<kbd>${match[1]}</kbd>`)) {
        return index;
      }

      if (replaceInText(node, index, parent, /==([^=\n]+)==/g, (match) => `<mark>${match[1]}</mark>`)) {
        return index;
      }
    });
  };
}
