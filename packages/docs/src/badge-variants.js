/**
 * Starlight's badge variants, mapped onto Cornerstone's.
 *
 * Two places render a page's `sidebar.badge` front matter — the navigation tree in `SidebarList.astro` and
 * the section-index cards in `remark-page-index.js` — and the two names do not line up: Starlight spells
 * the amber one `caution` where `cs-badge` calls it `warning`, and `tip` has no counterpart at all.
 *
 * They had diverged. `remark-page-index.js` carried this full map; the sidebar remapped only `note` and
 * passed everything else through, so `caution` and `tip` reached `variant=` as values outside
 * `badge.ts:31-38`'s union. An unmatched variant matches none of `variants.styles.ts`'s
 * `:host([variant='…'])` rules and silently inherits the neutral fills — so the same badge could render
 * correctly on a card and wrong in the tree beside it.
 *
 * One map, imported by both, so they cannot drift again.
 *
 * It must also be *complete*. Starlight's enum is `note | danger | success | caution | tip | default`, and
 * this map originally carried four of the six — so the three framework pages, which all say
 * `variant: success`, fell through the `?? 'neutral'` and rendered grey where they meant green. Nothing
 * failed; the badge was simply the wrong colour, which is why it survived. Every Starlight variant now has
 * an entry, and `default` maps to neutral deliberately rather than by omission.
 */
export const BADGE_VARIANTS = {
  note: 'neutral',
  default: 'neutral',
  tip: 'success',
  success: 'success',
  caution: 'warning',
  danger: 'danger',
};

/** The `cs-badge` variant for a Starlight badge, falling back to neutral for anything unrecognised. */
export const badgeVariant = (variant) => BADGE_VARIANTS[variant] ?? 'neutral';
