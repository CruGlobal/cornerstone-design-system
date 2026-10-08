import { expect } from '@open-wc/testing';
import { getSwatchLabel, parseCssVar, resolveCssVar } from './swatch-vars.js';

function stubStyles(values: Record<string, string>) {
  return { getPropertyValue: (name: string) => values[name] ?? '' };
}

describe('color picker swatch vars', () => {
  describe('parseCssVar', () => {
    it('splits a var(--cs-*) into its name and fallback', () => {
      expect(parseCssVar('var(--cs-brand)')).to.deep.equal({ name: '--cs-brand', fallback: undefined });
      expect(parseCssVar(' var( --cs-brand , #fff ) ')).to.deep.equal({ name: '--cs-brand', fallback: '#fff' });
      expect(parseCssVar('var(--cs-brand, var(--cs-other, red))')).to.deep.equal({
        name: '--cs-brand',
        fallback: 'var(--cs-other, red)',
      });
    });

    it('returns null for a custom property outside --cs-*', () => {
      expect(parseCssVar('var(--brand-blue)')).to.equal(null);
      expect(parseCssVar('var(--brand-blue, #0000ff)')).to.equal(null);
      expect(parseCssVar('var(--CS-brand)')).to.equal(null);
    });

    it('returns null for anything that is not a whole var()', () => {
      expect(parseCssVar('')).to.equal(null);
      expect(parseCssVar('#ff0000')).to.equal(null);
      expect(parseCssVar('var(--cs-unclosed')).to.equal(null);
      expect(parseCssVar('var(cs-brand)')).to.equal(null);
    });
  });

  describe('resolveCssVar', () => {
    it("returns the custom property's value, with comments stripped", () => {
      const styles = stubStyles({ '--cs-brand': ' #0071ec /* oklch(0.55 0.2 255) */ ' });
      expect(resolveCssVar(styles, 'var(--cs-brand)')).to.equal('#0071ec');
    });

    it('falls back through nested var()s when the property is unset', () => {
      const styles = stubStyles({ '--cs-second': 'green' });
      expect(resolveCssVar(styles, 'var(--cs-unset, red)')).to.equal('red');
      expect(resolveCssVar(styles, 'var(--cs-unset, var(--cs-second, red))')).to.equal('green');
      expect(resolveCssVar(styles, 'var(--cs-unset, var(--cs-also-unset, blue))')).to.equal('blue');
    });

    it('returns null when nothing resolves, or the value is not a var()', () => {
      const styles = stubStyles({});
      expect(resolveCssVar(styles, 'var(--cs-unset)')).to.equal(null);
      expect(resolveCssVar(styles, 'var(--cs-unset, )')).to.equal(null);
      expect(resolveCssVar(styles, 'var(--cs-unset, var(--cs-also-unset))')).to.equal(null);
      expect(resolveCssVar(styles, '#ff0000')).to.equal(null);
    });

    it('does not read a custom property outside --cs-*, even when it is set', () => {
      const styles = stubStyles({ '--brand-blue': '#0000ff' });
      expect(resolveCssVar(styles, 'var(--brand-blue)')).to.equal(null);
      expect(resolveCssVar(styles, 'var(--brand-blue, red)')).to.equal(null);
    });
  });

  describe('getSwatchLabel', () => {
    it('names a var(--cs-*) after its custom property, without the cs- and color- prefixes', () => {
      expect(getSwatchLabel('var(--cs-color-brand-fill-loud)')).to.equal('brand fill loud');
      expect(getSwatchLabel('var(--cs-color-danger-fill-loud, red)')).to.equal('danger fill loud');
      expect(getSwatchLabel('var(--cs-brand-red)')).to.equal('brand red');
    });

    it('keeps the value as written when there is no name left, or it is not a var(--cs-*)', () => {
      expect(getSwatchLabel('var(--cs-color-)')).to.equal('var(--cs-color-)');
      expect(getSwatchLabel('var(--brand-red)')).to.equal('var(--brand-red)');
      expect(getSwatchLabel('#ff0000')).to.equal('#ff0000');
      expect(getSwatchLabel('')).to.equal('');
    });
  });
});
