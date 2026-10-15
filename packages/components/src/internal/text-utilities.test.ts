import { expect, fixture } from '@open-wc/testing';
import { loadStylesheet } from './test/load-stylesheet.js';

const TEXT =
  'The five boxing wizards jump quickly. How quickly daft jumping zebras vex! Pack my box with five dozen ' +
  'liquor jugs. Sphinx of black quartz, judge my vow. Jackdaws love my big sphinx of quartz.';
const LINE_HEIGHT = 20;
// Narrow, with a fixed line height, so TEXT runs past five lines and every line is the same height.
const BOX = `inline-size: 20ch; font-size: 16px; line-height: ${LINE_HEIGHT}px;`;
// Everything `.cs-text-truncate` declared before the step classes were added.
const TRUNCATE_BEFORE_STEPS = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

function lineCount(el: Element) {
  return el.getBoundingClientRect().height / LINE_HEIGHT;
}

function overlaps(a: Element, b: Element) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return r1.left < r2.right && r2.left < r1.right && r1.top < r2.bottom && r2.top < r1.bottom;
}

// Each wraps the text in an element whose default display differs, which the one-line classes must keep.
const contexts: Record<string, (attributes: string) => string> = {
  div: (attributes) => `<div ${attributes}>${TEXT}</div>`,
  li: (attributes) => `<ul><li ${attributes}>${TEXT}</li></ul>`,
  td: (attributes) => `<table><tr><td ${attributes}>${TEXT}</td></tr></table>`,
  span: (attributes) => `<span ${attributes}>${TEXT}</span>`,
};

describe('text truncation utilities', () => {
  let stylesheet: HTMLLinkElement;

  before(async () => {
    stylesheet = await loadStylesheet('/dist/bundled/styles/utilities.css');
  });

  after(() => {
    stylesheet.remove();
  });

  for (const className of ['cs-text-truncate', 'cs-text-truncate-1']) {
    describe(className, () => {
      for (const [name, render] of Object.entries(contexts)) {
        it(`should render a ${name} exactly as the original one-line truncation did`, async () => {
          const el = await fixture<HTMLElement>(`
            <div>
              <div style="${BOX}">${render(`data-before style="${TRUNCATE_BEFORE_STEPS}"`)}</div>
              <div style="${BOX}">${render(`data-subject class="${className}"`)}</div>
            </div>
          `);
          const before = el.querySelector('[data-before]')!;
          const subject = el.querySelector('[data-subject]')!;
          const expected = getComputedStyle(before);
          const actual = getComputedStyle(subject);

          expect(actual.display).to.equal(expected.display, 'display');
          expect(actual.whiteSpace).to.equal(expected.whiteSpace, 'white-space');
          expect(actual.textOverflow).to.equal(expected.textOverflow, 'text-overflow');
          expect(actual.overflowX).to.equal(expected.overflowX, 'overflow-x');
          expect(actual.overflowY).to.equal(expected.overflowY, 'overflow-y');
          expect(subject.getBoundingClientRect().width).to.equal(before.getBoundingClientRect().width, 'width');
          expect(subject.getBoundingClientRect().height).to.equal(before.getBoundingClientRect().height, 'height');
        });
      }

      it('should keep a block on one line', async () => {
        const el = await fixture<HTMLElement>(`<div class="${className}" style="${BOX}">${TEXT}</div>`);

        expect(getComputedStyle(el).display).to.equal('block');
        expect(lineCount(el)).to.equal(1);
      });
    });
  }

  describe('cs-text-truncate-2 to cs-text-truncate-5', () => {
    it('should start from text that runs past five lines', async () => {
      const el = await fixture<HTMLElement>(`<div style="${BOX}">${TEXT}</div>`);

      expect(lineCount(el)).to.be.greaterThan(5);
    });

    for (const lines of [2, 3, 4, 5]) {
      it(`should show at most ${lines} lines with cs-text-truncate-${lines}`, async () => {
        const el = await fixture<HTMLElement>(`<div class="cs-text-truncate-${lines}" style="${BOX}">${TEXT}</div>`);

        // Chromium and Firefox compute a line-clamped -webkit-box as flow-root; WebKit keeps -webkit-box.
        expect(getComputedStyle(el).display).to.be.oneOf(['-webkit-box', 'flow-root']);
        expect(lineCount(el)).to.equal(lines);
        expect(el.scrollHeight).to.be.greaterThan(el.clientHeight);
      });
    }

    for (const layout of ['cs-stack', 'cs-split', 'cs-cluster', 'cs-grid']) {
      it(`should keep its lines and its place as a child of ${layout}`, async () => {
        const el = await fixture<HTMLElement>(`
          <div class="${layout}" style="${BOX}">
            <div class="cs-text-truncate-3">${TEXT}</div>
            <div>Sibling</div>
          </div>
        `);
        const [clamped, sibling] = el.children;

        expect(getComputedStyle(el).display).to.be.oneOf(['flex', 'grid']);
        expect(lineCount(clamped)).to.equal(3);
        expect(overlaps(clamped, sibling)).to.be.false;
      });
    }
  });
});
