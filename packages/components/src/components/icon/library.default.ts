import { getIconPath } from '../../utilities/base-path.js';
import type { IconLibrary } from './library.js';

/** The pinned Material Symbols release the CDN URLs resolve against. */
const MS_VERSION = '0.46.0';

/** The three Material Symbols styles. `family` selects one of these. */
const STYLES = ['sharp', 'outlined', 'rounded'] as const;

/** The seven weights Material Symbols publishes. `weight` snaps to one of these. */
const WEIGHTS = [100, 200, 300, 400, 500, 600, 700] as const;

/**
 * The default stroke weight. Cru's brand guidelines specify Material Symbols at fill off, weight 400, grade 0,
 * optical size 24 and the sharp style — which is exactly what `@material-symbols/svg-400/sharp` ships.
 */
const DEFAULT_WEIGHT = 400;

export type IconStyle = (typeof STYLES)[number];
export type IconWeight = (typeof WEIGHTS)[number];

/**
 * Returns the Material Symbols style folder for a given family. Material Symbols has three styles — `sharp`,
 * `outlined`, and `rounded` — and Cornerstone maps the `family` attribute onto them. Unknown families fall back to
 * `sharp`.
 */
export function getIconStyle(family: string): IconStyle {
  return (STYLES as readonly string[]).includes(family) ? (family as IconStyle) : 'sharp';
}

/**
 * Snaps an arbitrary weight to the nearest published Material Symbols weight. Material Symbols ships seven discrete
 * weights from 100 to 700, so `350` resolves to `300` and anything out of range clamps to the closest end. A value
 * that is not a number falls back to the default of 400.
 */
export function getIconWeight(weight: number | string | undefined): IconWeight {
  const value = Number(weight);

  if (!Number.isFinite(value)) {
    return DEFAULT_WEIGHT;
  }

  return WEIGHTS.reduce((closest, candidate) =>
    Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest,
  );
}

/**
 * Returns the file name for an icon. Material Symbols publishes the filled cut of each icon alongside the outlined one
 * under a `-fill` suffix, so `variant="fill"` becomes `star-fill` while everything else stays `star`.
 */
export function getIconFileName(name: string, variant: string): string {
  return variant === 'fill' ? `${name}-fill` : name;
}

function getIconUrl(name: string, family: string, variant: string, weight: number) {
  const style = getIconStyle(family);
  const resolvedWeight = getIconWeight(weight);
  const fileName = getIconFileName(name, variant);
  const iconBase = getIconPath();

  // Self-hosted icons mirror the npm package layout minus the package prefix, so copying
  // `@material-symbols/svg-400` into `{path}/400` is all it takes to serve them locally.
  if (iconBase) {
    return `${iconBase}/${resolvedWeight}/${style}/${fileName}.svg`;
  }

  return `https://cdn.jsdelivr.net/npm/@material-symbols/svg-${resolvedWeight}@${MS_VERSION}/${style}/${fileName}.svg`;
}

const library: IconLibrary = {
  name: 'default',
  resolver: (name: string, family = 'sharp', variant = 'regular', _autoWidth = false, weight = DEFAULT_WEIGHT) => {
    return getIconUrl(name, family, variant, weight);
  },
  mutator: (svg) => {
    // Material Symbols SVGs carry no fill attribute, so set one on the root to inherit the current color. This belongs
    // here, not in icon.styles.ts, where it would override other libraries' fills (issue #1733).
    if (!svg.hasAttribute('fill')) {
      svg.setAttribute('fill', 'currentColor');
    }
  },
};

export default library;
