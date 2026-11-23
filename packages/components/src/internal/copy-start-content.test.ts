import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { copyStartContent } from './copy-start-content.js';

// Plain elements with no component to server-render, so these run client-only, outside the fixtures loop.
describe('copyStartContent (client-only)', () => {
  it('should copy nothing when nothing is in the start slot', async () => {
    const option = await fixture(html`<div>Apple <span slot="end">x</span></div>`);

    expect(copyStartContent(option)).to.deep.equal([]);
  });

  it('should copy each start element, hidden from assistive technology, and leave the originals alone', async () => {
    const option = await fixture(
      html`<div><b slot="start" title="one">1</b><i slot="end">x</i><b slot="start">2</b>Apple</div>`,
    );
    const originals = [...option.querySelectorAll('[slot="start"]')];

    const copies = copyStartContent(option);

    expect(copies.map((copy) => copy.outerHTML)).to.deep.equal([
      '<b slot="start" title="one" aria-hidden="true">1</b>',
      '<b slot="start" aria-hidden="true">2</b>',
    ]);
    expect(copies.some((copy) => originals.includes(copy))).to.be.false;
    expect(originals.map((original) => original.outerHTML)).to.deep.equal([
      '<b slot="start" title="one">1</b>',
      '<b slot="start">2</b>',
    ]);
  });

  // A copy is made on the client. With `did-ssr` it, and any component inside it, would believe the server rendered
  // it, and with `defer-hydration` Lit would never render it at all.
  it('should drop the server-render markers from each copy', async () => {
    const option = await fixture(
      html`<div>
        <b slot="start" did-ssr defer-hydration><i did-ssr defer-hydration>1</i></b
        >Apple
      </div>`,
    );

    const [copy] = copyStartContent(option);

    expect(copy.outerHTML).to.equal('<b slot="start" aria-hidden="true"><i>1</i></b>');
  });

  // Only a direct child is assigned to the option's start slot; one deeper down renders inside the label.
  it('should not copy a start element nested inside another child', async () => {
    const option = await fixture(
      html`<div>
        <span><b slot="start">1</b></span
        >Apple
      </div>`,
    );

    expect(copyStartContent(option)).to.deep.equal([]);
  });

  it('should return the same copies while the start content is unchanged', async () => {
    const option = await fixture(html`<div><b slot="start">1</b>Apple</div>`);

    const first = copyStartContent(option);
    const second = copyStartContent(option);

    expect(second).to.have.lengthOf(1);
    expect(second[0]).to.equal(first[0]);
  });

  it('should copy again once the start content changes', async () => {
    const option = await fixture(html`<div><b slot="start" title="one">1</b>Apple</div>`);
    const first = copyStartContent(option);

    option.querySelector('b')!.title = 'two';
    const second = copyStartContent(option);

    expect(second[0]).to.not.equal(first[0]);
    expect(second[0].getAttribute('title')).to.equal('two');
  });
});
