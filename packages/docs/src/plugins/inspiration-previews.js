import { SCREENS_URL, stripPatternMarkers } from '../inspiration.js';

/**
 * The workbench: the one part of an Inspiration page that differs by tier.
 *
 * `remark-inspiration.js` builds everything else (the pill row, the reasoning tabs, Connections) the same
 * way on every tier, then hands the slot under them to the function here named after the entry's folder.
 * Each returns mdast nodes and receives the same three things, so a tier's preview can be replaced without
 * touching the shell:
 *
 *   - `entry`, the derived record from `src/inspiration.js`;
 *   - `examples`, the Pattern's example: its `{.example}` fence nodes, by the one definition in
 *     `exampleFences` (empty on the other tiers);
 *   - `html`, which wraps a string as a raw HTML node.
 *
 * **These are placeholders on purpose.** Each tier's real preview is its own task, decided in #148 and
 * #302: the Pattern workbench with its Markup tab and "Show it in a screen" (UIUX-272), the Screen workbench
 * with State buttons, real-width viewports and Show patterns (UIUX-273), and the Flow's step list with live
 * thumbnails and a "Why this order" link (UIUX-274). What sits here now is the least that makes each tier's
 * page usable, and nothing those tasks would have to undo.
 *
 * **Copied markup never carries pattern markers** (#148). Every source handed to a reader goes through
 * `stripPatternMarkers`, which is also what those three tasks should call.
 */

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const open = (tier) =>
  `<section class="inspiration-workbench cs-stack" data-inspiration-preview="${tier}" aria-labelledby="inspiration-preview">` +
  `<h2 id="inspiration-preview">Preview</h2>`;

/**
 * A Pattern's example fences, exactly as written minus their markers, so `remark-examples.js` turns each
 * into the site's usual live example with its code panel and copy button. A Pattern with no fence fails the
 * build, since it would be the only tier with nothing to show.
 */
function patterns({ entry, examples: fences, html }) {
  if (fences.length === 0) {
    throw new Error(
      `${entry.where}: a Pattern needs at least one \`\`\`html {.example} fence before its first section.`,
    );
  }

  for (const fence of fences) {
    fence.value = stripPatternMarkers(fence.value);
  }

  return [html(open('patterns')), ...fences, html('</section>')];
}

/**
 * Each of a Screen's state files, opened on its own. The framed, switchable preview is UIUX-273.
 *
 * These links serve the raw files, which still carry their pattern markers: nothing between here and the
 * reader runs `stripPatternMarkers` yet. UIUX-273 replaces the links with a preview that shows the markup,
 * and has to strip them there.
 */
function screens({ entry, html }) {
  const states = [['', 'Default'], ...Object.entries(entry.states)];
  const items = states
    .map(
      ([state, label]) =>
        `<li><a href="${SCREENS_URL}/${entry.slug}${state ? `.${state}` : ''}.html" target="_blank">` +
        `${escape(label)}<span class="cs-visually-hidden"> (opens in a new window)</span></a></li>`,
    )
    .join('');

  return [html(`${open('screens')}<p>Open a State in a new window:</p><ul>${items}</ul></section>`)];
}

/**
 * The Flow's steps in order, each naming its Screen and State. A step whose Screen is not written yet is
 * named and marked rather than linked; only a draft can have one (see `src/inspiration.js`).
 */
function flows({ entry, html }) {
  const total = entry.steps.length;
  const items = entry.steps
    .map((step, index) => {
      const name = escape(step.stateLabel ? `${step.title}: ${step.stateLabel}` : step.title);
      const target = step.href ? `<a href="${step.href}">${name}</a>` : `${name} <em>(not written yet)</em>`;

      return `<li><span class="cs-color-text-quiet">Step ${index + 1} of ${total}</span> ${target}</li>`;
    })
    .join('');

  return [html(`${open('flows')}<ol class="inspiration-steps cs-stack">${items}</ol></section>`)];
}

export const previews = { patterns, screens, flows };
