import { getApiSections, getComponent, loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { findCategory } from '../component-categories.js';

/**
 * Appends the generated API reference to every component page.
 *
 * The reference is not authored: it is the Custom Elements Manifest, rendered. The Eleventy site
 * did this from a 356-line Nunjucks layout; this does it from the same data through
 * `build-tools/component-api.js`, which the agent files also use, so the two cannot drift.
 *
 * It appends mdast rather than raw HTML so the section headings reach Starlight's table of
 * contents. Starlight builds that from the document's headings, and a heading inside a raw HTML
 * block is not one.
 *
 * The tag name comes from the file name, as it did on Eleventy — `button.md` is `<cs-button>` —
 * and `getComponent` throws when the manifest has no such tag, so a renamed component fails the
 * build instead of publishing an empty reference.
 */

const components = loadComponents();

/** Renders one cell, with a copy button beside the selectors that are meant to be copied. */
function cell(value) {
  if (value.code !== undefined) {
    const code = '`' + String(value.code).replace(/\|/g, '\\|') + '`';
    // `copy-label` is a documented attribute on cs-copy-button. Without it every one of the 409 copy
    // buttons announces the same localized default, which on a parts table is a dozen identical
    // "Copy" controls in a row.
    return value.copyable
      ? `${code} <cs-copy-button value="${value.code}" copy-label="Copy ${value.code}"></cs-copy-button>`
      : code;
  }

  return String(value.markdown ?? value.text ?? '').replace(/\|/g, '\\|') || '—';
}

function sectionToMarkdown(section) {
  const lines = [`### ${section.heading}`, ''];

  if (section.learnMore) {
    lines.push(`Learn more about [${section.learnMore.text}](${section.learnMore.href}).`, '');
  }

  if (section.description) {
    lines.push(section.description, '');
  }

  if (section.type === 'table') {
    lines.push(
      '| ' + section.columns.join(' | ') + ' |',
      '| ' + section.columns.map(() => '---').join(' | ') + ' |',
      ...section.rows.map((row) => '| ' + row.map(cell).join(' | ') + ' |'),
      '',
    );
  } else if (section.type === 'links') {
    lines.push(...section.items.map((item) => `- [\`${item.code}\`](${item.href})`), '');
  } else {
    lines.push(section.body, '');
  }

  return lines.join('\n');
}

/**
 * The four-tab import block. There is no CDN tab: the package is not published, so every CDN URL
 * the Eleventy layout emitted pointed at a host Cru does not own. It returns once there is a
 * published package to point at — see the documentation hosting ticket.
 */
function importingSection(component) {
  const name = component.tagName.replace(/^cs-/, '');
  const path = `components/${name}/${name}.js`;

  return `### Importing

If you're using the autoloader or a hosted project, components load on demand — no manual import
needed. To cherry-pick this component, use one of the following snippets.

<cs-tab-group>
  <cs-tab panel="npm">npm</cs-tab>
  <cs-tab panel="self-hosted">Self-Hosted</cs-tab>
  <cs-tab panel="react">React</cs-tab>

  <cs-tab-panel name="npm">

\`\`\`js
import '@cruglobal/cornerstone-components/${path}';
\`\`\`

  </cs-tab-panel>
  <cs-tab-panel name="self-hosted">

\`\`\`js
import './cornerstone/${path}';
\`\`\`

  </cs-tab-panel>
  <cs-tab-panel name="react">

\`\`\`js
import ${component.name} from '@cruglobal/cornerstone-components/react/${name}/index.js';
\`\`\`

  </cs-tab-panel>
</cs-tab-group>
`;
}

export function remarkComponentApi() {
  // `this` is the unified processor, so parsing here uses the same configuration as the page
  // itself — one parser, one set of extensions, no second markdown dialect to keep in step.
  // Aliasing it is unified's own plugin idiom: the returned transformer needs its own `this`.
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree, file) => {
    const path = file.history?.[0] ?? '';
    const match = path.match(/content\/docs\/components\/([^/]+)\.md$/);

    // `index.md` is the browse page, not a reference page — it has no tag to look up, and the
    // filename-to-tag rule below would send it hunting for `<cs-index>`. Every other file in the
    // directory is a component, which is what makes the rule worth keeping strict.
    if (!match || match[1] === 'index') {
      return;
    }

    const component = getComponent(components, `cs-${match[1]}`);
    const sections = getApiSections(component);

    const markdown = ['## API', '', importingSection(component), '', ...sections.map(sectionToMarkdown)].join('\n');
    const parsed = processor.parse(markdown);

    stampHeadingIds(parsed, sections);

    // The anatomy diagram locates the parts list by DOM shape rather than by props, so the table it
    // reads has to carry the same hooks the Eleventy layout emitted.
    stampAnatomyHooks(
      parsed,
      sections.find((section) => section.anatomy),
    );

    tree.children.unshift(...headerNodes(processor, component, file.data?.astro?.frontmatter?.category));
    tree.children.push(...parsed.children);
  };
}

/**
 * The block that sits between the page title and its first example: the tag name, a status pill, the
 * category, the version the component landed in, and the CEM summary.
 *
 * None of it is authored — it is the manifest plus one front-matter field — which is why it belongs
 * here rather than at the top of 70 markdown files.
 *
 * The Since badge carries no link. Eleventy linked it to a changelog anchor built by padding the
 * version and prefixing `wa_`, and that anchor does not exist for 50 of the 70 components. Rather
 * than stamp a known-broken link onto every page, the badge states the version and the link returns
 * when the changelog ports and its anchor scheme is settled.
 */
function headerNodes(processor, component, categoryLabel) {
  const category = findCategory(categoryLabel);

  const badges = [
    component.status === 'stable' &&
      '<cs-badge variant="brand" pill><cs-icon name="check" slot="start"></cs-icon>Stable</cs-badge>',
    component.status === 'experimental' &&
      '<cs-badge variant="warning" appearance="filled" pill><cs-icon name="science" slot="start"></cs-icon>Experimental</cs-badge>',
    // Linked to the browse page, filtered to this category. A query rather than an anchor, because the
    // browse page filters rather than groups — which is how upstream works and what the Eleventy site's
    // own macro did (`/docs/components/?category={slug}`). `component-browser.js` reads it on arrival.
    category &&
      `<a class="component-info-category" href="/components?category=${category.slug}">` +
        `<cs-badge variant="neutral" appearance="filled" pill><cs-icon name="${category.icon}" slot="start"></cs-icon>${category.label}</cs-badge>` +
        `</a>`,
    component.since && `<cs-badge variant="neutral" appearance="filled" pill>Since ${component.since}</cs-badge>`,
  ].filter(Boolean);

  const parsed = processor.parse(
    // `not-content` opts this row out of Starlight's prose rhythm. Without it Starlight's
    // adjacent-sibling rule puts `margin-top: 1rem` on every badge after the first — and the
    // library's own `cluster > * { margin-block: 0 }` cannot stop it, because that rule sits inside
    // `:where()` and so carries zero specificity. The result was a Stable pill sitting 8px above the
    // two beside it. This row is UI rather than prose, so opting out is the honest fix.
    `<div class="component-info cs-cluster cs-not-prose">\n` +
      `<code class="component-tag">&lt;${component.tagName}&gt;</code>\n` +
      `<div class="cs-cluster cs-gap-xs">${badges.join('')}</div>\n` +
      `</div>\n\n${component.summary ?? ''}\n`,
  );

  // The summary is markdown — descriptions reference sibling tags in backticks — so it is parsed
  // rather than concatenated into the raw block above, and given its class here.
  const summary = parsed.children.find((node) => node.type === 'paragraph');

  if (summary) {
    summary.data = { ...summary.data, hProperties: { class: 'component-summary' } };
  }

  return parsed.children;
}

/**
 * Gives each generated heading an explicit id rather than one slugged from its own prose.
 *
 * Eleventy slugged `Attributes & Properties` to `attributes-and-properties`, and Astro's slugger
 * produces `attributes--properties` for the same text. Every reference page carries that anchor, so
 * a derived id would break links across all 70 at once. Stating the id removes the dependency on
 * either slugger's treatment of `&`.
 */
function stampHeadingIds(tree, sections) {
  const ids = new Map([
    ['API', 'api'],
    ['Importing', 'importing'],
    ...sections.map((section) => [section.heading, section.id]),
  ]);

  for (const node of tree.children) {
    if (node.type !== 'heading') {
      continue;
    }

    const text = node.children.map((child) => child.value ?? '').join('');
    const id = ids.get(text);

    if (id) {
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    }
  }
}

function stampAnatomyHooks(tree, partsSection) {
  if (!partsSection) {
    return;
  }

  const tables = tree.children.filter((node) => node.type === 'table');
  const table = tables[tables.length - 1];

  if (!table) {
    return;
  }

  table.data = { ...table.data, hProperties: { 'data-anatomy-table': true } };

  // Row 0 is the header. Deprecated parts are greyed and carry no part name, so the diagram
  // highlights only the supported ones — the same rule the Eleventy layout applied.
  partsSection.rows.forEach((row, index) => {
    const node = table.children[index + 1];

    if (!node) {
      return;
    }

    node.data = {
      ...node.data,
      hProperties: row.deprecated ? { class: 'cs-color-text-quiet' } : { 'data-part-name': row.name },
    };
  });
}
