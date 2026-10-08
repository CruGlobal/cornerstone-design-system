import { expect } from '@open-wc/testing';
import { getSwatchLabel, parseCssVar, resolveCssVar } from './swatch-vars.js';

function stubStyles(values: Record<string, string>) {
  return { getPropertyValue: (name: string) => values[name] ?? '' };
}

describe('color picker swatch vars', () => {
  describe('parseCssVar', () => {
    it('splits a var() into its name and fallback', () => {
      expect(parseCssVar('var(--brand)')).to.deep.equal({ name: '--brand', fallback: undefined });
      expect(parseCssVar(' var( --brand , #fff ) ')).to.deep.equal({ name: '--brand', fallback: '#fff' });
      expect(parseCssVar('var(--brand, var(--other, red))')).to.deep.equal({
        name: '--brand',
        fallback: 'var(--other, red)',
      });
    });

    it('returns null for anything that is not a whole var()', () => {
      expect(parseCssVar('')).to.equal(null);
      expect(parseCssVar('#ff0000')).to.equal(null);
      expect(parseCssVar('var(--unclosed')).to.equal(null);
      expect(parseCssVar('var(brand)')).to.equal(null);
    });
  });

  describe('resolveCssVar', () => {
    it("returns the custom property's value, with comments stripped", () => {
      const styles = stubStyles({ '--brand': ' #0071ec /* oklch(0.55 0.2 255) */ ' });
      expect(resolveCssVar(styles, 'var(--brand)')).to.equal('#0071ec');
    });

    it('falls back through nested var()s when the property is unset', () => {
      const styles = stubStyles({ '--second': 'green' });
      expect(resolveCssVar(styles, 'var(--unset, red)')).to.equal('red');
      expect(resolveCssVar(styles, 'var(--unset, var(--second, red))')).to.equal('green');
      expect(resolveCssVar(styles, 'var(--unset, var(--also-unset, blue))')).to.equal('blue');
    });

    it('returns null when nothing resolves, or the value is not a var()', () => {
      const styles = stubStyles({});
      expect(resolveCssVar(styles, 'var(--unset)')).to.equal(null);
      expect(resolveCssVar(styles, 'var(--unset, )')).to.equal(null);
      expect(resolveCssVar(styles, 'var(--unset, var(--also-unset))')).to.equal(null);
      expect(resolveCssVar(styles, '#ff0000')).to.equal(null);
    });
  });

  describe('getSwatchLabel', () => {
    it('names a var() after its custom property, without the cs- and color- prefixes', () => {
      expect(getSwatchLabel('var(--cs-color-brand-fill-loud)')).to.equal('brand fill loud');
      expect(getSwatchLabel('var(--cs-color-danger-fill-loud, red)')).to.equal('danger fill loud');
      expect(getSwatchLabel('var(--brand-red)')).to.equal('brand red');
    });

    it('keeps the value as written when there is no name left, or it is not a var()', () => {
      expect(getSwatchLabel('var(--cs-color-)')).to.equal('var(--cs-color-)');
      expect(getSwatchLabel('#ff0000')).to.equal('#ff0000');
      expect(getSwatchLabel('')).to.equal('');
    });
  });
});
