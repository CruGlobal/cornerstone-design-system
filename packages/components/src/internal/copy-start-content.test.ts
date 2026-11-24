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

  // A fresh copy each render would refetch an image and restart an animation every keystroke.
  it('should return the same copy while the start content is unchanged', async () => {
    const option = await fixture(html`<div><b slot="start" title="one">1</b>Apple</div>`);

    const first = copyStartContent(option);
    const second = copyStartContent(option);

    expect(second[0] === first[0], 'the same copy').to.be.true;
  });

  it('should copy again once an attribute changes', async () => {
    const option = await fixture(html`<div><b slot="start" title="one">1</b>Apple</div>`);
    const first = copyStartContent(option);

    option.querySelector('b')!.title = 'two';
    const second = copyStartContent(option);

    expect(second[0] === first[0], 'a new copy').to.be.false;
    expect(second[0].getAttribute('title')).to.equal('two');
  });

  it('should copy again once a property changes without an attribute', async () => {
    const option = await fixture(html`<div><cs-avatar slot="start"></cs-avatar>Ana Bell</div>`);
    const first = copyStartContent(option);

    option.querySelector<CsAvatar>('cs-avatar')!.initials = 'AB';
    const second = copyStartContent(option);

    expect(second[0] === first[0], 'a new copy').to.be.false;
    expect((second[0] as CsAvatar).initials).to.equal('AB');
  });

  // The copy is part of the control's rendering. Its load and error events are not the page's to hear.
  it("should keep a copy's load and error events inside it", async () => {
    const option = await fixture(html`<div><cs-avatar slot="start" initials="AB"></cs-avatar>Ana Bell</div>`);
    const [copy] = copyStartContent(option);
    const host = await fixture(html`<div></div>`);
    host.append(copy);
    const heard: string[] = [];
    host.addEventListener('cs-error', (event) => heard.push(event.type));
    host.addEventListener('cs-load', (event) => heard.push(event.type));

    copy.dispatchEvent(new Event('cs-error', { bubbles: true, composed: true }));
    copy.dispatchEvent(new Event('cs-load', { bubbles: true, composed: true }));

    expect(heard).to.deep.equal([]);
  });

  // inert is an HTML attribute. On an SVG element it does nothing, so a focusable SVG copy stayed focusable.
  it('should make a copy of inline SVG inert', async () => {
    const option = await fixture(
      html`<div>
        <svg slot="start" tabindex="0" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1"></circle></svg>Apple
      </div>`,
    );
    const [copy] = copyStartContent(option);
    document.body.append(copy);
    const svg = copy.localName === 'svg' ? copy : copy.querySelector('svg')!;

    (svg as SVGElement).focus();

    expect(document.activeElement === svg, 'the copy took focus').to.be.false;
    expect(copy.getAttribute('slot')).to.equal('start');
    copy.remove();
  });

  // Carrying pairs the original's elements with the copy's by position. If cloning changes the count, they no longer
  // line up, and carrying anything would go to the wrong element or fail.
  it('should not fail when the copy has a different number of elements', async () => {
    if (!customElements.get('copy-start-extra')) {
      customElements.define(
        'copy-start-extra',
        class extends HTMLElement {
          cloneNode(deep?: boolean) {
            const clone = super.cloneNode(deep);
            (clone as Element).append(document.createElement('i'));
            return clone;
          }
        },
      );
    }
    const option = await fixture(
      html`<div>
        <copy-start-extra slot="start"><cs-avatar initials="AB"></cs-avatar></copy-start-extra>Ana
      </div>`,
    );

    const [copy] = copyStartContent(option);

    expect(copy.localName).to.equal('copy-start-extra');
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
