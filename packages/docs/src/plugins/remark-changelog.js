import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import { visit } from 'unist-util-visit';

/**
 * The changelog page: released versions generated, categories carried by an icon per entry.
 *
 * **The releases.** `changesets` writes `packages/components/CHANGELOG.md` at every version bump, and this
 * page restated it by hand — which meant it did not. Everything sat under one `## Unreleased` while `0.1.1`
 * and `0.1.2` shipped, on a page whose own intro promises a Keep a Changelog release history. `::changelog`
 * is replaced with those releases, so a version reaches this page by being released rather than by being
 * remembered.
 *
 * `0.1.0` stays hand-written below the marker. It is the Web Awesome fork — 48 entries that predate
 * changesets and exist in no generated file — so it is the one release this page is the source for.
 *
 * **The categories.** `:::added`, `:::changed`, `:::removed`, `:::fixed` and `:::breaking` are not Starlight
 * aside types. remark-directive parsed them and rehype rendered bare `<div>`s: no label, no styling, nothing.
 * Every category was invisible, which is why duplicate blocks — three `:::changed`, three `:::fixed` —
 * survived unnoticed.
 *
 * They now follow upstream's pattern, which is worth copying because it is better: the category name is
 * screen-reader-only and each entry carries its category as the bullet itself, so a wrench next to a line
 * says "bug fix" without a heading repeating it fifteen times. Upstream's one weakness is that nothing
 * explains the wrench — there is no legend on their page — so `::changelog-legend` renders one here, from
 * this same table, listing only the categories the page actually uses.
 *
 * The icons are Material Symbols equivalents of upstream's Font Awesome set, since the fork changed icon
 * libraries: `wrench` is `build`, `broom-wide` is `cleaning_services`, `plus` is `add`,
 * `triangle-exclamation` is `warning`, `xmark` is `close`. Every name is verified to exist — a Material
 * Symbols name that does not renders nothing at all rather than falling back.
 */

/** Category → its screen-reader label and its bullet icon. The legend reads from this too. */
const CATEGORIES = {
  breaking: { label: 'Breaking', icon: 'warning' },
  added: { label: 'Added', icon: 'add' },
  changed: { label: 'Changed', icon: 'cleaning_services' },
  removed: { label: 'Removed', icon: 'close' },
  fixed: { label: 'Fixed', icon: 'build' },
  deprecated: { label: 'Deprecated', icon: 'schedule' },
};

/** Legend order, so it reads breaking-first like the release it describes rather than in object order. */
const LEGEND_ORDER = ['breaking', 'added', 'changed', 'removed', 'fixed', 'deprecated'];

/**
 * Bump level → the badge that labels a generated release's group.
 *
 * These stay visible where a category is hidden, because they are all the signal there is: a changeset
 * records the bump it causes, not whether each entry fixed something or added it. Deriving a bullet icon
 * from `patch` would be a guess — plenty of patches are chores — so generated entries keep plain bullets.
 */
const BUMPS = {
  major: { label: 'Major', variant: 'danger' },
  minor: { label: 'Minor', variant: 'success' },
  patch: { label: 'Patch', variant: 'neutral' },
};

/** GitHub reference → the icon its badge carries. Upstream's `circle-dot` and `code-pull-request`. */
const REFERENCES = { issues: 'adjust', pull: 'merge' };

/**
 * One changesets bullet, rewritten.
 *
 * changesets writes `- [#113](pr) [`e69a1a9`](commit) Thanks [@rguinee](user)! - Summary`. The commit points
 * at the same change as the pull request with less to read, and the thanks is one maintainer thanking
 * themselves on an internal library, so both go. The pull request moves to the end of the summary, where
 * upstream puts its references and where it stops separating the reader from the sentence.
 */
const tidy = (body) =>
  body.replace(
    /^- \[(#\d+)\]\(([^)]+)\)(?:\s*\[`[0-9a-f]+`\]\([^)]+\))?(?:\s*Thanks \[@[^\]]+\]\([^)]+\)!)?\s*-\s*([^\n]*)$/gm,
    (_match, ref, url, summary) => `- ${summary} [${ref}](${url})`,
  );

/** Every released version in the generated changelog, newest first, as markdown this page can hold. */
function generatedReleases() {
  const source = readFileSync(join(componentsDir(), 'CHANGELOG.md'), 'utf-8');

  return source
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const newline = section.indexOf('\n');
      const lines = [`## ${section.slice(0, newline).trim()}`, ''];

      // changesets groups a release by bump level — `### Patch Changes`. That is the same kind of statement
      // as an authored `:::fixed`, so it is emitted as one and picks up the same handling below.
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

/** The `cs-icon` that stands in for a list marker. */
const bullet = (icon) => ({
  type: 'html',
  value: `<cs-icon name="${icon}" class="changelog-bullet" aria-hidden="true"></cs-icon>`,
});

export function remarkChangelog() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree, file) => {
    if (!/content\/docs\/resources\/changelog\.md$/.test(file.history?.[0] ?? '')) {
      return;
    }

    /** Every category the page turns out to use, so the legend describes this page and not this table. */
    const used = new Set();

    // Spliced first, so everything below reaches the generated releases as well as the authored ones.
    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name === 'changelog') {
        parent.children.splice(index, 1, ...processor.parse(generatedReleases()).children);
        return false;
      }
    });

    visit(tree, 'containerDirective', (node) => {
      const category = CATEGORIES[node.name];
      const bump = BUMPS[node.name];

      if (!category && !bump) {
        return;
      }

      node.data = {
        ...node.data,
        hName: 'div',
        hProperties: {
          class: 'changelog-group',
          [category ? 'data-change' : 'data-bump']: node.name,
        },
      };

      if (category) {
        used.add(node.name);

        // The category name, for anyone who cannot see the icon that replaced it. One per group rather than
        // one per entry: a screen reader should hear "Fixed" once, not fifteen times.
        node.children.unshift({
          type: 'paragraph',
          data: { hProperties: { class: 'cs-visually-hidden' } },
          children: [{ type: 'text', value: category.label }],
        });
      } else {
        node.children.unshift({
          type: 'html',
          value:
            `<cs-badge class="changelog-bump" variant="${bump.variant}" appearance="filled" pill>` +
            `${bump.label}</cs-badge>`,
        });
      }

      // Top-level entries only. A nested bullet is a continuation of the entry above it, not a change of
      // its own, so it keeps an ordinary marker and does not claim a category.
      for (const list of node.children.filter((child) => child.type === 'list')) {
        for (const item of list.children) {
          const paragraph = item.children.find((child) => child.type === 'paragraph');

          if (!paragraph) {
            continue;
          }

          if (category) {
            paragraph.children.unshift(bullet(category.icon));
            continue;
          }

          // A generated entry earns the same bullet when its changeset says what kind of change it is.
          // The changesets format records no such thing — a bump level is not a category, and `patch`
          // covers a bug fix, a chore and a tooling tweak alike — so the convention is a `Fixed:` prefix
          // on the summary. It reads as ordinary prose in the CHANGELOG that npm and GitHub render, and
          // becomes the icon here. An entry without one keeps a plain bullet rather than being guessed at.
          const first = paragraph.children[0];
          const declared =
            first?.type === 'text' && /^(breaking|added|changed|deprecated|removed|fixed):\s*/i.exec(first.value);

          if (!declared) {
            continue;
          }

          const name = declared[1].toLowerCase();
          first.value = first.value.slice(declared[0].length);

          if (!first.value) {
            paragraph.children.shift();
          }

          paragraph.children.unshift(bullet(CATEGORIES[name].icon));
          used.add(name);
        }
      }
    });

    // Rendered after the walk above, so it can describe a category an entry declared as well as one a block
    // did.
    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name !== 'changelog-legend') {
        return;
      }

      const items = LEGEND_ORDER.filter((name) => used.has(name)).map((name) => {
        const { label, icon } = CATEGORIES[name];
        return (
          `<span class="changelog-legend-item">` +
          `<cs-icon name="${icon}" aria-hidden="true"></cs-icon>${label}</span>`
        );
      });

      parent.children.splice(
        index,
        1,
        ...processor.parse(`<div class="changelog-legend cs-cluster cs-gap-m cs-not-prose">${items.join('')}</div>`)
          .children,
      );

      return false;
    });

    // Astro's slugger drops the dots, so `## 0.1.2` becomes `#012` — an anchor nobody would guess and
    // nobody can read. A release is the thing people link to on a changelog, so the id is stated.
    visit(tree, 'heading', (node) => {
      const text = node.children.find((child) => child.type === 'text')?.value?.trim() ?? '';

      if (node.depth === 2 && /^\d+\.\d+\.\d+$/.test(text)) {
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: `v${text.replace(/\./g, '-')}` },
        };
      }
    });

    // A `#113` pointing at a GitHub issue or pull request becomes a badge. Written this way rather than
    // emitted by `tidy` so an authored entry gets the same treatment by writing an ordinary link.
    visit(tree, 'link', (node) => {
      const match = /\/(issues|pull)\/(\d+)\/?$/.exec(node.url);

      if (!match) {
        return;
      }

      node.data = {
        ...node.data,
        hProperties: { class: 'changelog-ref', href: node.url, target: '_blank', rel: 'noreferrer' },
      };

      node.children = [
        {
          type: 'html',
          value:
            `<cs-badge variant="neutral" appearance="outlined">` +
            `<cs-icon slot="start" name="${REFERENCES[match[1]]}" aria-hidden="true"></cs-icon>` +
            `#${match[2]}</cs-badge>`,
        },
      ];
    });
  };
}
