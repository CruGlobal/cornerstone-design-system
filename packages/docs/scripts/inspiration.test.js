/**
 * The Inspiration page shell, against a fixture library rather than the real entries.
 *
 * The settings slice launches all-stable (#147), so no real entry can show the Experimental pill, and none
 * should be made experimental to prove it works. The fixtures under `fixtures/inspiration/` cover each way an
 * entry can be experimental (a component the manifest marks experimental, a raised `status`, and both), plus
 * Used in past three names, sub-component folding, pattern markers in copied markup, and a Flow step whose
 * Screen is not written yet. They read the real Custom Elements Manifest, so "experimental" means what the
 * library says today: `cs-time-input` and `cs-otp-input` are.
 *
 * Needs the component library built (for the manifest), not the site.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadComponents } from '@cruglobal/cornerstone-build-tools/component-api.js';
import { loadInspiration, stripPatternMarkers } from '../src/inspiration.js';
import { buildShell, headerNodes } from '../src/plugins/remark-inspiration.js';

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
      /Uses <a href="\/components\/otp-input"><code>cs-otp-input<\/code><\/a> and <a href="\/components\/time-input"><code>cs-time-input<\/code><\/a>, which are experimental\./,
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
      /Uses <a href="\/components\/time-input"><code>cs-time-input<\/code><\/a>, which is experimental\. Its attributes/,
    );
    assert.ok(out.indexOf('Uses ') < out.indexOf('This layout is still being settled'));
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
      /Used in <a href="\/inspiration\/screens\/alpha">Alpha screen<\/a>, <a href="\/inspiration\/screens\/bravo">Bravo screen<\/a>, <a href="\/inspiration\/screens\/charlie">Charlie screen<\/a> and <a href="#connections" data-inspiration-tab="connections">1 more<\/a>/,
    );
  });

  it('the Connections tab lists Used in in full, and a Screen is built from its Patterns and components', () => {
    const pattern = html(
      shell('patterns/stable', [fence('<cs-callout>Plain</cs-callout>'), heading(2, 'When to use')]),
    );

    for (const name of ['Alpha', 'Bravo', 'Charlie', 'Delta']) {
      assert.match(
        pattern,
        new RegExp(`<li><a href="/inspiration/screens/${name.toLowerCase()}">${name} screen</a></li>`),
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
    const out = html(shell('flows/draft-flow', [heading(2, 'When to use'), paragraph('Fixture.')]));

    assert.deepEqual(
      flow.steps.map((step) => [step.title, step.stateLabel, step.href]),
      [
        ['Overview', null, '/inspiration/screens/overview'],
        ['Not written', null, null],
        ['Overview', 'Just saved', '/inspiration/screens/overview'],
      ],
    );
    assert.match(out, /Step 2 of 3<\/span> Not written <em>\(not written yet\)<\/em>/);
    assert.match(out, /Step 3 of 3<\/span> <a href="\/inspiration\/screens\/overview">Overview: Just saved<\/a>/);
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
    const nodes = shell('patterns/nested', [fence(value), heading(2, 'When to use')]);
    const shown = nodes.find((node) => node.type === 'code');

    assert.match(value, /<!-- pattern: stable -->/);
    assert.doesNotMatch(shown.value, /<!--\s*\/?pattern/);
    assert.equal(
      shown.value,
      '<cs-callout variant="danger">Plain</cs-callout>\n<cs-toast><cs-toast-item>Saved</cs-toast-item></cs-toast>\n',
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
