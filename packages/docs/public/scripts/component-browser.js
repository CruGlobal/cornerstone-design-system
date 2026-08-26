/**
 * Filtering and sorting for the components browse page.
 *
 * The page's markup is generated at build time by `src/plugins/remark-component-browser.js`; this only
 * shows, hides and reorders what is already there. Nothing here reads rendered text — every value the
 * filters test is a `data-*` attribute on the card's link, so changing how a card looks cannot break
 * how it filters.
 *
 * Loaded on every page from `astro.config.mjs`, like `code-examples.js` and `site-search.js`, so it
 * begins by checking whether this page has a grid at all and leaves if not.
 */

const grid = document.querySelector('.component-browser-grid');

if (grid) {
  const cards = [...grid.querySelectorAll('.component-card-link')];
  const empty = document.querySelector('.component-browser-empty');
  const search = document.querySelector('.component-browser-search');
  const category = document.querySelector('.component-browser-category');
  const sort = document.querySelector('.component-browser-sort');
  const experimental = document.querySelector('.component-browser-experimental');

  /**
   * The document order the page was built in, which is alphabetical by name.
   *
   * Kept so the "Name" sort restores it rather than re-deriving it: the build already sorted with
   * `localeCompare`, and re-sorting in the browser risks a different collation answering differently.
   */
  const alphabetical = cards.slice();

  const apply = () => {
    const query = (search?.value ?? '').trim().toLowerCase();
    const wanted = category?.value ?? '';
    const showExperimental = experimental?.checked ?? true;

    let visible = 0;

    for (const card of cards) {
      const matchesQuery = !query || card.dataset.search.includes(query);
      const matchesCategory = !wanted || card.dataset.category.toLowerCase() === wanted;
      const matchesStatus = showExperimental || card.dataset.status !== 'experimental';
      const show = matchesQuery && matchesCategory && matchesStatus;

      // `hidden` is enough here because the card's link carries no `cs-*` layout class. On an element
      // that does, `[class*='cs-stack'] { display: flex }` beats `hidden`'s `display: none` — the trap
      // the search dialog hit — and the rule has to be restated.
      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    }

    if (empty) {
      empty.hidden = visible > 0;
    }
  };

  const reorder = () => {
    const order =
      sort?.value === 'since'
        ? // Newest first, and alphabetical within one release so the order is stable rather than
          // whatever the previous sort left behind.
          alphabetical.slice().sort((a, b) => b.dataset.since.localeCompare(a.dataset.since))
        : alphabetical;

    // One append call: passing every node reinserts them in order and moves rather than clones.
    grid.append(...order);
  };

  const update = () => {
    reorder();
    apply();
  };

  /**
   * A category in the URL selects it on arrival.
   *
   * Every reference page's category badge links here as `?category=<slug>`, which is how the Eleventy
   * site did it and how upstream does it — the badge is a filter, not an anchor. An unknown slug is
   * ignored rather than filtering everything away to nothing.
   */
  const applyUrlCategory = () => {
    const slug = new URLSearchParams(location.search).get('category');

    if (!slug || !category) {
      return;
    }

    const known = [...category.querySelectorAll('cs-option')].some((option) => option.value === slug);

    if (known) {
      category.value = slug;
    }
  };

  // The controls are custom elements, so their `value` is not readable until they upgrade.
  Promise.all(['cs-input', 'cs-select', 'cs-checkbox', 'cs-option'].map((tag) => customElements.whenDefined(tag))).then(
    () => {
      applyUrlCategory();
      update();

      search?.addEventListener('input', apply);
      search?.addEventListener('cs-clear', apply);
      category?.addEventListener('change', update);
      sort?.addEventListener('change', update);
      experimental?.addEventListener('change', apply);
    }
  );
}
