import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import { visit } from 'unist-util-visit';

/**
 * The changelog page: released versions generated, categories made visible.
 *
 * Two jobs, one plugin, because they are the same page's presentation.
 *
 * **The releases.** `changesets` writes `packages/components/CHANGELOG.md` at every version bump, and this
 * page restated it by hand — which meant it did not. Everything sat under one `## Unreleased` while `0.1.1`
 * and `0.1.2` shipped, and the page's own intro promised a Keep a Changelog release history it did not have.
 * `::changelog` is replaced with those releases, so a version reaches this page by being released rather than
 * by being remembered.
 *
 * `0.1.0` stays hand-written below the marker. It is the Web Awesome fork — 48 entries that predate changesets
 * and exist in no generated file — so it is the one release this page is the source for rather than a view of.
 *
 * **The categories.** `:::added`, `:::changed`, `:::removed`, `:::fixed` and `:::breaking` are not Starlight
 * aside types. remark-directive parsed them and rehype rendered them as bare `<div>`s: no label, no styling,
 * nothing. Every category on the page was invisible, which is why duplicate blocks — three `:::changed`, three
 * `:::fixed` — survived unnoticed. They are labelled blocks now, and the same treatment covers the bump levels
 * changesets emits, so a generated release and a written one read alike.
 */

/** Category → the badge that labels it. Covers both the authored categories and changesets' bump levels. */
const LABELS = {
  breaking: { text: 'Breaking', variant: 'danger' },
  added: { text: 'Added', variant: 'success' },
  changed: { text: 'Changed', variant: 'information' },
  removed: { text: 'Removed', variant: 'warning' },
  fixed: { text: 'Fixed', variant: 'brand' },
  major: { text: 'Major', variant: 'danger' },
  minor: { text: 'Minor', variant: 'success' },
  patch: { text: 'Patch', variant: 'neutral' },
};

/**
 * Strips the commit link and the thanks from a changesets bullet, keeping the pull request.
 *
 * changesets writes `- [#113](pr) [`e69a1a9`](commit) Thanks [@rguinee](user)! - Summary`. The pull request
 * is where the reasoning is, so it stays; the abbreviated hash beside it points at the same change with less
 * to read, and the thanks names one maintainer thanking themselves on an internal library.
 */
const tidy = (body) => body.replace(/\s*\[`[0-9a-f]+`\]\([^)]*\)\s*Thanks\s*\[@[^\]]+\]\([^)]*\)!\s*-\s*/g, ' — ');

/** Every released version in the generated changelog, newest first, as markdown this page can hold. */
function generatedReleases() {
  const source = readFileSync(join(componentsDir(), 'CHANGELOG.md'), 'utf-8');

  return source
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const newline = section.indexOf('\n');
      const version = section.slice(0, newline).trim();
      const lines = [`## ${version}`, ''];

      // changesets groups a release by bump level — `### Patch Changes`. That is the same kind of statement
      // as an authored `:::fixed`, so it is emitted as one and picks up the same badge below.
      for (const group of section.slice(newline).split(/^### /m).slice(1)) {
        const end = group.indexOf('\n');
        const level = group
          .slice(0, end)
          .trim()
          .replace(/ Changes$/, '')
          .toLowerCase();
        const body = tidy(group.slice(end)).trim();

        if (body) {
          lines.push(`:::${level}`, '', body, '', ':::', '');
        }
      }

      return lines.join('\n');
    })
    .join('\n');
}

export function remarkChangelog() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree, file) => {
    const path = file.history?.[0] ?? '';

    if (!/content\/docs\/resources\/changelog\.md$/.test(path)) {
      return;
    }

    // Parsed and spliced first, so the visitor below reaches the generated releases' bump-level containers
    // as well as the authored ones. Two passes over one tree would be the alternative, and this is the pass.
    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name === 'changelog') {
        parent.children.splice(index, 1, ...processor.parse(generatedReleases()).children);
        return false;
      }
    });

    // Astro's slugger drops the dots, so `## 0.1.2` becomes `#012` — an anchor nobody would guess and
    // nobody can read. A release is the thing people link to on a changelog, so the id is stated.
    visit(tree, 'heading', (node) => {
      const text = node.children.find((child) => child.type === 'text')?.value ?? '';

      if (node.depth === 2 && /^\d+\.\d+\.\d+$/.test(text.trim())) {
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: `v${text.trim().replace(/\./g, '-')}` },
        };
      }
    });

    visit(tree, 'containerDirective', (node) => {
      const label = LABELS[node.name];

      if (!label) {
        return;
      }

      node.data = {
        ...node.data,
        hName: 'div',
        hProperties: { class: 'changelog-group', 'data-change': node.name },
      };

      node.children.unshift({
        type: 'html',
        value:
          `<cs-badge class="changelog-label" variant="${label.variant}" appearance="filled" pill>` +
          `${label.text}</cs-badge>`,
      });
    });
  };
}
