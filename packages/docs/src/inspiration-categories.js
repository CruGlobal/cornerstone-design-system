import { findCategory } from './component-categories.js';

/**
 * The two closed lists an Inspiration entry's `category` is checked against: a **Goal** for Screens and
 * Flows, a **Kind** for Patterns.
 *
 * Two lists rather than one because the field means two things (#146). A Screen or Flow is sorted by what
 * the person is trying to get done; a Pattern by what sort of interface piece it is, since a password
 * field serves several goals and an empty state serves none.
 *
 * **A value joins its list with its first entry** (#146, decision 5): no planned or "coming soon" values.
 * That is why each list holds exactly what the seeded entries use. Add a value in the same pull request
 * as the entry that needs it.
 *
 * **A Kind that shares a label with a component category shares its meaning and its icon** (#146,
 * decision 3), so a shared Kind takes its icon from `component-categories.js` rather than repeating it.
 * Repeating it would let the two drift apart while still claiming to be the same thing.
 */

const kind = (label, definition) => {
  const shared = findCategory(label);

  if (!shared) {
    throw new Error(`Kind "${label}" names no component category, so it needs its own slug and icon here.`);
  }

  return { label, slug: shared.slug, icon: shared.icon, definition };
};

/** Patterns. Content and Forms join with Summary list and Form layout (UIUX-209). */
export const kinds = [kind('Feedback', 'Tells the person what happened, what went wrong, or what to do next.')];

/** Screens and Flows. */
export const goals = [
  {
    label: 'Account management',
    slug: 'account-management',
    icon: 'manage_accounts',
    definition:
      'Changing what an app knows about you and how it behaves for you: your profile details, your preferences. Excludes your sign-in identity.',
  },
];

/**
 * Each tier's folder, its names, and which list its `category` comes from.
 *
 * `list` is the query parameter the Goal or Kind pill links with. The filtered list it points at arrives
 * with the filtering work, which is out of scope for the page shell; see `categoryHref`.
 */
export const tiers = {
  patterns: { label: 'Pattern', plural: 'Patterns', axis: 'Kind', list: 'kind', values: kinds, icon: 'widgets' },
  screens: { label: 'Screen', plural: 'Screens', axis: 'Goal', list: 'goal', values: goals, icon: 'web' },
  flows: { label: 'Flow', plural: 'Flows', axis: 'Goal', list: 'goal', values: goals, icon: 'route' },
};

/**
 * The Goal or Kind an entry names, or a thrown error that says which list it should have come from.
 *
 * Throwing is the build check #146 decided on: a value not on the list, or on the wrong tier's list (a
 * Goal on a Pattern), fails rather than rendering a pill that links nowhere.
 */
export function categoryFor(tier, label, where) {
  const { axis, values } = tiers[tier];
  const found = values.find((value) => value.label === label);

  if (!found) {
    throw new Error(
      `${where}: category "${label}" is not a ${axis}. A ${tiers[tier].label} takes one of: ` +
        `${values.map((value) => value.label).join(', ')}. Add a new value to src/inspiration-categories.js ` +
        'with the entry that first needs it.',
    );
  }

  return found;
}

/** Where the Goal or Kind pill points: the tier's list, filtered to that value. */
export const categoryHref = (tier, category) => `/inspiration/${tier}?${tiers[tier].list}=${category.slug}`;
