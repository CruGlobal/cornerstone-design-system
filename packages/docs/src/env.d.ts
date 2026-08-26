/**
 * Ambient types this site needs and nothing else supplies.
 *
 * `astro sync` generates `.astro/types.d.ts`, which references only `astro/client` and the content
 * collections. Starlight's own declarations are not reachable from here: its package `exports` map exposes
 * `./locals` and nothing else, so `virtual.d.ts` and `global.d.ts` cannot be referenced by module path even
 * though they exist on disk.
 *
 * And `virtual:starlight/components/*` is not declared anywhere at all — the integration generates one of
 * those modules per component override, at build time, so there is no static declaration to point at. Every
 * override in `src/components/` imports one.
 *
 * Without this file `astro check` reports 30 errors, all of them missing types rather than defects.
 */

/// <reference types="@astrojs/starlight/locals" />

/**
 * A Starlight component override, resolved by the integration at build time.
 *
 * Typed as loosely as the real thing is: an `.astro` component takes arbitrary props, and the override
 * mechanism does not narrow them. Tightening this would mean asserting a contract Starlight does not
 * publish.
 */
declare module 'virtual:starlight/components/*' {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}

declare module 'virtual:starlight/user-config' {
  /**
   * Only the two fields this site reads. Declaring the whole of Starlight's config would mean copying a
   * shape it does not publish, and it would go stale silently.
   */
  const Config: {
    pagefind?: boolean;
    components: Record<string, string>;
  };
  export default Config;
}
