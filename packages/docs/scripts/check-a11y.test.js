/**
 * Proves `check-a11y` can fail, against test Screens that are never built into the site.
 *
 * No real Screen exists yet, so on the site alone the check has only ever passed on an empty directory. A
 * check that has never failed is a check nobody knows works. These run it, through `--screens`, on fixtures
 * that differ by two known violations, and assert the exit code and the report. Run after `npm run build`.
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

  it('passes every state file of a Screen with no violations', () => {
    const { status, output } = check(join(fixtures, 'clean'));

    assert.equal(status, 0, output);
    assert.match(output, /2 Screen state files checked with axe .*, no violations/);
  });

  it('fails a Screen with known violations, naming file, rule, impact and selector', () => {
    const { status, output } = check(join(fixtures, 'violation'));

    assert.equal(status, 1, output);
    assert.match(output, /2 accessibility violations in 1 of 1 Screen state file/);
    assert.match(output, /scripts\/fixtures\/check-a11y\/violation\/sign-in\.html/);
    assert.match(output, /html-has-lang \(serious\): .*\n\s+html\n/);
    assert.match(output, /image-alt \(critical\): .*\n\s+img\n/);
  });

  it('fails without a value for --screens rather than checking the site', () => {
    const { status, stderr } = spawnSync(process.execPath, [join(scriptsDir, 'check-a11y.js'), '--screens'], {
      encoding: 'utf-8',
    });

    assert.equal(status, 1, stderr);
    assert.match(stderr, /--screens needs a directory/);
  });
});
