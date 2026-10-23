/**
 * What `withoutCode` leaves for the checks that look for a directive a plugin did not consume.
 *
 * Both directions matter. Leave code in, and a page documenting `:::note` fails the gate, as the changelog did once
 * #279's changeset was released onto it. Take too much out, and a fence that never parsed passes. The markup below
 * is what the built site writes. Needs no build.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withoutCode } from './displayed-source.js';

describe('withoutCode', () => {
  it('removes directives named in inline code, as a released changelog entry renders them', () => {
    const entry = '<li><code dir="auto">:::note</code> and <code dir="auto">:::tip</code> render as callouts</li>';

    assert.equal(withoutCode(entry), '<li> and  render as callouts</li>');
  });

  it('removes a code block, highlighting and all', () => {
    const block =
      '<pre id="code-block-1" dir="ltr"><code class="language-md" id="code-block-1-inner">' +
      '<span class="token">:::tip</span>\nUse it.\n:::</code></pre><p>After.</p>';

    assert.equal(withoutCode(block), '<p>After.</p>');
  });

  it('keeps a directive left on the page as text', () => {
    assert.equal(withoutCode('<p>:::note</p>'), '<p>:::note</p>');
    assert.equal(withoutCode('<p>::roadmap</p>'), '<p>::roadmap</p>');
  });

  it('keeps text between two code spans', () => {
    assert.equal(withoutCode('<p><code>a</code> ::: <code>b</code></p>'), '<p> ::: </p>');
  });

  it('keeps an element whose name only starts with "code"', () => {
    assert.equal(withoutCode('<code-sample>:::</code-sample> <code>a</code>'), '<code-sample>:::</code-sample> ');
  });

  it("keeps Starlight's aside markup and removes the same markup shown in code", () => {
    const aside = '<aside class="starlight-aside starlight-aside--note"><p>Hi</p></aside>';

    assert.equal(withoutCode(`${aside}<code dir="auto">&#x3C;aside class="starlight-aside"></code>`), aside);
  });
});
