import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import type CsAvatar from '../components/avatar/avatar.js';
import { copyStartContent } from './copy-start-content.js';

// Plain elements and upgraded components, nothing to server-render, so these run client-only, outside the fixtures
// loop.
describe('copyStartContent (client-only)', () => {
  it('should copy nothing when nothing is in the start slot', async () => {
    const option = await fixture(html`<div>Apple <span slot="end">x</span></div>`);

    expect(copyStartContent(option)).to.deep.equal([]);
  });

  it('should copy each start element as inert, and leave the originals alone', async () => {
    const option = await fixture(
      html`<div><b slot="start" title="one">1</b><i slot="end">x</i><b slot="start">2</b>Apple</div>`,
    );
    const originals = [...option.querySelectorAll('[slot="start"]')];

    const copies = copyStartContent(option);

    expect(copies.map((copy) => copy.outerHTML)).to.deep.equal([
      '<b slot="start" title="one" inert="">1</b>',
      '<b slot="start" inert="">2</b>',
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

    expect(copy.outerHTML).to.equal('<b slot="start" inert=""><i>1</i></b>');
  });

  // The copy renders in its control's shadow root, beside the control's own ids and every other tag's copy.
  it('should drop ids from each copy', async () => {
    const option = await fixture(
      html`<div>
        <b slot="start" id="one"><i id="two">1</i></b
        >Apple
      </div>`,
    );

    const [copy] = copyStartContent(option);

    expect(copy.outerHTML).to.equal('<b slot="start" inert=""><i>1</i></b>');
  });

  // Lit, React and Vue can set a component's properties without writing attributes, which cloneNode() would miss.
  it('should carry properties a component holds without attributes', async () => {
    const option = await fixture(html`<div><span slot="start"></span>Ana Bell</div>`);
    const avatar = document.createElement('cs-avatar');
    avatar.initials = 'AB';
    avatar.label = 'Ana Bell';
    option.querySelector('span')!.append(avatar);

    const [copy] = copyStartContent(option);
    const avatarCopy = copy.querySelector<CsAvatar>('cs-avatar')!;

    expect(avatar.hasAttribute('initials'), 'the original has no attribute').to.be.false;
    expect(avatarCopy.initials).to.equal('AB');
    expect(avatarCopy.label).to.equal('Ana Bell');
  });

  it('should copy the start content as it is when called', async () => {
    const option = await fixture(html`<div><b slot="start" title="one">1</b>Apple</div>`);
    const first = copyStartContent(option);

    option.querySelector('b')!.title = 'two';
    const second = copyStartContent(option);

    expect(second[0] === first[0], 'a new copy').to.be.false;
    expect(second[0].getAttribute('title')).to.equal('two');
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
});
