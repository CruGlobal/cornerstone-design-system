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
 * site uses it rather than restyling Starlight's own aside. Each variant was checked against the component's
 * manifest entry before use — `cs-callout` documents an `icon` slot and the variants
 * `brand | neutral | highlight | information | success | warning | danger`.
 *
 * `:::info` takes the `information` role, which exists for informative messages; Eleventy predates it and drew
 * these as `brand`. Its icon is `info` rather than a lightbulb, because a lightbulb reads as a tip and most
 * `:::info` blocks state a fact or a constraint.
 *
 * The icons render in Material Symbols' default outlined cut. Eleventy drew Font Awesome glyphs through
 * upstream's Pro kit, so the names here are not the ones it used.
 *
 * Starlight's own aside names, `:::tip`, `:::note`, `:::caution` and `:::danger`, become callouts too.
 * Starlight would render them as `<aside class="starlight-aside">`, and `stub-starlight-styles.js` removes
 * that stylesheet, so left to Starlight they reach the page unstyled (UIUX-267). Starlight's aside plugin
 * appends itself to the processor, so it runs after this one, and it claims any container still carrying one
 * of those names. `check-pages.js` fails if `starlight-aside` reaches a built page.
 */

/** The container types the reference uses, with the variant and icon each renders as. */
const CALLOUTS = {
  info: { variant: 'information', icon: 'info' },
  warning: { variant: 'warning', icon: 'warning' },
  new: { variant: 'neutral', icon: 'campaign', className: 'new' },
  // Starlight's aside names. `tip` keeps the look `:::info` had before the information role existed, for a
  // suggestion rather than a fact. `note` has a sticky note, because `info` already marks the information role.
  tip: { variant: 'brand', icon: 'lightbulb' },
  note: { variant: 'neutral', icon: 'sticky_note_2' },
  caution: { variant: 'warning', icon: 'warning' },
  danger: { variant: 'danger', icon: 'error' },
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
        hProperties: {
          variant: callout.variant,
          ...(callout.className ? { class: callout.className } : {}),
        },
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

      // remark-directive puts a `[label]` first, as a paragraph. Starlight shows it as the aside's title, so it
      // leads the callout in bold here rather than reading as the first line of the message.
      const label = node.children.find((child) => child.data?.directiveLabel);
      if (label) {
        label.data.hName = 'strong';
      }

      // Renamed so Starlight's aside plugin, which runs later and matches on the name, passes over it.
      node.name = `cs-callout-${node.name}`;
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
