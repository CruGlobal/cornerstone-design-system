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
import { mkdtempSync, rmSync } from 'node:fs';
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

  it('fails a Screen whose script throws, naming the error', () => {
    const { status, output } = check(join(fixtures, 'page-error'));

    assert.equal(status, 1, output);
    assert.match(output, /\[light\] check-a11y \(error\): the page threw: fixture: the Screen script failed/);
    assert.match(output, /2 failures \(1 light, 1 dark\)/);
  });

  it('fails a missing file the dark switch asks for after the check stops listening for new requests', () => {
    const { status, output } = check(join(fixtures, 'late-asset'));

    assert.equal(status, 1, output);
    assert.match(output, /\[dark\] check-a11y \(error\): \S+\/dark-extras-missing\.css returned 404/);
    assert.match(output, /1 failure \(0 light, 1 dark\)/);
  });

  it('runs a Screen pinned to light on <body> in light only, and says so', () => {
    const { status, output } = check(join(fixtures, 'pinned-light'));

    assert.equal(status, 0, output);
    assert.match(output, /pinned to light by <body class="cs-light">, so only the light run was made/);
    assert.match(output, /1 run \(1 pinned to one scheme\)/);
    assert.doesNotMatch(output, /\[dark\]/);
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
    assert.match(output, /\[light\] needs review: color-contrast: .*\n\s+p\n/);
    assert.match(output, /\[dark\] needs review: color-contrast: .*\n\s+p\n/);
    assert.match(output, /no violations; \d+ needs review \(\d+ light, \d+ dark\), which never fails the check/);
  });

  // Without the exemption, axe 4.13 fails this fixture on region at cs-page's skip link.
  //
  // If this fails because nothing was set aside, axe is fixed: delete `findComposedSkipLinks` and what calls
  // it from check-a11y.js, delete the shadow-skip-link fixtures and these tests, and close the "axe misreads
  // cs-page's skip link" row in resources/accessibility.md in the same change.
  it("passes cs-page's shadow-DOM skip link that axe reports under region, and prints that it was set aside", () => {
    const { status, output } = check(join(fixtures, 'shadow-skip-link'));

    assert.equal(status, 0, output);
    assert.doesNotMatch(output, /region \(moderate\)/);

    for (const mode of ['light', 'dark']) {
      assert.match(
        output,
        new RegExp(
          `\\[${mode}\\] region set aside: a skip link to #main-content that axe cannot compare across shadow DOM\\n\\s+cs-page >>> \\S+\\n`,
        ),
      );
    }

    assert.match(
      output,
      /no violations; .*2 region results set aside as a skip link axe cannot compare across shadow DOM \(1 light, 1 dark\)/,
    );
  });

  it('still fails stray text, a link to another page and a late in-page link outside every landmark', () => {
    const { status, output } = check(join(fixtures, 'shadow-skip-link-stray'));

    assert.equal(status, 1, output);
    assert.match(output, /2 failures \(1 light, 1 dark\)/);

    for (const mode of ['light', 'dark']) {
      assert.match(
        output,
        new RegExp(
          `\\[${mode}\\] region \\(moderate\\): .*\\n\\s+\\.stray-text\\n.*\\n\\s+\\.stray-page-link\\n.*\\n\\s+\\.stray-fragment-link\\n`,
        ),
      );
      assert.match(
        output,
        new RegExp(`\\[${mode}\\] region set aside: a skip link to #main-content .*\\n\\s+cs-page >>> \\S+\\n`),
      );
    }
  });

  // One state file per way a first shadow link can fail to be a skip link: a fragment that names nothing in
  // the document (settings.html), a bare "#" (settings.hash-only.html) and a fragment that is not valid
  // percent-encoding (settings.undecodable.html).
  it('still fails a first shadow link whose fragment is missing, empty or undecodable', () => {
    const { status, output } = check(join(fixtures, 'shadow-skip-link-no-target'));

    assert.equal(status, 1, output);
    assert.match(output, /6 failures \(3 light, 3 dark\) in 3 of 3 files/);

    for (const file of ['settings', 'settings\\.hash-only', 'settings\\.undecodable']) {
      assert.match(
        output,
        new RegExp(
          `${file}\\.html\\n` +
            `\\s+\\[light\\] region \\(moderate\\): .*\\n\\s+skip-host >>> \\.skip\\n.*\\n` +
            `\\s+\\[dark\\] region \\(moderate\\): .*\\n\\s+skip-host >>> \\.skip\\n`,
        ),
      );
    }

    assert.doesNotMatch(output, /region set aside/);
  });

  it('fails without a value for --screens rather than checking the site', () => {
    const { status, stderr } = spawnSync(process.execPath, [join(scriptsDir, 'check-a11y.js'), '--screens'], {
      encoding: 'utf-8',
    });

    assert.equal(status, 1, stderr);
    assert.match(stderr, /--screens needs a directory/);
  });
});
