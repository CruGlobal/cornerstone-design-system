/**
 * The Inspiration page shell, against a fixture library rather than the real entries.
 *
 * The settings slice launches all-stable (#147), so no real entry can show the Experimental pill, and none
 * should be made experimental to prove it works. The fixtures under `fixtures/inspiration/` cover each way an
 * entry can be experimental (a component the manifest marks experimental, a raised `status`, and both), plus
 * Used in past three names, sub-component folding, pattern markers in copied markup, and a Flow step whose
 * Screen is not written yet. Each failure the build guards against gets a small throwaway library of its own
 * (`tempLibrary`), so the shared fixtures stay valid entries. They read the real Custom Elements Manifest, so "experimental" means what the
 * library says today: `cs-time-input` and `cs-otp-input` are.
 *
 * Needs the component library built (for the manifest), not the site.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { DOCS_BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';
import matter from 'gray-matter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { defaultPaths, loadInspiration, stripPatternMarkers } from '../src/inspiration.js';
import { buildShell, headerNodes } from '../src/plugins/remark-inspiration.js';

// Every link the shell writes into HTML carries the base the site is served under (docs-and-skills.md).
const BASE_PATH = DOCS_BASE_PATH;
const BASE = BASE_PATH.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
/** A regex from its raw source, with `${BASE}` standing for the escaped base path. */
const based = (strings, ...values) => new RegExp(String.raw(strings, ...values));

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'inspiration');
const paths = { contentDir: join(fixtures, 'content'), screensDir: join(fixtures, 'screens') };
const components = loadComponents();
const library = loadInspiration({ ...paths, components });

const html = (nodes) => nodes.map((node) => (node.type === 'html' ? node.value : `[${node.type}]`)).join('\n');
const header = (id) => html(headerNodes(library.get(id)));

// Just enough mdast to stand in for what an entry's markdown parses to.
const heading = (depth, value) => ({ type: 'heading', depth, children: [{ type: 'text', value }] });
const paragraph = (value) => ({ type: 'paragraph', children: [{ type: 'text', value }] });
const fence = (value) => ({ type: 'code', lang: 'html', meta: '{.example}', value });
const shell = (id, children) => buildShell(library.get(id), children, paths);

/** The sections every entry must have, so a test can supply a valid body and vary one thing. */
const required = () => [
  heading(2, 'When to use'),
  paragraph('Use.'),
  heading(2, 'When not to use'),
  paragraph('Not this.'),
  heading(2, 'Why it works'),
  paragraph('Because.'),
  heading(2, 'Rules'),
  paragraph('A rule.'),
];

const SECTIONS_MD =
  '## When to use\n\nUse.\n\n## When not to use\n\nNot.\n\n## Why it works\n\nBecause.\n\n## Rules\n\nA rule.\n';

/**
 * A throwaway library: `files` maps a path under the content root (`inspiration/patterns/x.md`) or under
 * `screens/` to its text. Returns the paths to load it with.
 */
function tempLibrary(files) {
  const root = mkdtempSync(join(tmpdir(), 'inspiration-'));
  after(() => rmSync(root, { recursive: true, force: true }));

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }

  return { contentDir: root, screensDir: join(root, 'screens') };
}

const load = (files) => loadInspiration({ ...tempLibrary(files), components });

const patternMd = (fields, fence = '<cs-callout>Plain</cs-callout>') =>
  `---\ncategory: Feedback\n${fields}\n---\n\n\`\`\`html {.example}\n${fence}\n\`\`\`\n\n${SECTIONS_MD}`;
const screenMd = (fields) => `---\ncategory: Account management\n${fields}\n---\n\n${SECTIONS_MD}`;
const flowMd = (fields) => `---\ncategory: Account management\n${fields}\n---\n\n${SECTIONS_MD}`;
const stateFile = (body) => `<!doctype html>\n<html lang="en">\n  <body>\n${body}\n  </body>\n</html>\n`;

describe('status', () => {
  it('a Pattern built only from stable components gets the Stable pill and no reason line', () => {
    const out = header('patterns/stable');

    assert.equal(library.get('patterns/stable').status, 'stable');
    assert.match(
      out,
      /<cs-badge variant="brand" pill><cs-icon name="check" slot="start"><\/cs-icon>Stable<\/cs-badge>/,
    );
    assert.doesNotMatch(out, /Experimental|inspiration-status-reason/);
  });

  it('derived: names every experimental component, linked, behind a real button', () => {
    const entry = library.get('patterns/derived');
    const out = header('patterns/derived');

    assert.deepEqual(entry.experimental, ['cs-otp-input', 'cs-time-input']);
    assert.equal(entry.status, 'experimental');
    assert.match(
      out,
      /<button type="button" class="inspiration-status" aria-expanded="false" aria-controls="inspiration-status-reason">/,
    );
    assert.match(out, /name="science"/);
    assert.match(out, /<p id="inspiration-status-reason" class="inspiration-status-reason" hidden>/);
    assert.match(
      out,
      based`Uses <a href="${BASE}\/components\/otp-input"><code>cs-otp-input<\/code><\/a> and <a href="${BASE}\/components\/time-input"><code>cs-time-input<\/code><\/a>, which are experimental\.`,
    );
    assert.doesNotMatch(out, /still being settled/);
  });

  it('raised: a stable Pattern with `status: experimental` says only that the layout is unsettled', () => {
    const entry = library.get('patterns/raised');
    const out = header('patterns/raised');

    assert.deepEqual(entry.experimental, []);
    assert.equal(entry.status, 'experimental');
    assert.match(out, /class="inspiration-status"/);
    assert.match(out, /This layout is still being settled\. The components in it are stable/);
    assert.doesNotMatch(out, /Uses /);
  });

  it('both: one pill, components first, then the layout note', () => {
    const out = header('patterns/both');

    assert.equal(out.match(/class="inspiration-status"/g).length, 1);
    assert.match(
      out,
      based`Uses <a href="${BASE}\/components\/time-input"><code>cs-time-input<\/code><\/a>, which is experimental\. Its attributes`,
    );
    assert.ok(out.indexOf('Uses ') < out.indexOf('This layout is still being settled'));
  });

  describe('a raised status carries up to what is built from it', () => {
    // settled (Pattern) → nested (Pattern, contains settled) → home (Screen, marks nested) → journey (Flow).
    const chain = (raise) =>
      load({
        'inspiration/patterns/settled.md': patternMd(
          `title: Settled${raise === 'settled' ? '\nstatus: experimental' : ''}`,
        ),
        'inspiration/patterns/nested.md': patternMd(
          `title: Nested${raise === 'nested' ? '\nstatus: experimental' : ''}`,
          '<!-- pattern: settled -->\n<cs-callout>Plain</cs-callout>\n<!-- /pattern -->',
        ),
        'inspiration/screens/home.md': screenMd(`title: Home${raise === 'home' ? '\nstatus: experimental' : ''}`),
        'screens/home.html': stateFile('<!-- pattern: nested -->\n<cs-callout>Plain</cs-callout>\n<!-- /pattern -->'),
        'inspiration/flows/journey.md': flowMd('title: Journey\nscreens:\n  - home\n  - home'),
        'inspiration/patterns/index.md': '---\ntitle: Patterns\n---\n',
        'inspiration/screens/index.md': '---\ntitle: Screens\n---\n',
        'inspiration/flows/index.md': '---\ntitle: Flows\n---\n',
      });
    const statuses = (lib) =>
      ['patterns/settled', 'patterns/nested', 'screens/home', 'flows/journey'].map((id) => lib.get(id).status);

    it("a Flow lists its Screens' Patterns in Connections, once each, and a Pattern's Used in stays Screens only", () => {
      const lib = chain(null);
      const flow = lib.get('flows/journey');
      const out = html(buildShell(flow, required(), paths));

      assert.deepEqual(
        flow.patterns.map((part) => part.title),
        ['Nested'],
      );
      assert.equal(out.match(/>Nested<\/a>/g).length, 1);
      assert.match(out, /<h3>Screens<\/h3>.*<h3>Patterns<\/h3>.*<h3>Components<\/h3>/s);
      assert.deepEqual(
        lib.get('patterns/nested').usedIn.map((user) => user.title),
        ['Home'],
      );
    });

    it('nothing raised: the whole chain stays Stable', () => {
      assert.deepEqual(statuses(chain(null)), ['stable', 'stable', 'stable', 'stable']);
    });

    it('a raised Screen makes its Flow Experimental and names the Screen once in the reason line', () => {
      const lib = chain('home');
      const out = html(headerNodes(lib.get('flows/journey')));

      assert.deepEqual(statuses(lib), ['stable', 'stable', 'experimental', 'experimental']);
      assert.equal(out.match(/Home<\/a>/g).length, 1);
      assert.match(
        out,
        based`Uses <a href="${BASE}\/inspiration\/screens\/home">Home<\/a>, which is still being settled, so the arrangement may change\.`,
      );
      assert.doesNotMatch(out, /This layout is still being settled/);
    });

    it('a raised Pattern carries through a nested Pattern and a Screen up to the Flow', () => {
      const lib = chain('settled');

      assert.deepEqual(statuses(lib), ['experimental', 'experimental', 'experimental', 'experimental']);
      // Each entry names only the part it uses directly, so the reader can follow the chain down.
      assert.deepEqual(
        lib.get('screens/home').unsettled.map((part) => part.slug),
        ['nested'],
      );
      assert.deepEqual(
        lib.get('flows/journey').unsettled.map((part) => part.slug),
        ['home'],
      );
    });

    it('does not depend on load order: a raised entry that loads after its user still carries up', () => {
      // Patterns load alphabetically, so "nested" is read before the "settled" Pattern it contains.
      assert.equal(chain('settled').get('patterns/nested').status, 'experimental');
    });
  });

  it('`status` can only raise: any other value fails the build', () => {
    const root = mkdtempSync(join(tmpdir(), 'inspiration-'));
    after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, 'inspiration', 'patterns'), { recursive: true });
    writeFileSync(
      join(root, 'inspiration', 'patterns', 'lowered.md'),
      '---\ntitle: Lowered\ncategory: Feedback\nstatus: stable\n---\n',
    );

    assert.throws(
      () => loadInspiration({ contentDir: root, screensDir: root, components }),
      /may only be "experimental"/,
    );
  });
});

describe('Connections', () => {
  it('Used in shows three names alphabetically, then "and N more" opening the Connections tab', () => {
    const out = header('patterns/stable');

    assert.match(
      out,
      based`Used in <a href="${BASE}\/inspiration\/screens\/alpha">Alpha screen<\/a>, <a href="${BASE}\/inspiration\/screens\/bravo">Bravo screen<\/a>, <a href="${BASE}\/inspiration\/screens\/charlie">Charlie screen<\/a> and <a href="#connections" data-inspiration-tab="connections">1 more<\/a>`,
    );
  });

  it('the Connections tab lists Used in in full, and a Screen is built from its Patterns and components', () => {
    const pattern = html(shell('patterns/stable', [fence('<cs-callout>Plain</cs-callout>'), ...required()]));

    for (const name of ['Alpha', 'Bravo', 'Charlie', 'Delta']) {
      assert.match(
        pattern,
        new RegExp(`<li><a href="${BASE_PATH}/inspiration/screens/${name.toLowerCase()}">${name} screen</a></li>`),
      );
    }

    const screen = library.get('screens/alpha');

    assert.deepEqual(
      screen.patterns.map((item) => item.title),
      ['Stable pattern'],
    );
    assert.deepEqual(screen.components, ['cs-callout']);
  });

  it('a sub-component folds under its parent', () => {
    assert.deepEqual(library.get('screens/overview').components, ['cs-card', 'cs-toast']);
  });

  it('a Screen is used in the Flows that step through it, drafts only on draft pages', () => {
    // The only Flow here is a draft, and the Screen is published, so the Flow must not appear.
    assert.deepEqual(library.get('screens/overview').usedIn, []);
  });
});

describe('Flow steps', () => {
  it('a draft Flow keeps a step whose Screen is not written yet, and marks it', () => {
    const flow = library.get('flows/draft-flow');
    const out = html(shell('flows/draft-flow', required()));

    assert.deepEqual(
      flow.steps.map((step) => [step.title, step.stateLabel, step.href]),
      [
        ['Overview', null, '/inspiration/screens/overview'],
        ['Not written', null, null],
        ['Overview', 'Just saved', '/inspiration/screens/overview'],
      ],
    );
    assert.match(out, /Step 2 of 3<\/span> Not written <em>\(not written yet\)<\/em>/);
    assert.match(
      out,
      based`Step 3 of 3<\/span> <a href="${BASE}\/inspiration\/screens\/overview">Overview: Just saved<\/a>`,
    );
  });

  it('a step naming a built-in object key, not a State the author wrote, fails the build', () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/home.md': screenMd('title: Home\nstates:\n  saved: Saved'),
          'screens/home.html': stateFile('<cs-callout>Plain</cs-callout>'),
          'screens/home.saved.html': stateFile('<cs-callout>Plain</cs-callout>'),
          'inspiration/flows/journey.md': flowMd('title: Journey\ndraft: true\nscreens:\n  - home.constructor'),
        }),
      /step "home\.constructor" names no State of Home/,
    );
  });

  it('a State name outside the slug pattern fails on the Screen, not on a Flow that points at it', () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/home.md': screenMd('title: Home\ndraft: true\nstates:\n  just_saved: Just saved'),
          'screens/home.html': stateFile('<cs-callout>Plain</cs-callout>'),
          'screens/home.just_saved.html': stateFile('<cs-callout>Plain</cs-callout>'),
        }),
      /home\.md: State "just_saved" may only use lowercase letters, numbers and hyphens/,
    );
  });

  it('a published Flow with a step that names no Screen fails the build', () => {
    const root = mkdtempSync(join(tmpdir(), 'inspiration-'));
    after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, 'inspiration', 'flows'), { recursive: true });
    writeFileSync(
      join(root, 'inspiration', 'flows', 'published.md'),
      '---\ntitle: Published\ncategory: Account management\nscreens:\n  - missing\n---\n',
    );

    assert.throws(
      () => loadInspiration({ contentDir: root, screensDir: root, components }),
      /step "missing" names no Screen/,
    );
  });
});

describe('reasoning tabs', () => {
  const screenChildren = [
    heading(2, 'When not to use'),
    paragraph('Not this.'),
    heading(2, 'Rules'),
    paragraph('A rule.'),
    heading(2, 'Questions to ask first'),
    paragraph('Ask.'),
    heading(2, 'When to use'),
    paragraph('Use.'),
    heading(2, 'Why it works'),
    paragraph('Because.'),
    heading(2, 'States'),
    heading(3, 'Just saved'),
    paragraph('Saved.'),
    heading(2, 'Sources'),
    paragraph('A source.'),
  ];

  it('builds cs-tab-group tabs in the decided order, whatever order the sections were written in', () => {
    const out = html(shell('screens/overview', screenChildren));
    const tabs = [...out.matchAll(/<cs-tab panel="([a-z-]+)"/g)].map((match) => match[1]);

    assert.deepEqual(tabs, ['when-to-use', 'why-it-works', 'rules', 'states', 'connections']);
    assert.match(out, /<cs-tab-group class="inspiration-reasoning" active="when-to-use">/);
    assert.match(out, /<cs-tab panel="when-to-use" active>When to use<\/cs-tab>/);
  });

  it('puts Questions to ask first, When to use, then When not to use in the first tab, and Sources last in Why it works', () => {
    const out = html(shell('screens/overview', screenChildren));
    const when = out.slice(
      out.indexOf('<cs-tab-panel name="when-to-use"'),
      out.indexOf('<cs-tab-panel name="why-it-works"'),
    );
    const why = out.slice(out.indexOf('<cs-tab-panel name="why-it-works"'), out.indexOf('<cs-tab-panel name="rules"'));

    assert.ok(
      when.indexOf('Questions to ask first') < when.indexOf('<h2>When to use') &&
        when.indexOf('<h2>When to use') < when.indexOf('When not to use'),
    );
    assert.match(why, /^<cs-tab-panel name="why-it-works">\n\[paragraph\]\n<h2>Sources<\/h2>\n\[paragraph\]/);
  });

  it('re-emits headings inside a panel as raw HTML, so the table of contents does not link into hidden panels', () => {
    const nodes = shell('screens/overview', screenChildren);

    assert.equal(nodes.filter((node) => node.type === 'heading').length, 0);
    assert.match(html(nodes), /<h2>Just saved<\/h2>/);
  });

  it('gives only Screens a States tab', () => {
    assert.throws(
      () => shell('patterns/stable', [fence('<cs-callout></cs-callout>'), heading(2, 'States')]),
      /only a Screen has a States section/,
    );
  });

  it('fails on a section heading the shell cannot place', () => {
    assert.throws(
      () => shell('screens/overview', [heading(2, 'Background')]),
      /"Background" is not an Inspiration section/,
    );
  });
});

describe('copied markup', () => {
  it('strips pattern markers, and the lines they sat on, from every fence the workbench shows', () => {
    const value = library.get('patterns/nested').markup[0];
    const nodes = shell('patterns/nested', [fence(value), ...required()]);
    const shown = nodes.find((node) => node.type === 'code');

    assert.match(value, /<!-- pattern: stable -->/);
    assert.doesNotMatch(shown.value, /<!--\s*\/?pattern/);
    assert.equal(
      shown.value,
      '<cs-callout variant="danger">Plain</cs-callout>\n<cs-toast><cs-toast-item>Saved</cs-toast-item></cs-toast>',
    );
  });

  it('handles markers inline and indented, and leaves other comments alone', () => {
    assert.equal(
      stripPatternMarkers(
        '<div>\n    <!-- pattern: a -->\n  <p><!--pattern:b-->x<!-- /pattern --></p>\n  <!-- keep -->\n</div>',
      ),
      '<div>\n  <p>x</p>\n  <!-- keep -->\n</div>',
    );
  });
});

describe('pattern markers', () => {
  for (const marker of ['<!-- pattern: Error_summary -->', '<!-- pattern: error summary -->', '<!-- pattern -->']) {
    it(`fails on a malformed marker in a Pattern's example: ${marker}`, () => {
      assert.throws(
        () => load({ 'inspiration/patterns/p.md': patternMd('title: P', `${marker}\n<cs-callout>x</cs-callout>`) }),
        { message: new RegExp(`"${marker}" is not a pattern marker`) },
      );
    });
  }

  it("fails on a malformed marker in a Screen's state file, naming the file", () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/s.md': screenMd('title: S\ndraft: true'),
          'screens/s.html': stateFile('<!-- pattern: Bad -->\n<cs-callout>x</cs-callout>\n<!-- /pattern -->'),
        }),
      /screens\/s\.html: "<!-- pattern: Bad -->" is not a pattern marker/,
    );
  });

  it('accepts a well-formed opening and closing marker, and leaves comments that only start with the word alone', () => {
    const entries = load({
      'inspiration/patterns/p.md': patternMd('title: P\ndraft: true'),
      'inspiration/screens/s.md': screenMd('title: S\ndraft: true'),
      'screens/s.html': stateFile(
        '<!--pattern:p-->\n<cs-callout>x</cs-callout>\n<!-- /pattern -->\n<!-- patterns below -->',
      ),
    });

    assert.deepEqual(entries.get('screens/s').patternNames, ['p']);
  });
});

describe('references between entries', () => {
  it('a published Screen whose marker names a draft Pattern fails the build', () => {
    assert.throws(
      () =>
        load({
          'inspiration/patterns/p.md': patternMd('title: P\ndraft: true'),
          'inspiration/screens/s.md': screenMd('title: S'),
          'screens/s.html': stateFile('<!-- pattern: p --><cs-callout>x</cs-callout><!-- /pattern -->'),
        }),
      /screens\/s\.md: pattern marker "p" is still a draft/,
    );
  });

  it('a published Screen whose marker names no Pattern fails the build', () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/s.md': screenMd('title: S'),
          'screens/s.html': stateFile('<!-- pattern: nope --><cs-callout>x</cs-callout><!-- /pattern -->'),
        }),
      /screens\/s\.md: pattern marker "nope" names no Pattern at inspiration\/patterns\/nope\.md/,
    );
  });

  it('a published Flow whose step names a draft Screen fails the build', () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/s.md': screenMd('title: S\ndraft: true'),
          'screens/s.html': stateFile('<cs-callout>x</cs-callout>'),
          'inspiration/flows/f.md': flowMd('title: F\nscreens:\n  - s'),
        }),
      /flows\/f\.md: step "s" is still a draft/,
    );
  });

  it('a draft page lists the draft entries that use it', () => {
    const entries = load({
      'inspiration/patterns/p.md': patternMd('title: P\ndraft: true'),
      'inspiration/screens/s.md': screenMd('title: S\ndraft: true'),
      'screens/s.html': stateFile('<!-- pattern: p --><cs-callout>x</cs-callout><!-- /pattern -->'),
    });

    assert.deepEqual(
      entries.get('patterns/p').usedIn.map((item) => [item.title, item.href]),
      [['S', '/inspiration/screens/s']],
    );
  });
});

describe('required sections', () => {
  it('fails when a Pattern is missing any of the four sections every entry has', () => {
    assert.throws(
      () => shell('patterns/stable', [fence('<cs-callout></cs-callout>'), heading(2, 'When to use')]),
      /missing "When not to use", "Why it works" and "Rules"/,
    );
  });

  it('fails when a Screen with `states:` has no States section', () => {
    assert.throws(() => shell('screens/overview', required()), /missing "States"/);
  });

  it('fails when a Screen without `states:` has a States section, rather than showing a tab no other page has', () => {
    assert.throws(
      () => shell('screens/alpha', [...required(), heading(2, 'States'), paragraph('Orphan.')]),
      /a States section needs the States it describes listed in `states:`/,
    );
  });

  it('every fixture and every real entry builds from its own markdown', () => {
    const roots = [
      { ...paths, entries: library },
      { ...defaultPaths, entries: loadInspiration({ ...defaultPaths, components }) },
    ];

    for (const { contentDir, entries } of roots) {
      for (const entry of entries.values()) {
        const { content } = matter(readFileSync(join(contentDir, entry.where), 'utf-8'));

        assert.doesNotThrow(() => buildShell(entry, fromMarkdown(content).children, { contentDir }), entry.where);
      }
    }

    assert.ok(roots[1].entries.size >= 3, 'the three seed entries are read');
  });
});

describe("the Pattern's example", () => {
  it('fails on an {.example} fence under a section, in the library and in the shell', () => {
    const md = patternMd('title: P').replace(
      'A rule.\n',
      'A rule.\n\n```html {.example}\n<cs-callout>Late</cs-callout>\n```\n',
    );

    assert.throws(() => load({ 'inspiration/patterns/p.md': md }), /an ```html \{\.example\} fence sits under "Rules"/);
    assert.throws(
      () =>
        shell('patterns/stable', [
          fence('<cs-callout></cs-callout>'),
          ...required(),
          fence('<cs-callout></cs-callout>'),
        ]),
      /fence sits under "Rules"/,
    );
  });

  it('fails on an {.example} fence under a section of a Screen too', () => {
    assert.throws(
      () =>
        load({
          'inspiration/screens/s.md': `${screenMd(
            'title: S\ndraft: true',
          )}\n\`\`\`html {.example}\n<cs-callout>x</cs-callout>\n\`\`\`\n`,
          'screens/s.html': stateFile('<cs-callout>x</cs-callout>'),
        }),
      /fence sits under "Rules"/,
    );
  });

  it('a plain fence under a section is code, not the example, and counts toward nothing', () => {
    const md = patternMd('title: P').replace('A rule.\n', 'A rule.\n\n```html\n<cs-time-input></cs-time-input>\n```\n');
    const entry = load({ 'inspiration/patterns/p.md': md }).get('patterns/p');

    assert.deepEqual(entry.components, ['cs-callout']);
  });

  it('the library and the workbench read the same fences', () => {
    const entry = library.get('patterns/nested');
    const { content } = matter(readFileSync(join(paths.contentDir, entry.where), 'utf-8'));
    const shown = buildShell(entry, fromMarkdown(content).children, paths).filter((node) => node.type === 'code');

    assert.deepEqual(
      shown.map((node) => node.value),
      entry.markup.map(stripPatternMarkers),
    );
  });

  it('a fence before the first section that is not an {.example} fails the shell, rather than showing as the example', () => {
    assert.throws(
      () => shell('patterns/stable', [{ type: 'code', lang: 'css', meta: null, value: 'a {}' }, ...required()]),
      /everything goes under a section heading/,
    );
  });
});

describe('publishing guard', () => {
  it("a published entry fails until its tier's list page exists and is published; a draft entry does not", () => {
    const files = {
      'inspiration/patterns/p.md': patternMd('title: P'),
      'inspiration/patterns/d.md': patternMd('title: D\ndraft: true'),
    };
    const root = tempLibrary(files);
    const entries = loadInspiration({ ...root, components });
    const children = () => [fence('<cs-callout></cs-callout>'), ...required()];

    assert.throws(
      () => buildShell(entries.get('patterns/p'), children(), root),
      /the Kind pill links to \/inspiration\/patterns, which has no page yet/,
    );
    assert.doesNotThrow(() => buildShell(entries.get('patterns/d'), children(), root));

    const list = join(root.contentDir, 'inspiration', 'patterns', 'index.md');
    writeFileSync(list, '---\ntitle: Patterns\ndraft: true\n---\n');
    assert.throws(
      () => buildShell(entries.get('patterns/p'), children(), root),
      /the Kind pill links to \/inspiration\/patterns, which is still a draft/,
    );

    writeFileSync(list, '---\ntitle: Patterns\n---\n');
    assert.doesNotThrow(() => buildShell(entries.get('patterns/p'), children(), root));
  });
});

describe('links inside State files', () => {
  const screen = (draft) => ({
    'inspiration/screens/home.md': screenMd(`title: Home${draft ? '\ndraft: true' : ''}`),
    'screens/home.html': stateFile('<a href="edit.html#top">Edit</a> <a href="https://example.com/x.html">Out</a>'),
  });

  it('a published Screen fails when a State file links to a page file that is not there', () => {
    assert.throws(() => load(screen(false)), /screens\/home\.html: links to edit\.html, which does not exist/);
  });

  it('a draft Screen may link ahead to a page not written yet', () => {
    assert.doesNotThrow(() => load(screen(true)));
  });

  it('passes once the linked State file exists, and leaves links off the site alone', () => {
    assert.doesNotThrow(() => load({ ...screen(false), 'screens/edit.html': stateFile('<p>Edit</p>') }));
  });
});

describe('links', () => {
  it('every link the shell writes carries the base path once, so none 404s under GitHub Pages', () => {
    assert.ok(BASE_PATH, 'the site is served under a base path, so this test proves something');

    for (const id of ['patterns/both', 'screens/overview', 'screens/alpha', 'flows/draft-flow']) {
      const body =
        id === 'patterns/both'
          ? [fence('<cs-time-input></cs-time-input>'), ...required()]
          : id === 'screens/overview'
            ? [...required(), heading(2, 'States'), heading(3, 'Just saved'), paragraph('Saved.')]
            : required();
      const out = html([...headerNodes(library.get(id)), ...shell(id, body)]);
      const hrefs = [...out.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);

      assert.ok(hrefs.length > 0, `${id} writes links`);
      for (const href of hrefs.filter((h) => !h.startsWith('#'))) {
        assert.ok(href.startsWith(`${BASE_PATH}/`), `${id}: ${href} has no base path`);
        assert.ok(!href.startsWith(`${BASE_PATH}${BASE_PATH}/`), `${id}: ${href} has the base path twice`);
      }
    }
  });

  it('an entry keeps its own link without the base, because Starlight adds it to sidebar links', () => {
    assert.equal(library.get('screens/overview').href, '/inspiration/screens/overview');
  });
});

describe('escaping', () => {
  it('escapes a title, description and heading that contain < or "', () => {
    const entries = load({
      'inspiration/patterns/p.md': patternMd(`title: 'P <b> "q"'\ndescription: 'Fish & <chips> "now"'\ndraft: true`),
      'inspiration/screens/s.md': screenMd(`title: 'S <i> "s"'\ndraft: true`),
      'screens/s.html': stateFile('<!-- pattern: p --><cs-callout>x</cs-callout><!-- /pattern -->'),
    });
    const pattern = html(buildShell(entries.get('patterns/p'), [fence('<cs-callout></cs-callout>'), ...required()]));
    const screen = html(
      buildShell(entries.get('screens/s'), [
        ...required().slice(0, -1),
        heading(3, 'A <b> "rule"'),
        paragraph('A rule.'),
      ]),
    );

    assert.match(pattern, /<p class="inspiration-summary">Fish &amp; &lt;chips> &quot;now&quot;<\/p>/);
    assert.match(pattern, based`Used in <a href="${BASE}\/inspiration\/screens\/s">S &lt;i> &quot;s&quot;<\/a>`);
    assert.match(screen, based`<li><a href="${BASE}\/inspiration\/patterns\/p">P &lt;b> &quot;q&quot;<\/a><\/li>`);
    assert.match(screen, /<h2>A &lt;b> &quot;rule&quot;<\/h2>/);
    assert.doesNotMatch(pattern + screen, /<chips>|<b> "|<i> "/);
  });
});
