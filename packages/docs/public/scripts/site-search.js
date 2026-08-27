/**
 * Site search behaviour: the dialog, the query, and keyboard navigation.
 *
 * Talks to Pagefind's JavaScript API (`/pagefind/pagefind.js`) rather than mounting its default UI. That is the
 * whole reason this site ships none of the 22KB of widget CSS Starlight's Search pulled in: the API returns data
 * and the markup is ours. `pagefind.js` is emitted by the same build step that writes the index, and it is the
 * only file under `dist/pagefind/` that anything loads.
 *
 * The index does not exist under `astro dev` — Pagefind runs at build time — so the import is expected to fail
 * there and says so rather than looking broken.
 */
const RECENT_KEY = 'cornerstone-recent-searches';
const RECENT_LIMIT = 2;
const RESULT_LIMIT = 8;

const trigger = document.getElementById('search-trigger');
const dialog = document.getElementById('site-search');

if (trigger && dialog) {
  const input = dialog.querySelector('#site-search-input');
  const initial = dialog.querySelector('.site-search-initial');
  const recent = dialog.querySelector('.site-search-recent');
  const recentList = recent.querySelector('ul');
  const hits = dialog.querySelector('.site-search-hits');
  const empty = dialog.querySelector('.site-search-empty');
  const emptyText = empty.querySelector('p');

  /**
   * The path the site is served under. This file is copied out of `public/` verbatim, so no build step
   * substitutes anything into it — but it is loaded as a module from `<base>/scripts/site-search.js`,
   * so its own URL carries the base.
   */
  const BASE = new URL('../', import.meta.url).pathname.replace(/\/$/, '');

  /** Resolves to Pagefind's API, or to null when there is no index — which is every `astro dev` run. */
  let pagefind = null;
  const loadPagefind = async () => {
    if (pagefind !== null) {
      return pagefind;
    }

    try {
      pagefind = await import(/* @vite-ignore */ `${BASE}/pagefind/pagefind.js`);
      await pagefind.options({ excerptLength: 24 });
      await pagefind.init();
    } catch {
      pagefind = false;
    }

    return pagefind;
  };

  const readRecent = () => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, RECENT_LIMIT);
    } catch {
      return [];
    }
  };

  const rememberQuery = (query) => {
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    const next = [trimmed, ...readRecent().filter((entry) => entry !== trimmed)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  /** One row. `href` navigates; without it the row re-runs a past query. */
  const row = ({ href, icon, title, detail }) => {
    const li = document.createElement('li');
    const el = document.createElement(href ? 'a' : 'button');

    if (href) {
      el.href = href;
    } else {
      el.type = 'button';
    }

    el.className = 'site-search-item cs-cluster cs-flex-nowrap cs-gap-s cs-link-plain';
    el.setAttribute('role', 'option');
    el.innerHTML =
      `<cs-icon class="site-search-icon" name="${icon}"></cs-icon>` +
      `<span class="site-search-details cs-stack cs-gap-3xs">` +
      `<span class="site-search-title">${title}</span>` +
      (detail ? `<small class="site-search-description">${detail}</small>` : '') +
      `</span>` +
      `<cs-icon class="site-search-caret" name="keyboard_arrow_right"></cs-icon>`;
    li.append(el);

    return li;
  };

  const divider = dialog.querySelector('.site-search-divider');

  const renderRecent = () => {
    const entries = readRecent();
    recentList.replaceChildren(...entries.map((query) => row({ icon: 'history', title: query })));
    recent.hidden = entries.length === 0;
    // The rule between the two listings only earns its place when there is a second listing.
    divider.hidden = recent.hidden;
  };

  /**
   * An excerpt worth reading beside the title.
   *
   * Pagefind's excerpt is drawn from the indexed body, which starts with the page's own heading — so it opened by
   * repeating the title that is already on the row ("Color" / "Color Palette. Color palettes give you…"). The
   * leading copy is dropped when it is there.
   *
   * `<mark>` is kept: Pagefind wraps the matched terms in it, which is the whole value of an excerpt. Everything
   * else is stripped, because the excerpt is raw indexed text and this goes in with `innerHTML`.
   */
  const summarise = (excerpt, title) => {
    if (!excerpt) {
      return '';
    }

    const marksOnly = excerpt.replace(/<(?!\/?mark\b)[^>]*>/g, '');
    const withoutTitle = marksOnly.replace(
      new RegExp(`^\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[.\\s]*`, 'i'),
      '',
    );

    return withoutTitle.trim() || marksOnly.trim();
  };

  const showState = (state) => {
    initial.hidden = state !== 'initial';
    hits.hidden = state !== 'results';
    empty.hidden = state !== 'empty';
  };

  /**
   * Every row currently on screen, in visual order — what the arrow keys walk.
   *
   * Not `offsetParent !== null`, which is the usual shorthand for "is rendered": a `<dialog>` is
   * position-fixed, and `offsetParent` is null for everything inside a fixed subtree, so that test hid every
   * row and the arrow keys did nothing. `getClientRects()` asks the question that was actually meant.
   */
  const rows = () => [...dialog.querySelectorAll('.site-search-item')].filter((el) => el.getClientRects().length > 0);

  const moveActive = (delta) => {
    const all = rows();

    if (all.length === 0) {
      return;
    }

    const current = all.indexOf(dialog.querySelector('.site-search-item.is-active'));
    const next = all[(current + delta + all.length + (current === -1 ? (delta > 0 ? 0 : 1) : 0)) % all.length];

    for (const el of all) {
      el.classList.toggle('is-active', el === next);
      el.setAttribute('aria-selected', el === next ? 'true' : 'false');
    }

    next.scrollIntoView({ block: 'nearest' });
  };

  const search = async (query) => {
    if (!query.trim()) {
      showState('initial');
      renderRecent();
      return;
    }

    const api = await loadPagefind();

    if (!api) {
      showState('empty');
      emptyText.textContent = 'Search is only available in a production build — the index is written at build time.';
      return;
    }

    const found = await api.search(query);
    const results = await Promise.all(found.results.slice(0, RESULT_LIMIT).map((result) => result.data()));

    if (results.length === 0) {
      showState('empty');
      emptyText.textContent = `No results for “${query}”.`;
      return;
    }

    hits.replaceChildren(
      ...results.map((result) => {
        const title = result.meta?.title ?? result.url;

        return row({
          href: result.url,
          icon: 'description',
          title,
          detail: summarise(result.excerpt, title),
        });
      }),
    );
    showState('results');
  };

  const open = () => {
    renderRecent();
    showState('initial');
    // Focus is `cs-dialog`'s job: the input carries `autofocus` and the component honours it on open.
    dialog.open = true;
  };

  trigger.addEventListener('click', open);

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });

  let pending;
  input.addEventListener('input', () => {
    clearTimeout(pending);
    pending = setTimeout(() => search(input.value), 120);
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter') {
      const active = dialog.querySelector('.site-search-item.is-active') ?? rows()[0];

      if (!active) {
        return;
      }

      event.preventDefault();
      rememberQuery(input.value);
      active.click();
    }
  });

  // A past query goes back into the box rather than navigating.
  recentList.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (button) {
      input.value = button.textContent.trim();
      search(input.value);
      input.focus();
    }
  });

  hits.addEventListener('click', () => rememberQuery(input.value));
}
