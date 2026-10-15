import { aTimeout, expect } from '@open-wc/testing';
import { useFakeFrameClock } from './fake-frame-clock.js';

// Client-only: this is a test helper with no rendering of its own.
describe('fake-frame-clock (client-only)', () => {
  it('should run frame callbacks only when the clock is ticked', async () => {
    const clock = useFakeFrameClock();
    try {
      let frames = 0;
      requestAnimationFrame(() => frames++);
      await aTimeout(50);
      expect(frames).to.equal(0);

      clock.tick(16);
      expect(frames).to.equal(1);
    } finally {
      clock.restore();
    }
  });

  it('should move performance.now() with the clock, starting above 0', () => {
    const clock = useFakeFrameClock();
    try {
      const start = performance.now();
      expect(start).to.be.greaterThan(0);

      clock.tick(250);
      expect(performance.now() - start).to.equal(250);
    } finally {
      clock.restore();
    }
  });

  it('should leave timers real', async () => {
    const clock = useFakeFrameClock();
    try {
      let fired = false;
      setTimeout(() => (fired = true), 0);
      await aTimeout(20);
      expect(fired).to.be.true;
    } finally {
      clock.restore();
    }
  });

  it('should put the real frame loop back on restore', async () => {
    const clock = useFakeFrameClock();
    clock.restore();

    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
});
