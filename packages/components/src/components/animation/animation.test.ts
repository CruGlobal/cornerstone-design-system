import { aTimeout, expect, oneEvent } from '@open-wc/testing';
import { html } from 'lit';
import { clientFixture } from '../../internal/test/fixture.js';
import type CsAnimation from './animation.js';

/** Resolves after two animation frames, so any event the Web Animations API has queued has been dispatched. */
function nextFrames() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** The Web Animations `Animation` that `<cs-animation>` runs on its slotted element. */
function getAnimation(el: CsAnimation) {
  return el.querySelector('div')?.getAnimations()[0];
}

describe('<cs-animation>', () => {
  // Animation component only uses clientFixture because SSR/hydration has issues with animation promises.
  // See: https://github.com/lit/lit/issues/4739#issuecomment-2299899990
  for (const fixture of [clientFixture]) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation><div></div></cs-animation>`);

          expect(el.name).to.equal('none');
          expect(el.play).to.be.false;
          expect(el.delay).to.equal(0);
          expect(el.direction).to.equal('normal');
          expect(el.duration).to.equal(1000);
          expect(el.easing).to.equal('linear');
          expect(el.endDelay).to.equal(0);
          expect(el.fill).to.equal('auto');
          expect(el.iterations).to.equal(Infinity);
          expect(el.iterationStart).to.equal(0);
          expect(el.playbackRate).to.equal(1);
        });

        it('should reflect the "play" property to an attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation name="bounce"><div></div></cs-animation>`);

          expect(el.hasAttribute('play')).to.be.false;

          el.play = true;
          await el.updateComplete;
          expect(el.hasAttribute('play')).to.be.true;

          el.play = false;
          await el.updateComplete;
          expect(el.hasAttribute('play')).to.be.false;
        });

        it('should set the name property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation name="bounce"><div></div></cs-animation>`);

          expect(el.name).to.equal('bounce');
        });

        it('should set the duration property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation duration="500"><div></div></cs-animation>`);

          expect(el.duration).to.equal(500);
        });

        it('should set the delay property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation delay="200"><div></div></cs-animation>`);

          expect(el.delay).to.equal(200);
        });

        it('should set the iterations property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation iterations="3"><div></div></cs-animation>`);

          expect(el.iterations).to.equal(3);
        });

        it('should set the easing property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation easing="ease-in-out"><div></div></cs-animation>`);

          expect(el.easing).to.equal('ease-in-out');
        });

        it('should set the playback-rate property via attribute', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation playback-rate="2"><div></div></cs-animation>`);

          expect(el.playbackRate).to.equal(2);
        });

        it('should accept custom keyframes via the keyframes property', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation><div></div></cs-animation>`);

          const keyframes = [{ opacity: 0 }, { opacity: 1 }];
          el.keyframes = keyframes;
          await el.updateComplete;
          expect(el.keyframes).to.equal(keyframes);
        });

        it('should get and set currentTime', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1000"><div></div></cs-animation>`,
          );

          expect(el.currentTime).to.equal(0);

          el.currentTime = 500;
          expect(el.currentTime).to.equal(500);
        });
      });

      describe('events', () => {
        it('should emit cs-start when play is set to true', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1000"><div></div></cs-animation>`,
          );

          const startPromise = oneEvent(el, 'cs-start');
          el.play = true;
          await startPromise;
        });

        it('should emit cs-finish when the animation completes', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1" iterations="1"><div></div></cs-animation>`,
          );

          const finishPromise = oneEvent(el, 'cs-finish');
          el.play = true;
          await finishPromise;
        });

        it('should emit cs-cancel when the animation is cancelled', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000"><div></div></cs-animation>`,
          );

          el.play = true;
          await aTimeout(0);

          const cancelPromise = oneEvent(el, 'cs-cancel');
          el.cancel();
          await cancelPromise;
        });

        it('should not emit cs-finish when cancelled before completion', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000"><div></div></cs-animation>`,
          );

          let finishFired = false;
          oneEvent(el, 'cs-finish').then(() => {
            finishFired = true;
          });

          el.play = true;
          await aTimeout(0);

          const cancelPromise = oneEvent(el, 'cs-cancel');
          el.cancel();
          await cancelPromise;

          expect(finishFired).to.be.false;
        });

        it('should set play to false after the animation finishes', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1" iterations="1"><div></div></cs-animation>`,
          );

          const finishPromise = oneEvent(el, 'cs-finish');
          el.play = true;
          await finishPromise;

          expect(el.play).to.be.false;
        });

        it('should set play to false after the animation is cancelled', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000"><div></div></cs-animation>`,
          );

          el.play = true;
          await aTimeout(0);

          const cancelPromise = oneEvent(el, 'cs-cancel');
          el.cancel();
          await cancelPromise;

          expect(el.play).to.be.false;
        });
      });

      describe('slots', () => {
        it('should render slotted content in the default slot', async () => {
          const el = await fixture<CsAnimation>(html`
            <cs-animation>
              <div id="animated-box" style="width: 10px; height: 10px;"></div>
            </cs-animation>
          `);

          const child = el.querySelector('#animated-box');
          expect(child).to.exist;
        });
      });

      describe('behavior', () => {
        it('should not start the animation by default', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10"><div></div></cs-animation>`,
          );
          await aTimeout(0);

          expect(el.play).to.be.false;
        });

        it('should finish the animation programmatically', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" iterations="1"><div></div></cs-animation>`,
          );

          const finishPromise = oneEvent(el, 'cs-finish');
          el.play = true;
          await aTimeout(0);
          el.finish();
          await finishPromise;
        });

        it('should start playing when the play attribute is set initially', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" play><div></div></cs-animation>`,
          );

          expect(el.play).to.be.true;
        });
      });

      describe('restart()', () => {
        it('should replay a finished animation, emitting cs-start and cs-finish again', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1" iterations="1"><div></div></cs-animation>`,
          );
          const events: string[] = [];
          for (const type of ['cs-start', 'cs-cancel', 'cs-finish']) {
            el.addEventListener(type, () => events.push(type));
          }

          el.play = true;
          await oneEvent(el, 'cs-finish');
          await el.updateComplete;
          expect(el.hasAttribute('play')).to.be.false;

          const finishPromise = oneEvent(el, 'cs-finish');
          el.restart();
          expect(el.play).to.be.true;
          await el.updateComplete;
          expect(el.hasAttribute('play')).to.be.true;
          await finishPromise;

          expect(events).to.deep.equal(['cs-start', 'cs-finish', 'cs-start', 'cs-finish']);
        });

        it('should replay when called from a cs-finish listener', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="1" iterations="1"><div></div></cs-animation>`,
          );
          el.addEventListener('cs-finish', () => el.restart(), { once: true });

          el.play = true;
          await oneEvent(el, 'cs-finish');
          expect(el.play).to.be.true;

          await oneEvent(el, 'cs-finish');
        });

        it('should rewind a running animation to the start', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" iterations="1" play><div></div></cs-animation>`,
          );
          await nextFrames();
          el.currentTime = 6000;
          expect(el.currentTime).to.equal(6000);

          el.restart();

          expect(Number(el.currentTime)).to.be.below(100);
          expect(el.play).to.be.true;
          expect(getAnimation(el)?.playState).to.equal('running');
        });

        it('should play a paused animation from the start and set play', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" iterations="1" play><div></div></cs-animation>`,
          );
          el.play = false;
          await el.updateComplete;
          el.currentTime = 6000;
          expect(getAnimation(el)?.playState).to.equal('paused');

          el.restart();
          await el.updateComplete;

          expect(el.play).to.be.true;
          expect(el.hasAttribute('play')).to.be.true;
          expect(Number(el.currentTime)).to.be.below(100);
          expect(getAnimation(el)?.playState).to.equal('running');
        });

        it('should replay a canceled animation', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" iterations="1" play><div></div></cs-animation>`,
          );
          const cancelPromise = oneEvent(el, 'cs-cancel');
          el.cancel();
          await cancelPromise;
          expect(el.play).to.be.false;

          const startPromise = oneEvent(el, 'cs-start');
          el.restart();
          await startPromise;
          expect(el.play).to.be.true;

          const finishPromise = oneEvent(el, 'cs-finish');
          el.finish();
          await finishPromise;
        });

        it('should emit cs-start, and neither cs-cancel nor cs-finish, when it interrupts a run', async () => {
          const el = await fixture<CsAnimation>(
            html`<cs-animation name="bounce" duration="10000" iterations="1" play><div></div></cs-animation>`,
          );
          const events: string[] = [];
          for (const type of ['cs-start', 'cs-cancel', 'cs-finish']) {
            el.addEventListener(type, () => events.push(type));
          }
          el.currentTime = 6000;

          el.restart();
          await nextFrames();

          expect(events).to.deep.equal(['cs-start']);
        });

        it('should replay the delay, then begin again at the first iteration', async () => {
          const el = await fixture<CsAnimation>(html`
            <cs-animation name="bounce" delay="1000" duration="1000" iterations="2" direction="alternate" play>
              <div></div>
            </cs-animation>
          `);
          // Past the delay and into the second iteration, which "alternate" plays in reverse.
          el.currentTime = 2250;
          expect(getAnimation(el)?.effect?.getComputedTiming().currentIteration).to.equal(1);

          el.restart();

          // Back inside the delay, where a fill of "auto" applies no effect.
          const inDelay = getAnimation(el)?.effect?.getComputedTiming();
          expect(Number(inDelay?.localTime)).to.be.below(100);
          expect(inDelay?.progress).to.equal(null);

          // A quarter of the way into the first iteration, which "alternate" plays forward.
          el.currentTime = 1250;
          const firstIteration = getAnimation(el)?.effect?.getComputedTiming();
          expect(firstIteration?.currentIteration).to.equal(0);
          expect(firstIteration?.progress).to.be.closeTo(0.25, 0.001);
        });

        it('should not throw when nothing is slotted, and should start once something is', async () => {
          const el = await fixture<CsAnimation>(html`<cs-animation name="bounce" duration="10000"></cs-animation>`);

          expect(() => el.restart()).not.to.throw();
          expect(el.play).to.be.true;

          const startPromise = oneEvent(el, 'cs-start');
          el.append(document.createElement('div'));
          await startPromise;
        });

        it('should not throw before the element has rendered, and should start once it has', async () => {
          await customElements.whenDefined('cs-animation');
          const container = await fixture<HTMLDivElement>(html`<div></div>`);
          const el = document.createElement('cs-animation');
          el.name = 'bounce';
          el.duration = 10000;
          el.append(document.createElement('div'));

          expect(() => el.restart()).not.to.throw();
          expect(el.play).to.be.true;

          const startPromise = oneEvent(el, 'cs-start');
          container.append(el);
          await startPromise;
        });
      });
    });
  }
});
