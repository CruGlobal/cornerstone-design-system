/**
 * The reference's categories, in the order they are meant to read.
 *
 * A page names its category in front matter; this supplies the icon and the slug. Ported from the
 * Eleventy site's `docs/_data/componentCategories.json` minus its "Data Viz" entry, which no
 * component uses and whose only navigation link pointed at `/docs/components/chart` — a page this
 * fork does not have. Add it back with the component that needs it.
 *
 * `icon` is the category's Material Symbols (sharp) name. It used to be two fields — a Font Awesome
 * `icon` beside a Material `symbol` — because the navigation had already moved to Material Symbols
 * while `cs-icon` still resolved Font Awesome. Now that `cs-icon` resolves Material Symbols itself,
 * they are one field again.
 */
export const componentCategories = [
  { label: 'Actions', slug: 'actions', icon: 'touch_app' },
  { label: 'Forms', slug: 'forms', icon: 'edit_square' },
  { label: 'Layout', slug: 'layout', icon: 'layers' },
  { label: 'Navigation', slug: 'navigation', icon: 'explore' },
  { label: 'Feedback', slug: 'feedback', icon: 'notifications' },
  { label: 'Media', slug: 'media', icon: 'perm_media' },
  { label: 'Helpers', slug: 'helpers', icon: 'build' },
];

export const findCategory = (label) => componentCategories.find((category) => category.label === label);

/**
 * The Material Symbol beside each section heading.
 *
 * Kept next to the tree that uses it so a new section cannot quietly go iconless. Component categories
 * carry their own `symbol` in component-categories.js.
 */
export const SECTION_SYMBOLS = {
  'Getting Started': 'wand_stars',
  Resources: 'menu_book',
  'Theming & Utilities': 'palette',
};
