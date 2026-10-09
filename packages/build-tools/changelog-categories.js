/**
 * The categories a changelog entry can declare, and the order a release lists them in.
 *
 * changesets records the bump a change causes, and a bump level is not a category: `patch` covers a bug
 * fix, a chore and a tooling tweak alike. So each changeset leads its summary with a category instead —
 * `Fixed:`, `Added:` — and two things read it. `sort-changelog.js` files every entry of a release under a
 * `### <label>` heading, in this order, when `npm run version` runs. The docs site's `remark-changelog.js`
 * turns each of those groups into bullet icons and a legend. Both read this one table, so the order of a
 * release's headings and the order of the page's legend cannot disagree.
 *
 * The key order is the release order: breaking first, because a reader upgrading needs that before
 * anything else. `icon` is a Material Symbols name the docs page renders in place of the list marker.
 */
export const CATEGORIES = {
  breaking: { label: "Breaking", icon: "warning" },
  added: { label: "Added", icon: "add" },
  changed: { label: "Changed", icon: "cleaning_services" },
  removed: { label: "Removed", icon: "close" },
  fixed: { label: "Fixed", icon: "build" },
  deprecated: { label: "Deprecated", icon: "schedule" },
};

const PREFIX = new RegExp(`^(${Object.keys(CATEGORIES).join("|")}):\\s*`, "i");

/**
 * The category a summary declares by its prefix, and the summary without it. `null` when it declares none:
 * an entry's category is what its author wrote, never something read into its wording.
 */
export function declaredCategory(summary) {
  const match = PREFIX.exec(summary);

  return match
    ? { name: match[1].toLowerCase(), rest: summary.slice(match[0].length) }
    : null;
}

/** The category a `### <label>` heading names, or `null` for one that names none, such as a bump level. */
export function headingCategory(heading) {
  const label = heading.trim().toLowerCase();

  return (
    Object.keys(CATEGORIES).find(
      (name) => CATEGORIES[name].label.toLowerCase() === label
    ) ?? null
  );
}
