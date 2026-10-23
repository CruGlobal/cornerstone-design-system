/**
 * Proves `check-a11y` fails for each reason it claims to, against test Screens never built into the site.
 *
 * No real Screen exists yet, so on the site alone the check has only ever passed on an empty directory. A
 * check that has never failed is a check nobody knows works. These run it, through `--screens`, on fixtures
 * that each differ from the clean sign-in Screen by one kind of fault, and assert the exit code and the
 * report. Run after `npm run build`.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const fixtures = join(scriptsDir, 'fixtures', 'check-a11y');

function check(screens) {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [join(scriptsDir, 'check-a11y.js'), '--screens', screens],
    { encoding: 'utf-8' },
  );

  return { status, output: stdout + stderr };
}

describe('check-a11y', () => {
  it('passes and says so when there are no Screens', () => {
    const empty = mkdtempSync(join(tmpdir(), 'check-a11y-'));

    try {
      const { status, output } = check(empty);

      assert.equal(status, 0, output);
      assert.match(output, /No Screens under .* yet/);
    } finally {
      rmSync(empty, { recursive: true });
    }
  });

  it('passes when the Screens directory does not exist', () => {
    const { status, output } = check(join(fixtures, 'does-not-exist'));

    assert.equal(status, 0, output);
    assert.match(output, /No Screens under .* yet/);
  });

  it('fails a Screen whose own page does not load', () => {
    // A link to nothing: the check lists it as a state file, and loading it is a 404, which no committed fixture
    // can be because a real file is always served.
    const dir = mkdtempSync(join(tmpdir(), 'check-a11y-'));

    try {
      symlinkSync(join(dir, 'nothing-here.html'), join(dir, 'sign-in.html'));

      const { status, output } = check(dir);

      assert.equal(status, 1, output);
      assert.match(output, /\[light\] check-a11y \(error\): loading it returned 404/);
      assert.match(output, /\[dark\] check-a11y \(error\): loading it returned 404/);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  it('fails a Screen with a component that never defines, naming it', () => {
    const { status, output } = check(join(fixtures, 'never-defines'));

    assert.equal(status, 1, output);

    for (const mode of ['light', 'dark']) {
      assert.match(output, new RegExp(`\\[${mode}\\] check-a11y \\(error\\): its <cs-never> did not define within`));
    }
  });

  it('fails a request that gets no response at all, naming the reason', () => {
    const { status, output } = check(join(fixtures, 'blocked-request'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] check-a11y \(error\): \S+\/favicon\.svg failed: csp/);
    assert.match(output, /\[dark\] check-a11y \(error\): \S+\/favicon\.svg failed: csp/);
  });

  it('passes every state file of a Screen with no violations, in both modes, naming the axe version', () => {
    const { status, output } = check(join(fixtures, 'clean'));

    assert.equal(status, 0, output);
    assert.match(
      output,
      /2 Screen state files checked with axe \d+\.\d+\.\d+ in light and dark, 4 runs .*: no violations/,
    );
  });

  it('fails WCAG violations in each mode, naming file, mode, rule, impact and selector', () => {
    const { status, output } = check(join(fixtures, 'violation'));

    assert.equal(status, 1, output);
    assert.match(output, /4 failures \(2 light, 2 dark\) in 1 of 1 file/);
    assert.match(output, /scripts\/fixtures\/check-a11y\/violation\/sign-in\.html/);

    for (const mode of ['light', 'dark']) {
      assert.match(output, new RegExp(`\\[${mode}\\] html-has-lang \\(serious\\): .*\\n\\s+html\\n`));
      assert.match(output, new RegExp(`\\[${mode}\\] image-alt \\(critical\\): .*\\n\\s+img\\n`));
    }
  });

  it('fails a Screen with no main landmark, a rule axe files under best-practice', () => {
    const { status, output } = check(join(fixtures, 'no-main'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] landmark-one-main \(moderate\): .*\n\s+html\n/);
    assert.match(output, /\[dark\] landmark-one-main \(moderate\)/);
  });

  it('runs the dark mode as a dark page, not a second light one', () => {
    const { status, output } = check(join(fixtures, 'dark-only'));

    assert.equal(status, 1, output);
    assert.match(output, /\[dark\] color-contrast \(serious\): .*\n\s+p\n/);
    assert.doesNotMatch(output, /\[light\] color-contrast \(serious\)/);
    assert.match(output, /1 failure \(0 light, 1 dark\)/);
  });

  it('fails a Screen whose stylesheet is missing, naming the URL and status', () => {
    const { status, output } = check(join(fixtures, 'missing-asset'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] check-a11y \(error\): \S+\/dist\/styles\/does-not-exist\.css returned 404/);
    assert.match(output, /2 failures \(1 light, 1 dark\)/);
  });

  it('fails a path on the docs host that leaves out the base path, rather than asking the live site', () => {
    const { status, output } = check(join(fixtures, 'outside-base'));

    assert.equal(status, 1, output);
    assert.match(
      output,
      /\[light\] check-a11y \(error\): https?:\/\/[^/\s]+\/dist\/styles\/themes\/fl\.css returned 404/,
    );
    assert.match(
      output,
      /\[dark\] check-a11y \(error\): https?:\/\/[^/\s]+\/dist\/styles\/themes\/fl\.css returned 404/,
    );
    assert.match(output, /2 failures \(1 light, 1 dark\)/);
  });

  it('passes a Screen that keeps cs-cloak and loads its components without the loader', () => {
    const { status, output } = check(join(fixtures, 'cloak-no-loader'));

    assert.equal(status, 0, output);
    assert.match(output, /2 runs .*: no violations/);
  });

  it('answers a path with a stray % with a 404 rather than crashing', () => {
    const { status, output } = check(join(fixtures, 'stray-percent'));

    assert.equal(status, 1, output);
    assert.doesNotMatch(output, /URIError/);
    assert.match(output, /\[light\] check-a11y \(error\): \S+\/50%\.png returned 404/);
    assert.match(output, /\[dark\] check-a11y \(error\): \S+\/50%\.png returned 404/);
  });

  it('passes a Screen that cancels its own request', () => {
    const { status, output } = check(join(fixtures, 'aborted-fetch'));

    assert.equal(status, 0, output);
    assert.doesNotMatch(output, /ERR_ABORTED/);
  });

  it('fails a Screen whose script throws, naming the error', () => {
    const { status, output } = check(join(fixtures, 'page-error'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] check-a11y \(error\): the page threw: fixture: the Screen script failed/);
    assert.match(output, /2 failures \(1 light, 1 dark\)/);
  });

  it('fails a missing file the page asks for a moment after the dark switch', () => {
    const { status, output } = check(join(fixtures, 'late-asset'));

    assert.equal(status, 1, output);
    assert.match(output, /\[dark\] check-a11y \(error\): \S+\/dark-extras-missing\.css returned 404/);
    assert.match(output, /1 failure \(0 light, 1 dark\)/);
  });

  it('waits after a late dark switch, so axe judges the styles the switch loads', () => {
    const { status, output } = check(join(fixtures, 'late-switch'));

    assert.equal(status, 1, output);
    // #333333 comes only from the stylesheet the page loads after the switch. Without the wait, axe runs first.
    assert.match(output, /\[dark\] color-contrast \(serious\): .*\n(?:\s+.*\n)*?.*foreground color: #333333/);
    assert.match(output, /1 failure \(0 light, 1 dark\)/);
  });

  it('runs a Screen pinned to light on <body> in light only, and says so', () => {
    const { status, output } = check(join(fixtures, 'pinned-light'));

    assert.equal(status, 0, output);
    assert.match(output, /pinned to light by <body class="cs-light">, so only the light run was made/);
    assert.match(output, /1 run \(1 pinned to one scheme\)/);
    assert.doesNotMatch(output, /\[dark\]/);
  });

  it('finds a pin on a wrapper that has siblings, by what the page renders', () => {
    const { status, output } = check(join(fixtures, 'pinned-light-sibling'));

    assert.equal(status, 0, output);
    assert.match(output, /pinned to light by <div class="cs-light">, so only the light run was made/);
    assert.match(output, /1 run \(1 pinned to one scheme\)/);
    assert.doesNotMatch(output, /\[dark\]/);
  });

  it('fails a Screen skipped in every mode rather than passing a page axe never saw', () => {
    const { status, output } = check(join(fixtures, 'pinned-both'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] check-a11y \(error\): skipped in every mode, so axe never ran on it/);
    assert.match(output, /\[dark\] check-a11y \(error\): skipped in every mode, so axe never ran on it/);
    assert.match(output, /0 runs/);
    assert.doesNotMatch(output, /so only the \w+ run was made/);
  });

  it('runs a Screen pinned to dark by its one wrapper in dark only', () => {
    const { status, output } = check(join(fixtures, 'pinned-dark'));

    assert.equal(status, 1, output);
    assert.match(output, /pinned to dark by <div class="cs-dark">, so only the dark run was made/);
    assert.match(output, /\[dark\] color-contrast \(serious\): .*\n\s+p\n/);
    assert.doesNotMatch(output, /\[light\]/);
  });

  it('keeps a cs-theme class on <html> and judges the dark run in that theme', () => {
    const { status, output } = check(join(fixtures, 'theme-dark'));

    assert.equal(status, 1, output);
    // #7ca7ad is FamilyLife's dark link colour; Cru's is #00a3b8 and FamilyLife's light one passes.
    assert.match(output, /\[dark\] color-contrast \(serious\): .*\n\s+p\n.*background color: #7ca7ad/);
    assert.match(output, /1 failure \(0 light, 1 dark\)/);
  });

  it('lists what axe could not decide as needing review, without failing', () => {
    const { status, output } = check(join(fixtures, 'needs-review'));

    assert.equal(status, 0, output);

    // `p` anywhere in the block, not first: which other nodes axe lists, and in what order, depends on the
    // fonts a machine has. On a Mac it lists the `h1` first as partially obscured. Lines indented 10 or more
    // are that block's targets and messages, so the match cannot run on into the next block.
    for (const mode of ['light', 'dark']) {
      assert.match(output, new RegExp(`\\[${mode}\\] needs review: color-contrast: .*\\n(?: {10,}.*\\n)*? {10}p\\n`));
    }
    assert.match(output, /no violations; \d+ needs review \(\d+ light, \d+ dark\), which never fails the check/);
  });

  it('fails without a value for --screens rather than checking the site', () => {
    const { status, stderr } = spawnSync(process.execPath, [join(scriptsDir, 'check-a11y.js'), '--screens'], {
      encoding: 'utf-8',
    });

    assert.equal(status, 1, stderr);
    assert.match(stderr, /--screens needs a directory/);
  });
});
