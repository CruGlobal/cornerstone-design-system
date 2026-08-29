#!/usr/bin/env node
/**
 * Generates a brand's colour palette, variants and theme from its key colours.
 *
 *   node tools/palette.mjs cru --dry
 *   node tools/palette.mjs cru
 *
 * Input is `tools/brands/<brand>.json`, which holds the key colours as they stand in Figma. Output is
 * `src/styles/color/palettes/<brand>.css`, `src/styles/color/variants/<brand>.css` and
 * `src/styles/themes/<brand>.css`. The output is committed: nothing regenerates it, so this is a tool
 * you run rather than a build step — see ticket 05 in `.scratch/cornerstone-fork/`.
 *
 * This file is only the Node wrapper: it reads the three inputs from disk, hands them to
 * `palette-core.mjs`, prints the report and writes the result. **The generator itself lives in
 * `palette-core.mjs`**, which is pure so that the same code can run in a browser — see its header for
 * the luminance ladder, the floating key and the two generation modes.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generate } from './palette-core.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const brandName = process.argv[2];
const dry = process.argv.includes('--dry');
if (!brandName) {
  console.error('usage: node tools/palette.mjs <brand> [--dry]');
  process.exit(1);
}

const brand = JSON.parse(readFileSync(join(ROOT, `tools/brands/${brandName}.json`), 'utf8'));
const { files, diagnostics, brandChroma, failures, variantCounts, ramps } = generate({
  referencePaletteCss: readFileSync(join(ROOT, 'src/styles/color/palettes/default.css'), 'utf8'),
  referenceThemeCss: readFileSync(join(ROOT, 'src/styles/themes/default.css'), 'utf8'),
  brandName,
  brand,
});

// ─── report ───
console.log(`brand ${brandName} — chroma register ${brandChroma.toFixed(3)}\n`);
console.log('hue'.padEnd(13) + 'mode'.padEnd(9) + 'key/pins'.padEnd(12) + 'clipped'.padEnd(9) + 'contract');
for (const d of diagnostics) {
  console.log(
    d.hue.padEnd(13) +
      d.mode.padEnd(9) +
      d.where.padEnd(12) +
      String(d.clipped).padEnd(9) +
      (d.failures.length ? `${d.failures.length} miss` : 'ok'),
  );
  for (const f of d.failures) {
    console.log(`    ${f.a}/${f.b} (Δ${f.diff}) needs ${f.min}, got ${f.got}`);
  }
}

// ─── write ───
const outPath = join(ROOT, `src/styles/color/palettes/${brandName}.css`);
const variantsPath = join(ROOT, `src/styles/color/variants/${brandName}.css`);
const themePath = join(ROOT, `src/styles/themes/${brandName}.css`);
console.log(`\n${Object.keys(ramps).length} ramps, ${failures} contract miss(es)`);
const report = (verb) => {
  console.log(`${verb}:`);
  console.log(`  ${outPath.replace(ROOT + '/', '')} (${files.palette.length} bytes)`);
  console.log(
    `  ${variantsPath.replace(ROOT + '/', '')} (${files.variants.length} bytes, ` +
      `${variantCounts.roleCount} roles x ${variantCounts.hueCount} hues)`,
  );
  console.log(`  ${themePath.replace(ROOT + '/', '')} (${files.theme.length} bytes)`);
};
if (dry) {
  report('DRY RUN — would write');
} else {
  writeFileSync(outPath, files.palette + '\n');
  writeFileSync(variantsPath, files.variants + '\n');
  writeFileSync(themePath, files.theme + '\n');
  // Format what we just wrote. These files are committed and `npm run verify` checks formatting, so a
  // generator that emitted unformatted CSS would break the gate until someone remembered a second command.
  execFileSync('npx', ['prettier', '--write', '--log-level=warn', outPath, variantsPath, themePath], {
    stdio: 'inherit',
  });
  report('wrote');
}
