import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { categoryHref, tiers } from '../inspiration-categories.js';
import {
  defaultPaths,
  exampleFences,
  isExampleFence,
  isSectionHeading,
  listOf,
  loadInspiration,
  textOf as text,
} from '../inspiration.js';
import { previews } from './inspiration-previews.js';

/**
 * Builds the page shell every Inspiration entry shares: a Pattern, a Screen and a Flow all read the same
 * way, and only the workbench under the reasoning changes (#148, layout D).
 *
 * One plugin for all three tiers, keyed on the folder, so the pill row, the tabs and Connections exist once
 * and cannot drift apart. Three plugins was the rejected alternative. The per-tier part is the workbench,
 * which lives in `inspiration-previews.js`.
 *
 * Top to bottom the page is:
 *
 *   1. the description (the title is Starlight's);
 *   2. **the pill row**, built the way `remark-component-api.js` builds the component header: a Stable or
 *      Experimental pill, the Goal or Kind linked to its filtered list, and "Used in" as plain text;
 *   3. **the reasoning tabs**, cut from the entry's own `##` sections;
 *   4. **the workbench**, from the tier's preview.
 *
 * **Authors keep writing plain `##` sections.** The tabs are made here, at build time, from headings in the
 * order #145 fixed. That is what lets `packages/components/scripts/agent-skill.js`, which reads the `.md`
 * files directly, get every section in full: nothing an author writes is tab markup. A heading this plugin
 * does not know fails the build rather than vanishing from the page, because a section the shell cannot
 * place is a section a reader would never see. A required section that is missing fails it too, for the
 * same reason in reverse: the tab row is the same on every entry of a tier (#148), so a missing section
 * would otherwise take its tab with it and nothing would say so.
 *
 * **Why the in-panel headings are raw HTML.** Starlight builds the table of contents from the page's
 * markdown headings. Every section here now sits in a tab, so a contents link to one would scroll to a
 * panel that is hidden. A heading in a raw HTML node is not collected (the same fact `remark-component-api`
 * relies on in reverse), so the panels keep real `<h2>`/`<h3>` structure for screen readers without
 * putting dead links in the contents.
 *
 * **Why `cs-tab-group`.** It gives the semantics a set of tabs needs and nothing hand-rolled would get
 * right for free: `role="tablist"`, `tab` and `tabpanel`, `aria-controls` / `aria-labelledby` between each
 * tab and its panel, a roving tabindex, and Arrow / Home / End keys that follow the reading direction. The
 * closed panels are still in the HTML, which is what keeps them in Pagefind's index.
 */

const components = loadComponents();

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const html = (value) => ({ type: 'html', value });

/** The sections #145 allows, by the heading an author writes. */
const SECTIONS = {
  'questions to ask first': 'questions',
  'when to use': 'when',
  'when not to use': 'whenNot',
  'why it works': 'why',
  rules: 'rules',
  states: 'states',
  sources: 'sources',
};

/**
 * The sections every entry must have (#145), by key. A Screen that lists `states:` must also have States,
 * which `requiredSections` adds.
 */
const REQUIRED = ['when', 'whenNot', 'why', 'rules'];

const hasStates = (entry) => Object.keys(entry.states).length > 0;
const requiredSections = (entry) => [...REQUIRED, ...(hasStates(entry) ? ['states'] : [])];
const headingFor = (key) =>
  Object.keys(SECTIONS)
    .find((name) => SECTIONS[name] === key)
    .replace(/^./, (c) => c.toUpperCase());

/**
 * The tabs, in the order #148 decided, and which sections fill each. A section with a `title` keeps its
 * heading inside the panel, because the panel holds more than one; the rest are named by the tab itself.
 * When to use opens by default and always holds When not to use, so the guard against copying the wrong
 * thing is the first thing on screen.
 */
const TABS = [
  {
    name: 'when-to-use',
    label: 'When to use',
    sections: [
      { key: 'questions', title: 'Questions to ask first' },
      { key: 'when', title: 'When to use' },
      { key: 'whenNot', title: 'When not to use' },
    ],
  },
  { name: 'why-it-works', label: 'Why it works', sections: [{ key: 'why' }, { key: 'sources', title: 'Sources' }] },
  { name: 'rules', label: 'Rules', sections: [{ key: 'rules' }] },
  { name: 'states', label: 'States', sections: [{ key: 'states' }], shown: hasStates },
  { name: 'connections', label: 'Connections' },
];

/**
 * Read per page rather than once, so no page is built from a stale library. In dev that is not enough on its
 * own: the content cache is keyed on each page's own file, so a page whose Used in changed because a
 * *different* entry or state file was edited keeps its old render until the store is cleared.
 * `src/plugin-watcher.js` warns when that happens. `npm run build` passes `--force` and is always current.
 */
const library = () => loadInspiration({ ...defaultPaths, components });

export function remarkInspiration() {
  return (tree, file) => {
    const path = file.history?.[0] ?? '';
    const match = path.match(/content\/docs\/inspiration\/(patterns|screens|flows)\/([^/]+)\.md$/);

    if (!match || match[2] === 'index') {
      return;
    }

    const entry = library().get(`${match[1]}/${match[2]}`);

    tree.children = buildShell(entry, tree.children);
  };
}

/**
 * The whole page body for one entry, from its derived record and the nodes its markdown parsed to.
 * Exported so `scripts/inspiration.test.js` can check the shell against fixture entries.
 */
export function buildShell(entry, children, { contentDir = defaultPaths.contentDir } = {}) {
  const examples = exampleFences(children, entry.where);
  const sections = splitSections(entry, children);

  if (!entry.draft && !existsSync(join(contentDir, 'inspiration', entry.tier, 'index.md'))) {
    // The Goal or Kind pill links to the tier's list. That list arrives with the filtering work, which is
    // outside the shell's scope, so this stops a published entry shipping a pill that links to a 404.
    throw new Error(
      `${entry.where}: the ${tiers[entry.tier].axis} pill links to /inspiration/${
        entry.tier
      }, which has no page yet. ` + 'Write that list before publishing an entry in it.',
    );
  }

  return [...headerNodes(entry), ...tabNodes(entry, sections), ...previews[entry.tier]({ entry, examples, html })];
}

/**
 * Cuts the page at its `##` headings into one node list per known section, and checks that the lead holds
 * nothing but a Pattern's example (see `exampleFences`) and comments.
 */
function splitSections(entry, children) {
  const lead = [];
  const sections = {};
  let current = lead;

  for (const node of children) {
    if (isSectionHeading(node)) {
      const heading = text(node).trim();
      const key = SECTIONS[heading.toLowerCase()];

      if (node.depth === 1 || !key) {
        throw new Error(
          `${entry.where}: "${heading}" is not an Inspiration section. Use one of: ` +
            `${Object.keys(SECTIONS)
              .map((name) => name.replace(/^./, (c) => c.toUpperCase()))
              .join(', ')}.`,
        );
      }

      if (key === 'states' && entry.tier !== 'screens') {
        throw new Error(`${entry.where}: only a Screen has a States section.`);
      }

      if (sections[key]) {
        throw new Error(`${entry.where}: "${heading}" appears twice.`);
      }

      current = sections[key] = [];
      continue;
    }

    current.push(node);
  }

  const stray = lead.filter((node) => !isExampleFence(node) && !(node.type === 'html' && /^<!--/.test(node.value)));

  if (stray.length > 0 || (entry.tier !== 'patterns' && lead.length > 0)) {
    throw new Error(
      `${entry.where}: everything goes under a section heading. Only a Pattern's \`\`\`html {.example} fences sit before the first one.`,
    );
  }

  if (sections.states && !hasStates(entry)) {
    throw new Error(`${entry.where}: a States section needs the States it describes listed in \`states:\`.`);
  }

  const missing = requiredSections(entry).filter((key) => !sections[key]);

  if (missing.length > 0) {
    throw new Error(
      `${entry.where}: missing ${listOf(missing.map((key) => `"${headingFor(key)}"`))}. ` +
        `Every entry has When to use, When not to use, Why it works and Rules, and a Screen with \`states:\` has States, ` +
        'so the tab row is the same on every page.',
    );
  }

  return sections;
}

/**
 * Re-emits the headings inside a section as raw HTML (see the header for why), one level below the panel's
 * own heading when the section has one.
 */
function panelContent(nodes, titled) {
  return nodes.map((node) => {
    if (node.type !== 'heading') {
      return node;
    }

    const level = Math.min(6, Math.max(2, node.depth - (titled ? 0 : 1)));

    return html(`<h${level}>${escape(text(node))}</h${level}>`);
  });
}

/** Links one connection, or names it and says it is not written yet. */
const connection = (item) =>
  item.href ? `<a href="${item.href}">${escape(item.title)}</a>` : `${escape(item.title)} <em>(not written yet)</em>`;

const componentLink = (tag) => `<a href="/components/${tag.replace(/^cs-/, '')}"><code>${tag}</code></a>`;

function tabNodes(entry, sections) {
  // Which tabs show depends on the entry's tier and `states:`, never on which sections it happens to have:
  // `splitSections` has already failed an entry that is missing one.
  const tabs = TABS.filter((tab) => !tab.shown || tab.shown(entry));

  const nodes = [
    html(
      `<cs-tab-group class="inspiration-reasoning" active="${tabs[0].name}">\n` +
        tabs
          .map((tab, index) => `<cs-tab panel="${tab.name}"${index === 0 ? ' active' : ''}>${tab.label}</cs-tab>`)
          .join('\n'),
    ),
  ];

  tabs.forEach((tab, index) => {
    nodes.push(html(`<cs-tab-panel name="${tab.name}"${index === 0 ? ' active' : ''}>`));

    if (tab.name === 'connections') {
      nodes.push(html(connectionsHtml(entry)));
    } else {
      for (const { key, title } of tab.sections) {
        if (!sections[key]) {
          continue;
        }

        if (title) {
          nodes.push(html(`<h2>${title}</h2>`));
        }

        nodes.push(...panelContent(sections[key], Boolean(title)));
      }
    }

    nodes.push(html('</cs-tab-panel>'));
  });

  nodes.push(html('</cs-tab-group>'));

  return nodes;
}

/**
 * Built from and Used in. Both are derived (see `src/inspiration.js`), and Used in is listed in full here
 * however many names the pill row cut it to.
 */
function connectionsHtml(entry) {
  const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  const screens = [...new Map(entry.steps.map((step) => [step.screen, step])).values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  const below = [
    entry.tier === 'flows' && screens.length > 0 && `<h3>Screens</h3>${list(screens.map(connection))}`,
    entry.patterns.length > 0 && `<h3>Patterns</h3>${list(entry.patterns.map(connection))}`,
    entry.components.length > 0 && `<h3>Components</h3>${list(entry.components.map(componentLink))}`,
  ].filter(Boolean);

  const usedIn =
    entry.tier === 'flows'
      ? ''
      : `<h2>Used in</h2>` +
        (entry.usedIn.length > 0
          ? list(entry.usedIn.map(connection))
          : `<p>Not used in any ${entry.tier === 'patterns' ? 'Screen' : 'Flow'} yet.</p>`);

  return `<h2>Built from</h2>${below.join('') || '<p>Nothing yet.</p>'}${usedIn}`;
}

/** Up to three names, alphabetical, then "and N more", which opens the Connections tab. */
function usedInHtml(entry) {
  if (entry.usedIn.length === 0) {
    return '';
  }

  const shown = entry.usedIn.slice(0, 3).map(connection);
  const rest = entry.usedIn.length - shown.length;
  const names =
    rest > 0
      ? `${shown.join(', ')} and <a href="#connections" data-inspiration-tab="connections">${rest} more</a>`
      : listOf(shown);

  return `<span class="inspiration-used-in">Used in ${names}</span>`;
}

/**
 * The reason behind the Experimental pill, as one line: every experimental component first, linked, then
 * the layout note if the entry raised its own status (#148, decision 2).
 */
export function statusReason(entry) {
  const parts = [];

  if (entry.experimental.length > 0) {
    const one = entry.experimental.length === 1;

    parts.push(
      `Uses ${listOf(entry.experimental.map(componentLink))}, which ${one ? 'is' : 'are'} experimental. ` +
        `${one ? 'Its' : 'Their'} attributes may change before ${one ? 'it is' : 'they are'} stable, so check ` +
        `${one ? 'its page' : 'their pages'} before you copy this.`,
    );
  }

  if (entry.raised) {
    parts.push(
      entry.experimental.length > 0
        ? 'This layout is still being settled, too, so the arrangement may change.'
        : 'This layout is still being settled. The components in it are stable, but the arrangement may change.',
    );
  }

  return parts.join(' ');
}

/**
 * The pill row and, for an experimental entry, the line its pill opens.
 *
 * The Experimental pill is a real `<button>` with `aria-expanded`, never a hover tooltip, which does not
 * work on touch and cannot hold a link. One pill however many reasons apply. `public/scripts/inspiration.js`
 * does the toggling; without it the line stays hidden and the pill still says what it is.
 */
export function headerNodes(entry) {
  const tier = tiers[entry.tier];
  const pills = [
    entry.status === 'stable'
      ? '<cs-badge variant="brand" pill><cs-icon name="check" slot="start"></cs-icon>Stable</cs-badge>'
      : '<button type="button" class="inspiration-status" aria-expanded="false" aria-controls="inspiration-status-reason">' +
        '<cs-badge variant="warning" appearance="filled" pill><cs-icon name="science" slot="start"></cs-icon>Experimental' +
        '<cs-icon name="keyboard_arrow_down" slot="end" class="inspiration-status-caret"></cs-icon></cs-badge></button>',
    `<a class="inspiration-category" href="${categoryHref(entry.tier, entry.category)}">` +
      `<cs-badge variant="neutral" appearance="filled" pill><cs-icon name="${entry.category.icon}" slot="start"></cs-icon>` +
      `${escape(
        entry.category.label,
      )}<span class="cs-visually-hidden"> ${tier.plural.toLowerCase()}</span></cs-badge></a>`,
  ];

  const reason =
    entry.status === 'experimental'
      ? `<p id="inspiration-status-reason" class="inspiration-status-reason" hidden>` +
        `<cs-icon name="science"></cs-icon><span>${statusReason(entry)}</span></p>`
      : '';

  return [
    html(`<p class="inspiration-summary">${escape(entry.description)}</p>`),
    // `cs-not-prose` for the reason the component header gives: this row is UI, and Starlight's prose rhythm
    // would otherwise push every pill after the first down by a line.
    html(
      `<div class="inspiration-info cs-cluster cs-gap-xs cs-not-prose">${pills.join('')}${usedInHtml(
        entry,
      )}</div>${reason}`,
    ),
  ];
}
