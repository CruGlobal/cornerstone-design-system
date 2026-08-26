/**
 * Stub the four Starlight stylesheets that `Page.astro` imports directly.
 *
 * `Page.astro` is the one layout component Starlight does not expose through
 * `virtual:starlight/components/*` — it is absent from the 28-key `ComponentConfigSchema` and is
 * imported by relative path from `routes/common.astro`, so there is no override for it and no
 * `removeRoute` in Astro's API. Its first five imports are therefore fixed, and a Vite plugin
 * intercepting the module ids is the only way to stop four of them reaching the bundle.
 *
 * Why bother, per file — all measured against the build immediately before this plugin landed
 * (`common.gFl6Bvlt.css`, 24,375 B, of which 8,787 B was Starlight's):
 *
 * - `reset.css` (699 B) — the one that matters, and not for its size. It carries `* { margin: 0 }`,
 *   and a universal margin reset in the outer document beats a shadow root's `::slotted()` and
 *   `:host()` rules regardless of specificity *or* cascade layer. So it was silently flattening
 *   every Cornerstone component's own spacing site-wide: `cs-divider`'s block margins, the gap
 *   after a `cs-radio`, the `margin-inline-end` on a button's `start` slot. `callout.styles.ts`
 *   already carries an `!important` patch for exactly this and names the general case in its
 *   comment — that patch was never a special case, it was the one instance anybody noticed.
 *   `revert-layer` cannot undo it (it rolls back to the UA origin, not to a lower layer), so
 *   stubbing the file is the only fix short of 20+ copies of the callout patch.
 *
 * - `props.css` (5,751 B) — 91 `--sl-*` tokens. Nothing outside the stubbed files reads any of
 *   them except `Page.astro`'s own inline `<style>`, which reads four, and all four are already
 *   beaten on specificity: `--sl-nav-height` and `--sl-mobile-toc-height` feed
 *   `html { scroll-padding-top }`, which `docs.css`'s `:root { scroll-padding-top: 0 }` overrides;
 *   `--sl-main-pad` feeds `main:where(.astro-*)` (0,0,1), which `cs-page > main` (0,0,2) overrides;
 *   `--sl-sidebar-width` feeds `--sl-content-inline-start`, which nothing reads at all.
 *   `print.css` reads 15 `--sl-*` tokens and keeps shipping, but every rule that does so is a dead
 *   selector here (`.sl-banner`, `.sl-badge`, `.sl-link-button`, `.sl-steps`, `starlight-file-tree`,
 *   `.expressive-code`), so it has no live dependency either.
 *
 * - `asides.css` (1,268 B) and `util.css` (618 B) — provably dead. `starlight-aside`, `sr-only`,
 *   `sl-hidden`, `sl-flex`, `sl-block` and `rtl:flip` appear **0 times across all 115 built pages**.
 *
 * Two things `reset.css` supplied that needed a replacement first, both now in place:
 *
 * 1. `input, button, textarea, select { font: inherit }`. `native.css` sets `font-family: inherit`
 *    and `font-size: inherit` on text inputs, textarea and select (its `input:not(...)` block) and
 *    `font-family: inherit` on buttons — so the library already covers all four element types.
 *    The docs' own light-DOM buttons are `.code-example-buttons button`, which sets `all: unset`
 *    and its own `font-size`, so they never depended on it.
 * 2. `p, h1..h6, code { overflow-wrap: break-word }`. Now stated by `native.css` in layer
 *    `cs-native`, which also reaches the `.cs-not-prose` blocks that `prose.css`'s
 *    `@scope (.cs-prose) to (.cs-not-prose)` rule cannot.
 *
 * `layers.css` is deliberately NOT stubbed: it declares the `starlight.*` layer order that
 * `astro.config.mjs` relies on when it states the full order including the `cs-*` layers.
 */

/** Files under `@astrojs/starlight/style/` whose contents we replace with nothing. */
const STUBBED = ['props.css', 'reset.css', 'asides.css', 'util.css'];

const STYLE_DIR = '/@astrojs/starlight/style/';

export function stubStarlightStyles() {
  return {
    name: 'cornerstone:stub-starlight-styles',
    enforce: 'pre',

    load(id) {
      // Strip Vite's query suffixes (`?url`, `?raw`, `?direct`) and normalise Windows separators
      // before matching, or the same file arrives under several ids and slips through.
      const path = id.split('?')[0].replace(/\\/g, '/');
      if (!path.includes(STYLE_DIR)) {
        return null;
      }

      const file = STUBBED.find((name) => path.endsWith(`${STYLE_DIR}${name}`));
      if (!file) {
        return null;
      }

      return `/* ${file} stubbed by src/plugins/stub-starlight-styles.js */\n`;
    },

    /**
     * Guard on the emitted CSS, not on whether `load` ran.
     *
     * Counting `load` calls was the obvious check and it is wrong: Vite's transform cache serves
     * already-stubbed modules without calling the hook, so a warm build warned while the stub was
     * plainly in effect — a false alarm that teaches you to ignore the alarm. What matters is
     * whether the bytes reached the bundle, and that is true or false regardless of caching.
     *
     * Each signature below has to be unique to one stubbed file *across every emitted stylesheet*,
     * not merely characteristic of it — the first attempt used `starlight-aside`, which `print.css`
     * also contains and which is not stubbed, so the guard reported a failure that had not happened.
     * Given that, this also survives a Starlight upgrade that moves or renames the files: the path
     * can change, the rule cannot.
     */
    writeBundle(_options, bundle) {
      const SIGNATURES = [
        ['reset.css', '*{margin:0}'],
        ['util.css', '.sl-hidden'],
        // Not `starlight-aside`: `print.css` styles that selector too, is not stubbed, and is
        // emitted as its own asset — so the obvious signature fired on a file that is meant to
        // contain it. This token is read only by asides.css.
        ['asides.css', '--sl-color-asides-text-accent'],
        ['props.css', '--sl-nav-height:'],
      ];

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) {
          continue;
        }
        const css = String(chunk.source);
        for (const [file, signature] of SIGNATURES) {
          if (css.includes(signature)) {
            this.warn(
              `${chunk.fileName} still contains \`${signature}\` from ${file}: the stub did not ` +
                `apply. Check whether @astrojs/starlight has moved it out of ${STYLE_DIR}. ` +
                `Leaving it in place restores the site-wide margin suppression.`,
            );
          }
        }
      }
    },
  };
}
