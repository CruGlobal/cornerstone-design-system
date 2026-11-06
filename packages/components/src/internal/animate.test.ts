import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { animateWithClass } from './animate.js';
import { descendantAnimationStops, frames, startDescendantAnimation } from './test/descendant-animation.js';

// Long enough that nothing ends unless a test ends it.
const STYLES = `
  @keyframes animate-test-fade {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }

  .animate-test.run {
    animation: animate-test-fade 60s;
  }

  .animate-test.with-pseudo.run::before {
    content: '';
    animation: animate-test-fade 60s;
  }
`;

/** A child whose animation runs inside its own shadow root, the way `<cs-spinner>`'s does. */
class AnimateTestShadowHost extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        @keyframes animate-test-spin { to { rotate: 1turn; } }
        div { animation: animate-test-spin 1s; }
      </style>
      <div></div>
    `;
  }
}

if (!customElements.get('animate-test-shadow-host')) {
  customElements.define('animate-test-shadow-host', AnimateTestShadowHost);
}

/** Starts `animateWithClass()` without awaiting it, so a test can check whether it has settled yet. */
function track(el: Element, className: string) {
  const state = { settled: false, done: Promise.resolve() };
  state.done = animateWithClass(el, className).then(() => {
    state.settled = true;
  });
  return state;
}

/**
 * Ends the animation the class runs on `el` itself; `getAnimations()` leaves out its pseudo-elements and descendants.
 * Its `animationend` is sent in the next rendering update, and Chromium schedules none for `finish()` alone, so this
 * waits for one.
 */
async function finishOwnAnimation(el: Element) {
  const [animation] = el.getAnimations();
  expect(animation, 'the class should animate the element itself').to.exist;
  animation.finish();
  await frames(1);
}

describe('animateWithClass()', () => {
  let style: HTMLStyleElement;

  before(() => {
    style = document.createElement('style');
    style.textContent = STYLES;
    document.head.append(style);
  });

  after(() => {
    style.remove();
  });

  it("should remove the class and resolve when the element's own animation ends", async () => {
    const el = await fixture<HTMLDivElement>(html`<div class="animate-test"></div>`);
    const run = track(el, 'run');
    await frames(2);

    expect(run.settled).to.be.false;
    expect(el.classList.contains('run')).to.be.true;

    await finishOwnAnimation(el);
    await run.done;

    expect(el.classList.contains('run')).to.be.false;
  });

  it("should remove the class and resolve when the element's own animation is cancelled", async () => {
    const el = await fixture<HTMLDivElement>(html`<div class="animate-test"></div>`);
    const run = track(el, 'run');
    await frames(2);

    el.style.animationName = 'none';
    await run.done;

    expect(el.classList.contains('run')).to.be.false;
  });

  it('should resolve on the next frame when the class starts no animation', async () => {
    const el = await fixture<HTMLDivElement>(html`<div class="animate-test"></div>`);

    await animateWithClass(el, 'inert');

    expect(el.classList.contains('inert')).to.be.false;
  });

  // Animation events bubble, so each of these reaches a listener on the element. Only its own animation may end it, and
  // it must still hear that after ignoring another: a listener added with `once` is gone after the first event.
  describe("when something else's animation stops first", () => {
    for (const { name, animation, stop } of descendantAnimationStops) {
      it(`should wait for its own animation when a child's animation ${name}`, async () => {
        const el = await fixture<HTMLDivElement>(html`<div class="animate-test"><div class="child"></div></div>`);
        const child = el.querySelector<HTMLElement>('.child')!;
        const run = track(el, 'run');

        await startDescendantAnimation(child, animation);
        stop(child);
        await frames(2);

        expect(run.settled, "resolved on the child's animation").to.be.false;
        expect(el.classList.contains('run')).to.be.true;

        await finishOwnAnimation(el);
        await run.done;

        expect(el.classList.contains('run')).to.be.false;
      });
    }

    // Non-composed, so the event stops at the child's shadow root and never reaches the element at all.
    it("should wait for its own animation when one inside a child's shadow root ends", async () => {
      const el = await fixture<HTMLDivElement>(
        html`<div class="animate-test"><animate-test-shadow-host></animate-test-shadow-host></div>`,
      );
      const inner = el.querySelector('animate-test-shadow-host')!.shadowRoot!.querySelector('div')!;
      const run = track(el, 'run');
      await frames(2);

      inner.getAnimations()[0].finish();
      await frames(2);

      expect(run.settled, "resolved on the shadow child's animation").to.be.false;

      await finishOwnAnimation(el);
      await run.done;
    });

    // An animation on a pseudo-element fires with the element itself as its target. The dialog and drawer animate
    // their `::backdrop` alongside the panel, and only the panel's end means the panel has finished moving.
    it('should wait for its own animation when one on its pseudo-element ends', async () => {
      const el = await fixture<HTMLDivElement>(html`<div class="animate-test with-pseudo"></div>`);
      const run = track(el, 'run');
      await frames(2);

      const pseudoAnimation = el
        .getAnimations({ subtree: true })
        .find((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === '::before');
      expect(pseudoAnimation, 'the class should animate ::before').to.exist;

      pseudoAnimation!.finish();
      await frames(2);

      expect(run.settled, "resolved on the pseudo-element's animation").to.be.false;
      expect(el.classList.contains('run')).to.be.true;

      await finishOwnAnimation(el);
      await run.done;

      expect(el.classList.contains('run')).to.be.false;
    });
  });
});
