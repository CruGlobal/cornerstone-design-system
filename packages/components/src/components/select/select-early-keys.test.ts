/**
 * Probe, not a regression test: the control for `docs/research/dropdown-early-keys.md`. `cs-select` keeps focus
 * on its combobox, sets its current option before the show animation, and handles keys through one handler keyed
 * on `open`, so a key pressed inside the show animation should act exactly as it does after. This measures that.
 *
 * The window is made deterministic with `--show-duration: 10s` and `Animation.finish()`. Each case asserts only
 * that it landed where it says. Observations are written to `packages/components/.probe-results/` (not committed).
 *
 * Run: `WTR_CONCURRENCY=1 npx web-test-runner --group select-early-keys` from `packages/components`.
 */
import { expect, waitUntil } from '@open-wc/testing';
import { sendKeys, writeFile } from '@web/test-runner-commands';
import { html } from 'lit';
import { fixtures } from '../../internal/test/fixture.js';
import type CsSelect from './select.js';

const ua = navigator.userAgent;
const engine = ua.includes('Firefox/')
  ? 'firefox'
  : ua.includes('Chrome') || ua.includes('Chromium')
    ? 'chromium'
    : 'webkit';

const OPENERS = ['Enter', 'ArrowDown'] as const;
const KEYS = ['ArrowDown', 'End', 'Enter', 'Escape'] as const;

const results = new Map<string, unknown>();

after(async () => {
  const sorted = Object.fromEntries([...results.entries()].sort(([a], [b]) => a.localeCompare(b)));
  await writeFile({
    path: `../../../.probe-results/select-early-keys/${engine}.json`,
    content: JSON.stringify({ engine, userAgent: ua, results: sorted }, null, 2),
  });
});

function nextFrames(count = 2) {
  return new Promise<void>((resolve) => {
    const step = (remaining: number) => (remaining <= 0 ? resolve() : requestAnimationFrame(() => step(remaining - 1)));
    step(count);
  });
}

function popupOf(el: CsSelect) {
  return el.shadowRoot!.querySelector('cs-popup') as unknown as { popup: HTMLElement; active: boolean };
}

function snapshot(el: CsSelect) {
  const inner = el.shadowRoot!.activeElement as HTMLElement | null;
  const focus =
    document.activeElement === el
      ? inner?.getAttribute('role') === 'combobox' || inner?.localName === 'input'
        ? 'combobox'
        : (inner?.localName ?? 'host')
      : document.activeElement === document.body
        ? 'body'
        : (document.activeElement?.localName ?? 'none');
  return {
    focus,
    current: (el as unknown as { currentOption?: { value: string } }).currentOption?.value ?? null,
    value: el.value,
    open: el.open,
    animating: popupOf(el).popup.getAnimations().length > 0,
  };
}

describe('<cs-select> keys during the show animation (probe, control)', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      for (const opener of OPENERS) {
        for (const key of KEYS) {
          for (const timing of ['window', 'control'] as const) {
            it(`opened by ${opener}, ${key} pressed ${timing === 'window' ? 'during' : 'after'} the show animation`, async () => {
              const el = await fixture<CsSelect>(html`
                <cs-select label="Fruit" value="apple" style="--show-duration: 10s">
                  <cs-option value="apple">Apple</cs-option>
                  <cs-option value="banana">Banana</cs-option>
                  <cs-option value="cherry">Cherry</cs-option>
                  <cs-option value="damson">Damson</cs-option>
                </cs-select>
              `);
              await el.updateComplete;
              el.focus();
              await sendKeys({ press: opener });
              await waitUntil(() => el.open && popupOf(el).popup.getAnimations().length > 0, 'never animated', {
                timeout: 1000,
                interval: 5,
              });

              if (timing === 'control') {
                for (const animation of popupOf(el).popup.getAnimations()) {
                  animation.finish();
                }
                await nextFrames(4);
              }

              const before = snapshot(el);
              expect(before.animating, `animating at the ${timing} key`).to.equal(timing === 'window');

              await sendKeys({ press: key });
              await nextFrames(2);
              const during = snapshot(el);

              for (const animation of popupOf(el).popup.getAnimations()) {
                animation.finish();
              }
              await waitUntil(() => popupOf(el).popup.getAnimations().length === 0, 'animation never ended', {
                timeout: 3000,
              });
              await el.updateComplete;
              await nextFrames(4);

              results.set(`${fixture.type} | ${opener} | ${key} | ${timing}`, { before, during, after: snapshot(el) });
            });
          }
        }
      }
    });
  }
});
