import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { expectAnimationDuration } from './expect-animation-duration.js';

/** A host whose shadow root holds a box to animate, a child inside it, and a duration property to measure against. */
class ExpectAnimationDurationTestHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host { --test-duration: 120ms; }
        .box { width: 10px; height: 10px; border: 1px solid rgb(0, 0, 0); outline: 1px solid rgb(0, 0, 0); }
        .box.show { animation: expect-duration-fade var(--test-duration); }
        .box.long { animation: expect-duration-fade 3s; }
        .box.delayed { animation: expect-duration-fade var(--test-duration) 50ms; }
        .box.spin { animation: expect-duration-fade var(--test-duration), expect-duration-fade 1s infinite; }
        .box.before::before { content: ''; animation: expect-duration-fade 3s; }
        .box.mixed { transition: border-color var(--test-duration), outline-color 60ms; }
        .box.mixed.on { border-color: rgb(255, 0, 0); outline-color: rgb(255, 0, 0); }
        .child.long { animation: expect-duration-fade 3s; }
        @keyframes expect-duration-fade { to { opacity: 0.5; } }
      </style>
      <div class="box"><div class="child"></div></div>
    `;
  }

  get box() {
    return this.shadowRoot!.querySelector<HTMLElement>('.box')!;
  }

  get child() {
    return this.shadowRoot!.querySelector<HTMLElement>('.child')!;
  }
}
customElements.define('expect-animation-duration-test-host', ExpectAnimationDurationTestHost);

// Client-only: this is a test helper with no server rendering of its own, and the host below is defined only here.
describe('expectAnimationDuration (client-only)', () => {
  async function createHost() {
    return fixture<ExpectAnimationDurationTestHost>(
      html`<expect-animation-duration-test-host></expect-animation-duration-test-host>`,
    );
  }

  /** The message `check` fails with, or an empty string when it passes. */
  async function failureOf(check: Promise<void>) {
    try {
      await check;
      return '';
    } catch (error) {
      return (error as Error).message;
    }
  }

  it('should pass when a CSS animation runs for the duration the property resolves to', async () => {
    const el = await createHost();
    el.box.classList.add('show');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.equal('');
  });

  it('should pass for an animate() call', async () => {
    const el = await createHost();
    el.box.animate([{ opacity: 1 }, { opacity: 0 }], 120);

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.equal('');
  });

  it('should fail, naming the animation and both lengths, when it runs longer than the property', async () => {
    const el = await createHost();
    el.box.classList.add('long');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include(
      'div.box.long should animate for --test-duration (120ms) with no delay, but expect-duration-fade runs 3000ms',
    );
  });

  it('should fail when the animation waits before it starts', async () => {
    const el = await createHost();
    el.box.classList.add('delayed');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include(
      'but expect-duration-fade runs 120ms after a 50ms delay',
    );
  });

  it('should fail when nothing is animating', async () => {
    const el = await createHost();

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include(
      'div.box should be animating',
    );
  });

  it('should fail when the property resolves to nothing, rather than measure against 0', async () => {
    const el = await createHost();
    el.box.classList.add('show');

    expect(await failureOf(expectAnimationDuration(el.box, '--not-a-token'))).to.include(
      '--not-a-token should resolve to a duration',
    );
  });

  it('should wait for an animation that starts a few microtasks after the change', async () => {
    const el = await createHost();
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(() => el.box.classList.add('show'))));

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.equal('');
  });

  it('should not wait a frame for an animation, since a short one could end in it', async () => {
    const el = await createHost();
    const frame = requestAnimationFrame(() => el.box.classList.add('show'));

    try {
      expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include('should be animating');
    } finally {
      cancelAnimationFrame(frame);
    }
  });

  it("should check the element's pseudo-elements", async () => {
    const el = await createHost();
    el.box.classList.add('show', 'before');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include(
      'but ::before expect-duration-fade runs 3000ms',
    );
  });

  it("should leave a descendant's animations to a check of their own", async () => {
    const el = await createHost();
    el.box.classList.add('show');
    el.child.classList.add('long');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.equal('');
  });

  it('should skip infinite animations', async () => {
    const el = await createHost();
    el.box.classList.add('spin');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.equal('');
  });

  it('should check only the animations whose name matches, when given one', async () => {
    const el = await createHost();
    el.box.classList.add('mixed');
    getComputedStyle(el.box).borderColor;
    el.box.classList.add('on');

    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration', { name: /^border-/ }))).to.equal('');
    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration'))).to.include(
      'but outline-color runs 60ms',
    );
    expect(await failureOf(expectAnimationDuration(el.box, '--test-duration', { name: /^margin-/ }))).to.include(
      'should be animating /^margin-/',
    );
  });
});
