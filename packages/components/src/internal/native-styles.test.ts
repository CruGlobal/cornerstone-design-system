import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit';
import { formControlHeight } from './test/form-control-height.js';
import { loadNativeStyles } from './test/native-styles.js';

function resolvedColor(el: HTMLElement, value: string) {
  el.style.color = value;
  return getComputedStyle(el).color;
}

describe('native styles', () => {
  before(async () => {
    await loadNativeStyles();
  });

  it('should apply inverted neutral colors to native buttons inside cs-invert', async () => {
    const el = await fixture<HTMLElement>(html`
      <div class="cs-invert">
        <span data-token></span>
        <button class="cs-filled">Button</button>
      </div>
    `);
    const token = el.querySelector<HTMLElement>('[data-token]')!;
    const button = el.querySelector('button')!;

    expect(getComputedStyle(button).backgroundColor).to.equal(
      resolvedColor(token, 'var(--cs-color-neutral-fill-normal)'),
    );
  });

  it('should apply inverted neutral colors to native buttons with cs-invert', async () => {
    const el = await fixture<HTMLElement>(html`
      <div>
        <span class="cs-invert" data-token></span>
        <button class="cs-invert cs-filled">Button</button>
      </div>
    `);
    const token = el.querySelector<HTMLElement>('[data-token]')!;
    const button = el.querySelector('button')!;

    expect(getComputedStyle(button).backgroundColor).to.equal(
      resolvedColor(token, 'var(--cs-color-neutral-fill-normal)'),
    );
  });

  // <details> puts its <summary> in a slot inside the browser's own shadow root, and that slot is content-box, so
  // the `box-sizing: inherit` rule above would hand content-box to the summary and everything inside it.
  it('should make a summary border-box so an icon-only button inside it stays square', async () => {
    const el = await fixture<HTMLDetailsElement>(html`
      <details>
        <summary>
          Name
          <cs-button appearance="plain" size="xs" pill>
            <cs-icon library="system" name="star" label="Favorite"></cs-icon>
          </cs-button>
        </summary>
        Content
      </details>
    `);
    const summary = el.querySelector('summary')!;
    const button = el.querySelector('cs-button')!;
    await waitUntil(() => button.matches(':state(icon-button)'));

    const { width, height } = button.getBoundingClientRect();
    const expected = formControlHeight(button);

    expect(getComputedStyle(summary).boxSizing).to.equal('border-box');
    expect(width).to.equal(expected, 'width');
    expect(height).to.equal(expected, 'height');
  });
});
