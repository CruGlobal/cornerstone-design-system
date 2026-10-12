/**
 * Probe, not a regression test. It measures what happens to a key pressed while `cs-dropdown`'s show
 * animation is still running, against the same key pressed after the animation ends. The findings and the
 * per-key, per-engine table are in `docs/research/dropdown-early-keys.md` at the repo root.
 *
 * The window is made deterministic by slowing the show animation to 10s through `--show-duration`, sending
 * the key, then finishing the animation by hand with `Animation.finish()`. Each case asserts only that it
 * really landed where it says (inside the window, or after it for the controls), so a case cannot pass
 * without measuring. What it observed is written as JSON to `packages/components/.probe-results/` through the
 * runner's file command, one file per engine; that directory is not committed.
 *
 * Run one group, serially: `WTR_CONCURRENCY=1 npx web-test-runner --group dropdown-early-keys`
 * from `packages/components`, after `npm run build`.
 */
import { expect, waitUntil } from '@open-wc/testing';
import { emulateMedia, resetMouse, sendKeys, writeFile } from '@web/test-runner-commands';
import { html } from 'lit';
import { activeElements } from '../../internal/active-elements.js';
import { fixtures } from '../../internal/test/fixture.js';
import { clickOnElement } from '../../internal/test/pointer-utilities.js';
import type CsDropdownItem from '../dropdown-item/dropdown-item.js';
import type CsDropdown from './dropdown.js';

type Opener = 'Enter' | 'Space' | 'ArrowDown' | 'click';
type ProbeKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' | 'Enter' | 'Space' | 'Escape' | 'Tab' | 'c';

const OPENERS: Opener[] = ['Enter', 'Space', 'ArrowDown', 'click'];
const KEYS: ProbeKey[] = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Escape', 'Tab', 'c'];

const ua = navigator.userAgent;
const engine = ua.includes('Firefox/')
  ? 'firefox'
  : ua.includes('Chrome') || ua.includes('Chromium')
    ? 'chromium'
    : 'webkit';

interface Snapshot {
  /** Where focus is: `item:<value>`, `trigger`, `after`, `body`, or a tag name. */
  focus: string;
  /** False when the focused item has no layout box, i.e. it sits in a popup that has been hidden. */
  focusRendered: boolean;
  /** Whether the focused item matches `:focus-visible`, which is what draws its focus ring. */
  focusVisible: boolean;
  /** Values of the items whose `active` flag is set. */
  active: string[];
  open: boolean;
  popupActive: boolean;
  animating: boolean;
}

const results = new Map<string, unknown>();

function record(id: string, value: unknown) {
  results.set(id, value);
}

after(async () => {
  const sorted = Object.fromEntries([...results.entries()].sort(([a], [b]) => a.localeCompare(b)));
  await writeFile({
    path: `../../../.probe-results/dropdown-early-keys/${engine}.json`,
    content: JSON.stringify({ engine, userAgent: ua, results: sorted }, null, 2),
  });
});

afterEach(async () => {
  await resetMouse();
});

function nextFrames(count = 2) {
  return new Promise<void>((resolve) => {
    const step = (remaining: number) => (remaining <= 0 ? resolve() : requestAnimationFrame(() => step(remaining - 1)));
    step(count);
  });
}

function menuOf(el: CsDropdown) {
  return el.shadowRoot!.querySelector<HTMLElement>('#menu')!;
}

function popupActive(el: CsDropdown) {
  return Boolean((el.shadowRoot!.querySelector('cs-popup') as unknown as { active: boolean }).active);
}

function itemsOf(el: CsDropdown) {
  return [...el.querySelectorAll<CsDropdownItem>('cs-dropdown-item')];
}

function snapshot(el: CsDropdown, afterButton: HTMLElement, animatedEl: Element = menuOf(el)): Snapshot {
  const chain = [...activeElements()];
  const deepest = chain[chain.length - 1];
  const item = chain.find((node) => node.localName === 'cs-dropdown-item') as CsDropdownItem | undefined;
  const trigger = el.querySelector('[slot="trigger"]')!;

  let focus: string;
  if (item) {
    focus = `item:${item.value}`;
  } else if (chain.includes(trigger)) {
    focus = 'trigger';
  } else if (chain.includes(afterButton)) {
    focus = 'after';
  } else if (!deepest || deepest === document.body) {
    focus = 'body';
  } else {
    focus = deepest.localName;
  }

  return {
    focus,
    focusRendered: item ? item.getClientRects().length > 0 : true,
    focusVisible: item ? item.matches(':focus-visible') : false,
    active: itemsOf(el)
      .filter((candidate) => candidate.active)
      .map((candidate) => candidate.value),
    open: el.open,
    popupActive: popupActive(el),
    animating: animatedEl.getAnimations().length > 0,
  };
}

/** Records the order of dropdown events and of focus arriving on the trigger, an item or the after button. */
function trackEvents(wrapper: HTMLElement, el: CsDropdown) {
  const log: string[] = [];
  for (const name of ['cs-show', 'cs-after-show', 'cs-hide', 'cs-after-hide']) {
    el.addEventListener(name, () => log.push(name));
  }
  el.addEventListener('cs-select', (event) =>
    log.push(`cs-select:${(event as CustomEvent).detail.item.value as string}`),
  );
  wrapper.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    if (target.localName === 'cs-dropdown-item') {
      log.push(`focus:${(target as CsDropdownItem).value}`);
    } else if (target.slot === 'trigger') {
      log.push('focus:trigger');
    } else if (target.id === 'after') {
      log.push('focus:after');
    }
  });
  return log;
}

async function settle(el: CsDropdown) {
  await waitUntil(() => menuOf(el).getAnimations().length === 0, 'the menu animation never ended', {
    timeout: 3000,
  });
  await el.updateComplete;
  // Submenu focus moves run in setTimeout(0) after the animation; four frames is past all of them.
  await nextFrames(4);
}

async function openWith(el: CsDropdown, opener: Opener) {
  const trigger = el.querySelector<HTMLElement>('[slot="trigger"]')!;
  if (opener === 'click') {
    await clickOnElement(trigger);
  } else {
    trigger.focus();
    await sendKeys({ press: opener });
  }

  try {
    await waitUntil(() => el.open && menuOf(el).getAnimations().length > 0, '', { timeout: 500, interval: 5 });
    return true;
  } catch {
    return false;
  }
}

describe('<cs-dropdown> keys during the show animation (probe)', () => {
  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      async function setup(slow: boolean) {
        const wrapper = await fixture<HTMLDivElement>(html`
          <div>
            <cs-dropdown style="--show-duration: 10s">
              <cs-button slot="trigger">Fruit</cs-button>
              <cs-dropdown-item value="apple">Apple</cs-dropdown-item>
              <cs-dropdown-item value="banana">Banana</cs-dropdown-item>
              <cs-dropdown-item value="cherry">Cherry</cs-dropdown-item>
              <cs-dropdown-item value="damson">Damson</cs-dropdown-item>
            </cs-dropdown>
            <input id="after" aria-label="After" />
          </div>
        `);
        const el = wrapper.querySelector<CsDropdown>('cs-dropdown')!;
        if (!slow) {
          el.style.removeProperty('--show-duration');
        }
        const afterButton = wrapper.querySelector<HTMLElement>('#after')!;
        await el.updateComplete;
        await waitUntil(() => itemsOf(el).every((item) => item.hasAttribute('aria-posinset')));
        await waitUntil(() => itemsOf(el)[0].active);
        return { wrapper, el, afterButton };
      }

      for (const opener of OPENERS) {
        for (const key of KEYS) {
          for (const timing of ['window', 'control'] as const) {
            it(`opened by ${opener}, ${key} pressed ${timing === 'window' ? 'during' : 'after'} the show animation`, async () => {
              const { wrapper, el, afterButton } = await setup(true);
              const log = trackEvents(wrapper, el);
              const id = `${fixture.type} | ${opener} | ${key} | ${timing}`;

              const opened = await openWith(el, opener);
              if (!opened) {
                record(id, { opened: false, snapshot: snapshot(el, afterButton), log: [...log] });
                return;
              }

              if (timing === 'control') {
                for (const animation of menuOf(el).getAnimations()) {
                  animation.finish();
                }
                await waitUntil(
                  () => snapshot(el, afterButton).focus === 'item:apple',
                  'focus never reached the first item',
                );
              }

              const before = snapshot(el, afterButton);
              if (timing === 'window') {
                expect(before.animating, 'the key must land while the show animation runs').to.be.true;
              } else {
                expect(before.animating, 'the control key must land after the show animation').to.be.false;
              }

              await sendKeys({ press: key });
              await nextFrames(2);
              const during = snapshot(el, afterButton);

              for (const animation of menuOf(el).getAnimations()) {
                animation.finish();
              }
              await settle(el);
              const settled = snapshot(el, afterButton);

              record(id, { opened: true, before, during, after: settled, log: [...log] });
            });
          }
        }
      }

      // The suite's own axe test runs with the menu closed, where the popup is display: none and axe skips it.
      // This opens the menu first and records what axe reports, rather than asserting it, so the probe stays
      // runnable whatever the answer is.
      it('axe with the menu open (recorded)', async () => {
        const { el, afterButton } = await setup(false);
        el.querySelector<HTMLElement>('[slot="trigger"]')!.focus();
        await sendKeys({ press: 'Enter' });
        await waitUntil(() => snapshot(el, afterButton).focus === 'item:apple', 'focus never reached the first item');
        expect(el.open).to.be.true;

        let axe = 'no violations';
        try {
          await expect(el).to.be.accessible();
        } catch (error) {
          axe = (error as Error).message;
        }
        record(`${fixture.type} | axe with the menu open`, {
          axe,
          menuAriaExpanded: menuOf(el).getAttribute('aria-expanded'),
        });
      });

      describe('at the shipped duration (75ms)', () => {
        for (const motion of ['no-preference', 'reduce'] as const) {
          describe(`with prefers-reduced-motion: ${motion}`, () => {
            before(async () => {
              await emulateMedia({ reducedMotion: motion });
            });

            after(async () => {
              await emulateMedia({ reducedMotion: 'no-preference' });
            });

            for (const second of [null, 'ArrowDown', 'Enter', 'Escape'] as const) {
              for (let run = 1; run <= 3; run++) {
                const name = second ? `Enter then ${second} as fast as the harness sends them` : 'Enter alone';
                it(`${name} (run ${run})`, async () => {
                  expect(
                    matchMedia('(prefers-reduced-motion: reduce)').matches,
                    'the motion emulation took effect',
                  ).to.equal(motion === 'reduce');
                  const { wrapper, el, afterButton } = await setup(false);
                  const log = trackEvents(wrapper, el);
                  const keyTimes: number[] = [];
                  let afterShowAt = 0;
                  let afterHideAt = 0;
                  let firstItemFocusedAt = 0;
                  let sawAnimation = false;
                  const onKey = () => keyTimes.push(performance.now());
                  document.addEventListener('keydown', onKey, { capture: true });
                  el.addEventListener('cs-after-show', () => (afterShowAt ||= performance.now()));
                  el.addEventListener('cs-after-hide', () => (afterHideAt ||= performance.now()));
                  // When the component itself puts focus on the first item: at the end of the show animation today.
                  wrapper.addEventListener('focusin', (event) => {
                    if ((event.target as CsDropdownItem).value === 'apple') {
                      firstItemFocusedAt ||= performance.now();
                    }
                  });

                  el.querySelector<HTMLElement>('[slot="trigger"]')!.focus();
                  await sendKeys({ press: 'Enter' });
                  sawAnimation ||= menuOf(el).getAnimations().length > 0;
                  if (second) {
                    await sendKeys({ press: second });
                  }
                  await waitUntil(
                    () => {
                      sawAnimation ||= menuOf(el).getAnimations().length > 0;
                      // cs-after-show does not fire when the menu closed during the show animation.
                      return firstItemFocusedAt > 0 && (afterShowAt > 0 || afterHideAt > 0);
                    },
                    'the menu never finished showing or hiding',
                    { interval: 1 },
                  );
                  await settle(el);
                  document.removeEventListener('keydown', onKey, { capture: true });

                  expect(keyTimes.length, 'every key reached the page').to.equal(second ? 2 : 1);
                  const [enterAt, secondAt] = keyTimes;

                  record(
                    `${fixture.type} | shipped duration | ${motion} | Enter${second ? `+${second}` : ''} | run ${run}`,
                    {
                      sawAnimation,
                      focusWaitedMs: Math.round(firstItemFocusedAt - enterAt),
                      afterShowFired: afterShowAt > 0,
                      secondKeyAfterEnterMs: second ? Math.round(secondAt - enterAt) : null,
                      secondKeyBeforeFocusMoved: second ? secondAt < firstItemFocusedAt : null,
                      after: snapshot(el, afterButton),
                      log: [...log],
                    },
                  );
                });
              }
            }
          });
        }
      });
    });
  }

  // Client-only, deliberately. Under the "ssr-client-hydrated" fixture a `cs-dropdown-item` that has a submenu
  // fails hydration ("Hydration value mismatch: Unexpected TemplateResult rendered to part"), so the case cannot
  // reach the behaviour it measures. The existing submenu tests in `dropdown.test.ts` also run client-only, through
  // `fixtures[0]`, without saying why. The hydration failure is recorded in the research note as its own finding.
  describe('submenu (client-only)', () => {
    for (const timing of ['window', 'control'] as const) {
      it(`ArrowDown ${timing === 'window' ? 'during' : 'after'} the submenu show animation`, async () => {
        const wrapper = await fixtures[0]<HTMLDivElement>(html`
          <div>
            <cs-dropdown style="--show-duration: 10s">
              <cs-button slot="trigger">Fruit</cs-button>
              <cs-dropdown-item value="more">
                More
                <cs-dropdown-item slot="submenu" value="grape">Grape</cs-dropdown-item>
                <cs-dropdown-item slot="submenu" value="lemon">Lemon</cs-dropdown-item>
                <cs-dropdown-item slot="submenu" value="mango">Mango</cs-dropdown-item>
              </cs-dropdown-item>
              <cs-dropdown-item value="banana">Banana</cs-dropdown-item>
            </cs-dropdown>
            <input id="after" aria-label="After" />
          </div>
        `);
        const el = wrapper.querySelector<CsDropdown>('cs-dropdown')!;
        const afterButton = wrapper.querySelector<HTMLElement>('#after')!;
        const more = el.querySelector<CsDropdownItem>('cs-dropdown-item[value="more"]')!;
        await el.updateComplete;
        await waitUntil(() => more.active && more.hasSubmenu);
        const log = trackEvents(wrapper, el);

        el.querySelector<HTMLElement>('[slot="trigger"]')!.focus();
        await sendKeys({ press: 'Enter' });
        await waitUntil(() => menuOf(el).getAnimations().length > 0);
        for (const animation of menuOf(el).getAnimations()) {
          animation.finish();
        }
        await waitUntil(() => snapshot(el, afterButton).focus === 'item:more', 'focus never reached More');

        await sendKeys({ press: 'ArrowRight' });
        const submenu = more.shadowRoot!.querySelector<HTMLElement>('#submenu')!;
        await waitUntil(() => snapshot(el, afterButton, submenu).focus === 'item:grape', 'focus never reached Grape');

        if (timing === 'control') {
          for (const animation of submenu.getAnimations()) {
            animation.finish();
          }
          await nextFrames(4);
        }

        const before = snapshot(el, afterButton, submenu);
        expect(before.animating, `submenu animating at the ${timing} key`).to.equal(timing === 'window');

        await sendKeys({ press: 'ArrowDown' });
        await nextFrames(2);
        const during = snapshot(el, afterButton, submenu);

        for (const animation of submenu.getAnimations()) {
          animation.finish();
        }
        await nextFrames(4);
        const settled = snapshot(el, afterButton, submenu);

        record(`client-only | submenu | ArrowDown | ${timing}`, { before, during, after: settled, log: [...log] });
      });
    }
  });
});
