import { aTimeout, elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { html } from 'lit';
import { registerIconLibrary } from '../../../dist/bundled/cornerstone.js';
import { expectEvent } from '../../internal/test/expect-event.js';
import { fixtures } from '../../internal/test/fixture.js';
// Make sure this is the bundled build, otherwise you will get an error.
import type CsIcon from './icon.js';
import type { IconAnimation } from './icon.js';
import defaultLibrary, { getIconFileName, getIconStyle, getIconWeight } from './library.default.js';
import systemLibrary from './library.system.js';

// Captures the autoWidth argument passed to a resolver so we can assert the canvas="auto" coupling.
let probeAutoWidth: boolean | undefined;

const testLibraryIcons = {
  'test-icon1': `
    <svg id="test-icon1">
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"></path>
    </svg>
  `,
  'test-icon2': `
    <svg id="test-icon2">
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"></path>
    </svg>
  `,
  'bad-icon': `<div></div>`,
};

// Mimics stroke-based libraries like Lucide and Feather, whose SVGs style themselves entirely through
// presentation attributes on the root element.
const strokeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16v16H4z"></path>
  </svg>
`;

describe('<cs-icon>', () => {
  before(() => {
    registerIconLibrary('test-library', {
      resolver: (name: keyof typeof testLibraryIcons) => {
        // only for testing a bad request
        if (name === ('bad-request' as keyof typeof testLibraryIcons)) {
          return `data:image/svg+xml`;
        }

        if (name in testLibraryIcons) {
          return `data:image/svg+xml,${encodeURIComponent(testLibraryIcons[name])}`;
        }
        return '';
      },
      mutator: (svg: SVGElement) => svg.setAttribute('fill', 'currentColor'),
    });

    registerIconLibrary('stroke-library', {
      resolver: () => `data:image/svg+xml,${encodeURIComponent(strokeIcon)}`,
    });

    registerIconLibrary('autowidth-probe', {
      resolver: (_name: string, _family?: string, _variant?: string, autoWidth?: boolean) => {
        probeAutoWidth = autoWidth;
        return `data:image/svg+xml,${encodeURIComponent(testLibraryIcons['test-icon1'])}`;
      },
    });
  });

  describe('default-library Material Symbols mapping', () => {
    it('maps each family onto its Material Symbols style folder', () => {
      expect(getIconStyle('sharp')).to.equal('sharp');
      expect(getIconStyle('outlined')).to.equal('outlined');
      expect(getIconStyle('rounded')).to.equal('rounded');
    });

    it('falls back to "sharp" for an unknown family', () => {
      expect(getIconStyle('not-a-real-family')).to.equal('sharp');
    });

    it('passes through each published weight', () => {
      [100, 200, 300, 400, 500, 600, 700].forEach((weight) => {
        expect(getIconWeight(weight)).to.equal(weight);
      });
    });

    it('snaps an in-between weight to the nearest published one', () => {
      expect(getIconWeight(350)).to.equal(300);
      expect(getIconWeight(351)).to.equal(400);
    });

    it('clamps an out-of-range weight to the closest end', () => {
      expect(getIconWeight(0)).to.equal(100);
      expect(getIconWeight(9000)).to.equal(700);
    });

    it('falls back to the default weight when the weight is not a number', () => {
      expect(getIconWeight(undefined)).to.equal(400);
      expect(getIconWeight('not-a-number')).to.equal(400);
    });

    it('suffixes the file name only for variant="fill"', () => {
      expect(getIconFileName('star', 'fill')).to.equal('star-fill');
      expect(getIconFileName('star', 'regular')).to.equal('star');
      expect(getIconFileName('star', '')).to.equal('star');
    });

    it('builds a CDN url from the family, variant and weight', async () => {
      const url = await defaultLibrary.resolver('star', 'rounded', 'fill', false, 700);
      expect(url).to.contain('@material-symbols/svg-700');
      expect(url).to.contain('/rounded/star-fill.svg');
    });

    it('defaults to the sharp style at weight 400', async () => {
      const url = await defaultLibrary.resolver('home', undefined!, undefined!, false, undefined!);
      expect(url).to.contain('@material-symbols/svg-400');
      expect(url).to.contain('/sharp/home.svg');
    });
  });

  // Fill handling lives in the default library's mutator, not the component stylesheet, so that
  // other libraries receive their SVG exactly as authored. A stylesheet fill regressed twice (issue #1733).
  describe('default library fill handling', () => {
    it('adds fill="currentColor" to icons that do not specify a fill', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defaultLibrary.mutator!(svg);
      expect(svg.getAttribute('fill')).to.equal('currentColor');
    });

    it('respects an existing fill attribute', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('fill', 'none');
      defaultLibrary.mutator!(svg);
      expect(svg.getAttribute('fill')).to.equal('none');
    });
  });

  // The system library embeds Material Symbols SVGs as strings, none of which carry a fill attribute, so its
  // mutator applies the same fallback as the default library.
  describe('system library fill handling', () => {
    it('adds fill="currentColor" to icons that do not specify a fill', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      systemLibrary.mutator!(svg);
      expect(svg.getAttribute('fill')).to.equal('currentColor');
    });

    it('respects an existing fill attribute', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('fill', 'none');
      systemLibrary.mutator!(svg);
      expect(svg.getAttribute('fill')).to.equal('none');
    });
  });

  for (const fixture of fixtures) {
    describe(`with "${fixture.type}" rendering`, () => {
      describe('accessibility', () => {
        it('should be accessible', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check"></cs-icon>`);
          await expect(el).to.be.accessible();
        });

        it('should set aria-hidden when no label is provided', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check"></cs-icon>`);
          expect(el.getAttribute('role')).to.be.null;
          expect(el.getAttribute('aria-label')).to.be.null;
          expect(el.getAttribute('aria-hidden')).to.equal('true');
        });

        it('should set role and aria-label when a label is provided', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon label="Checkmark" library="system" name="check"></cs-icon>`);
          expect(el.getAttribute('role')).to.equal('img');
          expect(el.getAttribute('aria-label')).to.equal('Checkmark');
          expect(el.getAttribute('aria-hidden')).to.be.null;
        });
      });

      describe('properties', () => {
        it('should have correct default property values', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon></cs-icon>`);
          expect(el.name).to.be.undefined;
          expect(el.src).to.be.undefined;
          expect(el.label).to.equal('');
          expect(el.library).to.equal('default');
        });

        it('should render an SVG for a system icon', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'check';
          await listener;
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.exist;
        });
      });

      describe('events', () => {
        it('should emit cs-load when a valid icon loads', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library"></cs-icon>`);
          await expectEvent(el, 'cs-load', async () => {
            el.name = 'test-icon1';
          });
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.exist;
        });

        it('should emit cs-error when the icon file cannot be retrieved', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library"></cs-icon>`);
          await expectEvent(el, 'cs-error', async () => {
            el.name = 'bad-request';
          });
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.be.null;
        });

        it('should emit cs-error when the response is not a valid SVG', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library"></cs-icon>`);
          await expectEvent(el, 'cs-error', async () => {
            el.name = 'bad-icon';
          });
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.be.null;
        });
      });

      describe('libraries', () => {
        it('should render icons from a custom library', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'test-icon1';
          await listener;
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.exist;
        });

        it('should apply the mutator from a custom library', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library" name="test-icon1"></cs-icon>`);
          await elementUpdated(el);
          await elementUpdated(el);
          await aTimeout(1);
          const svg = el.shadowRoot?.querySelector('svg');
          expect(svg?.getAttribute('fill')).to.equal('currentColor');
        });

        // Guards issue #1733: a fill rule in the component stylesheet overrides the presentation attributes that
        // stroke-based libraries (Lucide, Feather, etc.) rely on, turning their icons into filled blobs.
        it('should not force a fill on stroke-based library icons', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="stroke-library"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'square';
          await listener;
          await elementUpdated(el);
          const svg = el.shadowRoot!.querySelector('svg')!;
          expect(svg.getAttribute('fill')).to.equal('none');
          expect(getComputedStyle(svg).fill).to.equal('none');
        });

        it('should render icons from an async resolver', async () => {
          registerIconLibrary('async-library', {
            resolver: async (name) => {
              await new Promise((resolve) => requestAnimationFrame(resolve));
              return `data:image/svg+xml,${encodeURIComponent(testLibraryIcons[name as keyof typeof testLibraryIcons])}`;
            },
          });

          const el = await fixture<CsIcon>(html`<cs-icon library="async-library"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'test-icon1';
          await listener;
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.exist;
        });
      });

      describe('src', () => {
        it('should render an SVG when a valid src is provided', async () => {
          const fakeId = 'test-src';
          const el = await fixture<CsIcon>(html`<cs-icon></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.src = `data:image/svg+xml,${encodeURIComponent(`<svg id="${fakeId}"></svg>`)}`;
          await listener;
          await elementUpdated(el);
          expect(el.shadowRoot?.querySelector('svg')).to.exist;
          expect(el.shadowRoot?.querySelector('svg')?.part.contains('svg')).to.be.true;
          expect(el.shadowRoot?.querySelector('svg')?.getAttribute('id')).to.equal(fakeId);
        });
      });

      describe('sprite sheets', () => {
        it('should produce a <use> element with the correct href', async () => {
          // With SSR, this `registerIconLibrary` won't cross the server  boundary.
          registerIconLibrary('sprite', {
            resolver: (name) => `/src/internal/test/fixtures/sprite.svg#${name}`,
            mutator: (svg) => svg.setAttribute('fill', 'currentColor'),
            spriteSheet: true,
          });

          const el = await fixture<CsIcon>(html`<cs-icon name="bad-icon" library="sprite"></cs-icon>`);
          let href = null;
          await waitUntil(() => {
            href = el.shadowRoot!.querySelector('use')?.getAttribute('href');
            return href;
          });
          expect(href).to.equal('/src/internal/test/fixtures/sprite.svg#bad-icon');
        });

        it('should apply the mutator when using sprite sheets', async () => {
          registerIconLibrary('sprite', {
            resolver: (name) => `/src/internal/test/fixtures/sprite.svg#${name}`,
            mutator: (svg) => svg.setAttribute('fill', 'currentColor'),
            spriteSheet: true,
          });

          const el = await fixture<CsIcon>(html`<cs-icon name="non-existent" library="sprite"></cs-icon>`);
          await elementUpdated(el);
          const svg = el.shadowRoot?.querySelector("svg[part='svg']");
          expect(svg?.getAttribute('fill')).to.equal('currentColor');
        });
      });

      describe('transformations', () => {
        it('should rotate 0 degrees when rotate is 0', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" rotate="0"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          const computedStyle = getComputedStyle(el);
          expect(['matrix(1, 0, 0, 1, 0, 0)', 'none']).to.include(computedStyle.transform);
        });

        it('should rotate 90 degrees when rotate is 90', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" rotate="90"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(0, 1, -1, 0, 0, 0)');
        });

        it('should rotate 180 degrees when rotate is 180', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" rotate="180"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(-1, 0, 0, -1, 0, 0)');
        });

        it('should rotate 270 degrees when rotate is 270', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" rotate="270"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(0, -1, 1, 0, 0, 0)');
        });

        it('should flip horizontally when flip is "x"', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" flip="x"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(-1, 0, 0, 1, 0, 0)');
        });

        it('should flip vertically when flip is "y"', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" flip="y"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(1, 0, 0, -1, 0, 0)');
        });

        it('should flip on both axes when flip is "both"', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check" flip="both"></cs-icon>`);
          await elementUpdated(el);
          await el.updateComplete;
          expect(getComputedStyle(el).transform).to.equal('matrix(-1, 0, 0, -1, 0, 0)');
        });
      });

      describe('animations', () => {
        // [animation value, expected @keyframes name] — spin-pulse and spin-reverse reuse the `spin` keyframes
        const animations: Array<[IconAnimation, string]> = [
          ['beat', 'beat'],
          ['fade', 'fade'],
          ['beat-fade', 'beat-fade'],
          ['bounce', 'bounce'],
          ['flip', 'flip'],
          ['flip-360', 'flip-360'],
          ['shake', 'shake'],
          ['spin', 'spin'],
          ['spin-pulse', 'spin'],
          ['spin-reverse', 'spin'],
          ['spin-snap', 'spin-snap'],
          ['spin-snap-4', 'spin-snap-4'],
          ['spin-snap-8', 'spin-snap-8'],
          ['buzz', 'buzz'],
          ['wag', 'wag'],
          ['float', 'float'],
          ['swing', 'swing'],
          ['jello', 'jello'],
        ];

        animations.forEach(([animation, keyframe]) => {
          it(`should apply the "${animation}" animation`, async () => {
            const el = await fixture<CsIcon>(html`
              <cs-icon library="system" name="check" animation=${animation}></cs-icon>
            `);
            await elementUpdated(el);
            await el.updateComplete;
            expect(getComputedStyle(el).animationName).to.equal(keyframe);
          });
        });

        it('should apply spin-reverse with reverse direction', async () => {
          const el = await fixture<CsIcon>(html`
            <cs-icon library="system" name="check" animation="spin-reverse"></cs-icon>
          `);
          await elementUpdated(el);
          await el.updateComplete;
          const computedStyle = getComputedStyle(el);
          expect(computedStyle.animationName).to.equal('spin');
          expect(computedStyle.animationDirection).to.equal('reverse');
        });

        // Animation defaults, ported from Font Awesome 7.3
        const revisedDefaults: Array<[IconAnimation, 'animationDuration' | 'animationTimingFunction', string]> = [
          ['flip', 'animationDuration', '1.5s'],
          ['shake', 'animationDuration', '0.75s'],
          ['shake', 'animationTimingFunction', 'ease-in-out'],
          ['fade', 'animationTimingFunction', 'ease-in-out'],
          ['beat-fade', 'animationTimingFunction', 'ease-in-out'],
        ];

        revisedDefaults.forEach(([animation, prop, value]) => {
          it(`should default ${animation} ${prop} to ${value} (FA 7.3)`, async () => {
            const el = await fixture<CsIcon>(html`
              <cs-icon library="system" name="check" animation=${animation}></cs-icon>
            `);
            await elementUpdated(el);
            await el.updateComplete;
            expect(getComputedStyle(el)[prop]).to.equal(value);
          });
        });

        it('should disable animation under prefers-reduced-motion', async () => {
          const el = await fixture<CsIcon>(html` <cs-icon library="system" name="check" animation="spin"></cs-icon> `);
          await elementUpdated(el);
          try {
            await emulateMedia({ reducedMotion: 'reduce' });
            expect(getComputedStyle(el).animationName).to.equal('none');
          } finally {
            await emulateMedia({ reducedMotion: 'no-preference' });
          }
        });
      });

      describe('canvas sizing', () => {
        // Fix the em base so 1.25em = 20px and 1.5em = 24px deterministically
        const sizes: Array<[label: string, markup: ReturnType<typeof html>, width: string, height: string]> = [
          [
            'fixed (default)',
            html`<cs-icon library="system" name="check" style="font-size:16px"></cs-icon>`,
            '20px',
            '16px',
          ],
          [
            'fixed (explicit)',
            html`<cs-icon library="system" name="check" canvas="fixed" style="font-size:16px"></cs-icon>`,
            '20px',
            '16px',
          ],
          [
            'square',
            html`<cs-icon library="system" name="check" canvas="square" style="font-size:16px"></cs-icon>`,
            '20px',
            '20px',
          ],
          [
            'roomy',
            html`<cs-icon library="system" name="check" canvas="roomy" style="font-size:16px"></cs-icon>`,
            '24px',
            '24px',
          ],
        ];

        sizes.forEach(([label, markup, width, height]) => {
          it(`should size the ${label} canvas to ${width} × ${height}`, async () => {
            const el = await fixture<CsIcon>(markup);
            await elementUpdated(el);
            await el.updateComplete;
            const style = getComputedStyle(el);
            expect(style.width).to.equal(width);
            expect(style.height).to.equal(height);
          });
        });

        it('should hug the icon for canvas="auto" without a fixed-width box', async () => {
          const el = await fixture<CsIcon>(
            html`<cs-icon library="system" name="check" canvas="auto" style="font-size:16px"></cs-icon>`,
          );
          await elementUpdated(el);
          await el.updateComplete;
          const style = getComputedStyle(el);
          // auto keeps the 1em height but drops the fixed 1.25em (20px) min-width that `fixed` enforces
          expect(style.height).to.equal('16px');
          expect(style.minWidth).to.equal('0px');
        });

        it('should scale the artwork by 1.2 to cancel the Material Symbols grid padding', async () => {
          const el = await fixture<CsIcon>(
            html`<cs-icon library="system" name="check" style="font-size:16px"></cs-icon>`,
          );
          await elementUpdated(el);
          await el.updateComplete;
          const svg = el.shadowRoot!.querySelector('svg')!;
          expect(getComputedStyle(svg).scale).to.equal('1.2');
        });

        // The scale is a transform, not a size, so the canvas must not move with it. This is what lets the
        // artwork grow without reflowing every control that sizes against an icon.
        it('should not change the canvas when the artwork is scaled', async () => {
          const scaled = await fixture<CsIcon>(
            html`<cs-icon library="system" name="check" style="font-size:16px"></cs-icon>`,
          );
          const native = await fixture<CsIcon>(
            html`<cs-icon library="system" name="check" style="font-size:16px; --icon-scale: 1"></cs-icon>`,
          );
          await Promise.all([scaled.updateComplete, native.updateComplete]);
          expect(getComputedStyle(scaled).width).to.equal(getComputedStyle(native).width);
          expect(getComputedStyle(scaled).height).to.equal(getComputedStyle(native).height);
        });

        // The default lives in the var() fallback, not on :host, so an ancestor's value reaches the artwork.
        it('should take --icon-scale from an ancestor', async () => {
          const wrapper = await fixture<HTMLDivElement>(
            html`<div style="--icon-scale: 1">
              <cs-icon library="system" name="check" style="font-size:16px"></cs-icon>
            </div>`,
          );
          const el = wrapper.querySelector<CsIcon>('cs-icon')!;
          await elementUpdated(el);
          await el.updateComplete;
          const svg = el.shadowRoot!.querySelector('svg')!;
          expect(getComputedStyle(svg).scale).to.equal('1');
        });

        it('should let --icon-scale render the artwork at its native size', async () => {
          const el = await fixture<CsIcon>(
            html`<cs-icon library="system" name="check" style="font-size:16px; --icon-scale: 1"></cs-icon>`,
          );
          await elementUpdated(el);
          await el.updateComplete;
          const svg = el.shadowRoot!.querySelector('svg')!;
          expect(getComputedStyle(svg).scale).to.equal('1');
        });

        it('should reflect the canvas property to an attribute', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="system" name="check"></cs-icon>`);
          el.canvas = 'roomy';
          await elementUpdated(el);
          expect(el.getAttribute('canvas')).to.equal('roomy');
        });

        it('should pass autoWidth=true to the resolver for canvas="auto"', async () => {
          probeAutoWidth = undefined;
          const el = await fixture<CsIcon>(html`<cs-icon library="autowidth-probe" canvas="auto"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'x';
          await listener;
          expect(probeAutoWidth).to.be.true;
        });

        it('should pass autoWidth=true to the resolver for the deprecated auto-width attribute', async () => {
          probeAutoWidth = undefined;
          const el = await fixture<CsIcon>(html`<cs-icon library="autowidth-probe" auto-width></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'x';
          await listener;
          expect(probeAutoWidth).to.be.true;
        });

        it('should pass autoWidth=false to the resolver by default', async () => {
          probeAutoWidth = undefined;
          const el = await fixture<CsIcon>(html`<cs-icon library="autowidth-probe"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'x';
          await listener;
          expect(probeAutoWidth).to.be.false;
        });
      });

      describe('CSS parts and states', () => {
        it('should expose the svg CSS part', async () => {
          const el = await fixture<CsIcon>(html`<cs-icon library="test-library"></cs-icon>`);
          const listener = oneEvent(el, 'cs-load');
          el.name = 'test-icon1';
          await listener;
          await elementUpdated(el);
          const svg = el.shadowRoot?.querySelector('svg');
          expect(svg?.part.contains('svg')).to.be.true;
        });
      });
    });
  }
});
