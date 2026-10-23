/**
 * Proves the stray-directive scan `check-pages` runs on the changelog flags an unhandled directive in prose
 * and leaves alone one quoted in code. Needs no build.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasStrayDirective } from './stray-directives.js';

describe('hasStrayDirective', () => {
  it('flags a directive left in prose', () => {
    assert.equal(hasStrayDirective('<p>:::note</p><p>Read this first.</p><p>:::</p>'), true);
  });

  it('flags a directive in prose even when the page also quotes one in code', () => {
    assert.equal(hasStrayDirective('<p><code>:::tip</code> renders a callout.</p><p>:::note</p>'), true);
  });

  it('ignores a directive quoted in inline code', () => {
    assert.equal(
      hasStrayDirective('<li><code dir="auto">:::note</code>, <code>:::tip</code> render as callouts.</li>'),
      false,
    );
  });

  it('ignores a directive in a code block', () => {
    assert.equal(
      hasStrayDirective(
        '<pre class="astro-code" tabindex="0"><code><span>:::caution</span>\n<span>:::</span></code></pre>',
      ),
      false,
    );
  });

  it('passes a page with no directive at all', () => {
    assert.equal(hasStrayDirective('<p>Nothing to see.</p>'), false);
  });
});
