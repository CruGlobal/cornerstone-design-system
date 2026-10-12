/**
 * Probe, not a regression test. `cs-time-input` moves focus into its first column only after the popup's show
 * animation ends (`moveFocusToColumnOnShow`), the same shape as `cs-dropdown`. This measures what a key pressed
 * inside that window does, against the same key pressed after it. Findings: `docs/research/dropdown-early-keys.md`.
 *
 * The window is made deterministic with `--show-duration: 10s` and `Animation.finish()`. Each case asserts only
 * that it landed where it says. Observations are written to `packages/components/.probe-results/` (not committed).
 *
 * Run: `WTR_CONCURRENCY=1 npx web-test-runner --group time-input-early-keys` from `packages/components`.
 */
import { expect, waitUntil } from '@open-wc/testing';
import { emulateMedia, sendKeys, writeFile } from '@web/test-runner-commands';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsTimeInput from './time-input.js';

const ua = navigator.userAgent;
const engine = ua.includes('Firefox/')
  ? 'firefox'
  : ua.includes('Chrome') || ua.includes('Chromium')
    ? 'chromium'
    : 'webkit';

const KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'] as const;

const results = new Map<string, unknown>();

after(async () => {
  const sorted = Object.fromEntries([...results.entries()].sort(([a], [b]) => a.localeCompare(b)));
  await writeFile({
    path: `../../../.probe-results/time-input-early-keys/${engine}.json`,
    content: JSON.stringify({ engine, userAgent: ua, results: sorted }, null, 2),
  });
});

function nextFrames(count = 2) {
  return new Promise<void>((resolve) => {
    const step = (remaining: number) => (remaining <= 0 ? resolve() : requestAnimationFrame(() => step(remaining - 1)));
    step(count);
  });
}

function popupOf(el: CsTimeInput) {
  return el.shadowRoot!.querySelector('cs-popup') as unknown as { popup: HTMLElement; active: boolean };
}

function snapshot(el: CsTimeInput, afterInput: HTMLElement) {
  const inner = el.shadowRoot!.activeElement as HTMLElement | null;
  let focus: string;
  if (document.activeElement === el && inner?.dataset.segment) {
    focus = `segment:${inner.dataset.segment}`;
  } else if (document.activeElement === el && inner?.classList.contains('column')) {
    focus = `column:${inner.dataset.field}`;
  } else if (document.activeElement === el) {
    focus = inner ? inner.localName : 'host';
  } else if (document.activeElement === afterInput) {
    focus = 'after';
  } else if (!document.activeElement || document.activeElement === document.body) {
    focus = 'body';
  } else {
    focus = document.activeElement.localName;
  }
  return {
    focus,
    value: el.value,
    open: el.open,
    popupActive: popupOf(el).active,
    animating: popupOf(el).popup.getAnimations().length > 0,
  };
}

describe('<cs-time-input> keys during the show animation (probe)', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      async function setup(slow: boolean) {
        const wrapper = await fixture<HTMLDivElement>(html`
          <div>
            <cs-time-input lang="en-GB" label="Start" value="10:30" style="--show-duration: 10s"></cs-time-input>
            <input id="after" aria-label="After" />
          </div>
        `);
        const el = wrapper.querySelector<CsTimeInput>('cs-time-input')!;
        if (!slow) {
          el.style.removeProperty('--show-duration');
        }
        await el.updateComplete;
        const hour = el.shadowRoot!.querySelector<HTMLElement>('[data-segment="hour"]')!;
        hour.focus();
        await nextFrames(2);
        if (el.open) {
          el.hide();
          await waitUntil(() => !popupOf(el).active);
          hour.focus();
        }
        return { el, hour, afterInput: wrapper.querySelector<HTMLElement>('#after')! };
      }

      for (const key of KEYS) {
        for (const timing of ['window', 'control'] as const) {
          it(`opened by Alt+ArrowDown, ${key} pressed ${timing === 'window' ? 'during' : 'after'} the show animation`, async () => {
            const { el, afterInput } = await setup(true);
            const id = `${fixture.type} | Alt+ArrowDown | ${key} | ${timing}`;

            await sendKeys({ press: 'Alt+ArrowDown' });
            await waitUntil(() => el.open && popupOf(el).popup.getAnimations().length > 0, 'the popup never animated', {
              timeout: 1000,
              interval: 5,
            });

            if (timing === 'control') {
              for (const animation of popupOf(el).popup.getAnimations()) {
                animation.finish();
              }
              await waitUntil(() => snapshot(el, afterInput).focus === 'column:hour', 'focus never reached the column');
            }

            const before = snapshot(el, afterInput);
            if (timing === 'window') {
              expect(before.animating, 'the key must land while the show animation runs').to.be.true;
              expect(before.focus, 'focus must still be on the segment').to.equal('segment:hour');
            } else {
              expect(before.animating, 'the control key must land after the show animation').to.be.false;
            }

            await sendKeys({ press: key });
            await nextFrames(2);
            const during = snapshot(el, afterInput);

            for (const animation of popupOf(el).popup.getAnimations()) {
              animation.finish();
            }
            await waitUntil(() => popupOf(el).popup.getAnimations().length === 0, 'the popup animation never ended', {
              timeout: 3000,
            });
            await el.updateComplete;
            await nextFrames(4);

            results.set(id, { before, during, after: snapshot(el, afterInput) });
          });
        }
      }

      describe('at the shipped duration (75ms)', () => {
        for (const motion of ['no-preference', 'reduce'] as const) {
          describe(`with prefers-reduced-motion: ${motion}`, () => {
            before(async () => {
              await emulateMedia({ reducedMotion: motion });
            });

            after(async () => {
              await emulateMedia({ reducedMotion: 'no-preference' });
            });

            for (let run = 1; run <= 3; run++) {
              it(`Alt+ArrowDown then ArrowDown as fast as the harness sends them (run ${run})`, async () => {
                expect(matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(motion === 'reduce');
                const { el, afterInput } = await setup(false);
                const keyTimes: number[] = [];
                let afterShowAt = 0;
                const onKey = (event: KeyboardEvent) => event.key !== 'Alt' && keyTimes.push(performance.now());
                document.addEventListener('keydown', onKey, { capture: true });
                el.addEventListener('cs-after-show', () => (afterShowAt ||= performance.now()));

                await sendKeys({ press: 'Alt+ArrowDown' });
                await sendKeys({ press: 'ArrowDown' });
                await waitUntil(() => afterShowAt > 0, 'cs-after-show never fired', { interval: 1 });
                await nextFrames(4);
                document.removeEventListener('keydown', onKey, { capture: true });

                expect(keyTimes.length).to.equal(2);
                results.set(`${fixture.type} | shipped duration | ${motion} | Alt+ArrowDown+ArrowDown | run ${run}`, {
                  windowMs: Math.round(afterShowAt - keyTimes[0]),
                  secondKeyAfterOpenMs: Math.round(keyTimes[1] - keyTimes[0]),
                  secondKeyLandedInWindow: keyTimes[1] < afterShowAt,
                  after: snapshot(el, afterInput),
                });
              });
            }
          });
        }
      });
    });
  }
});
