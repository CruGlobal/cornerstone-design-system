import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { finishAnimations, getAnimationsDeep, settleAnimations } from './finish-animations.js';

/** A host whose shadow root holds a box with a 100 s border-color transition, and a nested host beneath it. */
class FinishAnimationsTestHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        .box { width: 10px; height: 10px; border: 1px solid rgb(0, 0, 0); transition: border-color 100s linear; }
        .box.on { border-color: rgb(255, 0, 0); }
        .spin { animation: finish-animations-spin 1s linear infinite; }
        .pulse { animation: finish-animations-pulse 100s forwards; }
        @keyframes finish-animations-spin { to { rotate: 1turn; } }
        @keyframes finish-animations-pulse { to { opacity: 0.5; } }
      </style>
      <div class="box"></div>
      <slot></slot>
    `;
  }

  get box() {
    return this.shadowRoot!.querySelector<HTMLElement>('.box')!;
  }
}
customElements.define('finish-animations-test-host', FinishAnimationsTestHost);

// Client-only: this is a test helper with no server rendering of its own, and the host below is defined only here.
describe('finish-animations (client-only)', () => {
  it('should find a transition inside a shadow root, which getAnimations({ subtree: true }) does not', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );
    getComputedStyle(el.box).borderColor;
    el.box.classList.add('on');

    expect(el.getAnimations({ subtree: true })).to.be.empty;
    expect(getAnimationsDeep(el)).to.not.be.empty;
  });

  it('should find animations in nested shadow roots and in light DOM children', async () => {
    const el = await fixture<FinishAnimationsTestHost>(html`
      <finish-animations-test-host>
        <div class="light"></div>
        <finish-animations-test-host class="nested"></finish-animations-test-host>
      </finish-animations-test-host>
    `);
    const light = el.querySelector('.light')!;
    const nested = el.querySelector<FinishAnimationsTestHost>('.nested')!;
    const lightAnimation = light.animate([{ opacity: 0 }, { opacity: 1 }], 100_000);
    const nestedAnimation = nested.box.animate([{ opacity: 0 }, { opacity: 1 }], 100_000);

    const found = getAnimationsDeep(el);
    expect(found).to.include(lightAnimation);
    expect(found).to.include(nestedAnimation);
  });

  it('should settle a transition the last state change started, with no frame in between', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );
    getComputedStyle(el.box).borderColor;
    el.box.classList.add('on');

    finishAnimations(el);

    expect(getComputedStyle(el.box).borderColor).to.equal('rgb(255, 0, 0)');
  });

  it('should settle a Web Animations finished promise without waiting for a frame', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );
    const animation = el.box.animate([{ opacity: 0 }, { opacity: 1 }], 100_000);

    finishAnimations(el);

    expect(animation.playState).to.equal('finished');
    await animation.finished;
  });

  it('should leave infinite animations running rather than throw', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );
    el.box.classList.add('spin');

    expect(() => finishAnimations(el)).to.not.throw();
    expect(el.box.getAnimations()[0].playState).to.equal('running');
  });

  it('should do nothing when nothing is animating', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );

    expect(getAnimationsDeep(el)).to.be.empty;
    expect(() => finishAnimations(el)).to.not.throw();
  });

  it('should deliver animationend before settleAnimations resolves', async () => {
    const el = await fixture<FinishAnimationsTestHost>(
      html`<finish-animations-test-host></finish-animations-test-host>`,
    );
    let ended = false;
    el.box.addEventListener('animationend', () => (ended = true));
    el.box.classList.add('pulse');

    await settleAnimations(el);

    expect(ended).to.be.true;
  });
});
