import { customElement as litCustomElement } from 'lit/decorators.js';

/**
 * Which build this module graph came from. Stamped by esbuild in `scripts/build.js`; absent under
 * web-test-runner and in a raw `tsc` program, where `typeof` on an undeclared identifier is the one
 * operator that does not throw.
 */
declare const __CS_BUILD__: string;

/** Matches Lit's own decorator target type, which allows classes with private constructors. */
type CustomElementClass = Omit<typeof HTMLElement, 'new'>;

const thisBuild = typeof __CS_BUILD__ === 'string' ? __CS_BUILD__ : 'unknown';

/**
 * Which build registered each tag. Keyed off `globalThis` under a `Symbol.for`, because the unbundled and
 * bundled builds are separate module graphs and the whole point is that the second one can see the first.
 */
const REGISTRY_KEY = Symbol.for('cornerstone.registeringBuilds');

function registeringBuilds(): Map<string, string> {
  const global = globalThis as unknown as Record<symbol, Map<string, string> | undefined>;
  const existing = global[REGISTRY_KEY];
  if (existing) {
    return existing;
  }
  const created = new Map<string, string>();
  global[REGISTRY_KEY] = created;
  return created;
}

/**
 * Registers a custom element, skipping the definition if the tag is already taken.
 *
 * Lit's decorator calls `customElements.define` unguarded, which throws on a second definition. With static
 * imports that throw aborts the whole entry module, so every line after the imports never runs and the page
 * renders nothing — a blank page with the consumer's own code the first thing they suspect. It happens when
 * one import resolves the unbundled build and another the bundled one, which is a bundler-only hazard: the
 * unbundled build cannot load in a plain browser at all, so only one build ever registers there.
 *
 * Skipping is what `utilities/autoloader.ts` and `select.ts` already do, so the library already holds the
 * position that a second registration is survivable. The warning exists because silence would hide the case
 * this cannot make safe: two different *versions* loaded together resolve to whichever won the race, and
 * that is worse to debug than a throw.
 */
export function customElement(tagName: string) {
  return (cls: CustomElementClass): void => {
    if (customElements.get(tagName)) {
      const firstBuild = registeringBuilds().get(tagName) ?? 'unknown';
      console.warn(
        `Cornerstone Components: <${tagName}> is already defined, so this definition was skipped. ` +
          `The existing one came from the ${firstBuild} build; this one is from the ${thisBuild} build. ` +
          `Import each component from one build only — mixing them doubles the bundle, and if the two are ` +
          `different versions the page runs whichever registered first.`,
      );
      return;
    }

    registeringBuilds().set(tagName, thisBuild);
    litCustomElement(tagName)(cls);
  };
}
