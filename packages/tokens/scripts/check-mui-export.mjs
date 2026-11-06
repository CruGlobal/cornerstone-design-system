/**
 * Proves the `./mui` subpath export loads under plain Node ESM, with no
 * TypeScript transform in the way, and that it still builds a usable theme.
 *
 * The package self-references its own name, which Node resolves through the
 * `exports` map exactly as a consumer's resolver would. Run after `npm run build`.
 */
import assert from 'node:assert/strict';
import {
  cornerstoneThemeOptions,
  createCornerstoneTheme,
} from '@cruglobal/cornerstone-design-system/mui';

const resolved = import.meta
  .resolve('@cruglobal/cornerstone-design-system/mui');
assert.match(
  resolved,
  /\/build\/mui\/index\.js$/,
  `./mui must resolve to compiled JavaScript, got ${resolved}`,
);

const HEX = /^#[0-9a-f]{6}$/i;

for (const brand of ['cru', 'fl']) {
  for (const mode of ['light', 'dark']) {
    const options = cornerstoneThemeOptions({ brand, mode });
    assert.equal(options.palette.mode, mode, `${brand}/${mode}: palette.mode`);
    assert.match(
      options.palette.primary.main,
      HEX,
      `${brand}/${mode}: primary.main is a resolved colour`,
    );

    const theme = createCornerstoneTheme({ brand, mode });
    assert.equal(theme.palette.mode, mode, `${brand}/${mode}: theme mode`);
    assert.equal(
      theme.palette.primary.main,
      options.palette.primary.main,
      `${brand}/${mode}: theme carries the options' primary`,
    );
  }
}

// Defaults: no params means Cru light.
const fallback = createCornerstoneTheme();
assert.equal(fallback.palette.mode, 'light');
assert.equal(
  fallback.palette.primary.main,
  cornerstoneThemeOptions({ brand: 'cru', mode: 'light' }).palette.primary.main,
);
