import sinon from 'sinon';

/**
 * Fakes `requestAnimationFrame` and `performance.now()`, and nothing else, so a frame loop moves only when the test
 * ticks the clock instead of whenever a busy runner gets round to a frame. Timers stay real, and so do CSS
 * animations and the events they end with. Call `restore()` when done, in a `finally`.
 *
 * The clock starts a second in rather than at 0, because code that keeps a start time commonly takes 0 to mean "not
 * started"; `cs-toast-item`'s countdown does.
 */
export function useFakeFrameClock() {
  const clock = sinon.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  clock.tick(1000);
  return clock;
}
