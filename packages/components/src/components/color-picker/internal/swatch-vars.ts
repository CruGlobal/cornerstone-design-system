const cssVarPattern = /^var\(\s*(--[^\s,()]+)\s*(?:,\s*([\s\S]*?))?\s*\)$/i;

/** Splits `var(--name)` or `var(--name, fallback)` into its parts. Returns `null` for anything else. */
export function parseCssVar(value: string): { name: string; fallback?: string } | null {
  const match = typeof value === 'string' ? cssVarPattern.exec(value.trim()) : null;
  return match ? { name: match[1], fallback: match[2] } : null;
}

/** The custom property's value, else the fallback, else `null`. Also `null` for anything that isn't a `var()`. */
export function resolveCssVar(styles: Pick<CSSStyleDeclaration, 'getPropertyValue'>, value: string): string | null {
  const cssVar = parseCssVar(value);
  if (!cssVar) {
    return null;
  }

  // Firefox keeps a comment written inside a custom property's value, and the default palette writes one after each
  // color (`#0071ec /* oklch(...) */`). The color parser rejects the comment, so strip it.
  const resolved = styles
    .getPropertyValue(cssVar.name)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  if (resolved) {
    return resolved;
  }

  if (cssVar.fallback === undefined) {
    return null;
  }

  return parseCssVar(cssVar.fallback) ? resolveCssVar(styles, cssVar.fallback) : cssVar.fallback.trim() || null;
}

/** A swatch's default accessible name: `var(--cs-color-brand-fill-loud)` reads "brand fill loud". */
export function getSwatchLabel(color: string) {
  const name = parseCssVar(color)?.name;
  if (!name) {
    return color;
  }

  return (
    name
      .replace(/^--(cs-)?(color-)?/, '')
      .replace(/-/g, ' ')
      .trim() || color
  );
}
