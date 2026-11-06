import { expect, fixture } from '@open-wc/testing';
import { loadStylesheet } from './test/load-stylesheet.js';

// Plain HTML with no component to server-render, so these run client-only, outside the fixtures loop.
describe('visually hidden utility (client-only)', () => {
  let stylesheet: HTMLLinkElement;

  before(async () => {
    stylesheet = await loadStylesheet('/dist/bundled/styles/utilities.css');
  });

  after(() => {
    stylesheet.remove();
  });

  it('should not push a full-height container into overflow', async () => {
    // A live region or skip link after a full-height block, the shape that gave the page a 1px scrollbar
    const el = await fixture<HTMLElement>(`
      <div style="position: relative; height: 200px; overflow: auto;">
        <div style="height: 100%;"></div>
        <span class="cs-visually-hidden">Announcement</span>
      </div>
    `);

    expect(el.scrollHeight).to.equal(el.clientHeight);
    expect(el.scrollWidth).to.equal(el.clientWidth);
  });

  it('should still reveal the content on focus', async () => {
    const el = await fixture<HTMLElement>(`
      <div style="position: relative; height: 200px;">
        <a class="cs-visually-hidden" href="#main">Skip to content</a>
      </div>
    `);
    const link = el.querySelector('a')!;

    expect(link.getBoundingClientRect().width).to.equal(1);
    link.focus();
    expect(link.getBoundingClientRect().width).to.be.greaterThan(1);
  });
});
