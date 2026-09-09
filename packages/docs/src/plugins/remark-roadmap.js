import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import { visit } from 'unist-util-visit';
import { roadmapCopy } from '../roadmap-copy.js';

/**
 * The roadmap page: one card per planned release, generated from this repository's GitHub milestones.
 *
 * A roadmap is the page most likely to be wrong, because it is the only page nothing forces anyone to
 * revisit. A component's reference is rendered from the manifest and a version reaches the changelog by
 * being released, so both correct themselves; a hand-written roadmap goes stale the day after it ships and
 * nothing on the site notices. So `::roadmap` is replaced with the milestones as they stand at build time,
 * and a release reaches this page by existing in the tracker rather than by being remembered.
 *
 * The milestones are version-keyed — `1.0.0`, `1.1.0` — so a card is a release and its title is the
 * version it will ship as. That only means anything because both published packages are being locked to
 * one version number, so `1.0.0` names the same thing across the library and the tokens. The page states
 * no current version for that reason: those move, and a number written here would be the one thing on a
 * generated page that could go stale.
 *
 * **Two levels, and only one of them is opt-in.**
 *
 * The *release* is the milestone: its version, curated copy from `roadmap-copy.js`, and a count of the
 * decisions still open inside it. None of that reveals anything about an individual issue.
 *
 * The *items* are issues carrying the `roadmap` label, and the label is a gate rather than a filter.
 * `docs/agents/issue-tracker.md` records what this repo's issues are: **decisions, not work** — open
 * questions the system needs answered, titled as questions ("Decide the category axis and its values at
 * launch"). That is internal deliberation. Publishing those titles would turn a roadmap into a feed of
 * arguments the project has not finished having, and a consumer reading one would reasonably mistake a
 * question for a plan. So an issue's title reaches this page only when someone has labelled it, and the
 * gate is applied twice — once as the API's own `labels=` filter, once again over what comes back — because
 * a filter that silently stops filtering is exactly the failure this page cannot survive.
 *
 * **The count is a count, not progress.** GitHub gives both halves of the fraction and a percentage is one
 * subtraction away, which is the trap: a milestone at `open=0 closed=1` would render as "100% complete"
 * while being the release nobody has started. `N open questions` cannot be misread that way — nothing
 * about zero open questions claims the questions were answered — and the page's introduction states how to
 * read zero rather than leaving it to be inferred. No stage vocabulary is invented to paper over it
 * either: "Planned", "In progress" and "Shipped" would be three words of judgment on top of one fact,
 * maintained nowhere and true by luck.
 *
 * Zero is now the *common* case rather than the exception — two of the four releases have no chartered
 * decisions at all — which is what makes the one explanatory sentence on the page load-bearing rather than
 * decorative. Half a page of cards reading `0 open questions` with nothing saying how to read that would
 * look like a page that failed to load.
 *
 * `milestone.open_issues` is GitHub's own count, and GitHub counts a milestoned *pull request* in it. That
 * is a known imprecision, accepted deliberately: the exact alternative is fetching every open issue in the
 * repo and filtering by type, which pulls the titles this page exists to keep off itself into the build
 * process to answer a question that is already answered — and this repo milestones decisions, so no open
 * pull request carries one.
 *
 * **When GitHub cannot be reached, the page says so.** Three options, and two of them are worse than the
 * third. Failing the build takes down 130 pages, the component reference included, over one API call on a
 * page that is not even the site's front door. Rendering empty cards asserts something false — "no open
 * questions" is a claim, and a wrong roadmap published confidently is worse than no roadmap. What is left
 * is to render nothing that could be mistaken for data: a notice saying the roadmap could not be generated,
 * pointing at the milestones on GitHub, which are the source and are current. The build logs a warning, and
 * `scripts/check-pages.js` asserts that the page rendered one of the three states below — cards, the
 * notice, or "no release is open" — so a plugin that stops matching altogether still fails the gate while
 * a bad minute at GitHub does not.
 *
 * The two requests are one unit for the same reason. Milestones succeeding while the issues request fails
 * would render every release with its items missing, which is not a degraded roadmap but an incorrect one.
 *
 * **`GITHUB_TOKEN` is used when the environment has one.** The repository is public and the milestones
 * endpoint answers 200 unauthenticated, so no credential is required — but unauthenticated GitHub is 60
 * requests an hour *per IP*, and Actions runners share IPs with every other repository building on the same
 * host. Authenticated is 1000 an hour against the token's own budget. Actions sets `GITHUB_TOKEN` already,
 * so this costs nothing there and falls back to unauthenticated on a developer's machine.
 *
 * The repository address is read from `packages/components/package.json`'s `repository` field, the same
 * manifest `build-tools/site-url.js` takes the documentation address from — so the repo is written down
 * once, where npm already renders it. `scripts/check-docs-url.js` does not constrain the links here: it
 * governs the *documentation* address, and `github.com` is not it. Its dead-host list would flag
 * `cruglobal.github.io` if the site ever moved to a Cru domain, which is another reason the item links
 * point at `github.com` and are derived rather than typed.
 */

/** The label that opts an issue in. Set on the label itself in GitHub, so the two agree. */
const ROADMAP_LABEL = 'roadmap';

/** How long to wait on GitHub before treating it as unreachable. A hung request must not hang a build. */
const TIMEOUT_MS = 10_000;

/** `owner/repo`, from the manifest that already records it. */
const repositorySlug = () => {
  const { repository } = JSON.parse(readFileSync(join(componentsDir(), 'package.json'), 'utf8'));
  const url = typeof repository === 'string' ? repository : (repository?.url ?? '');
  const match = /github\.com[/:]([^/]+\/[^/.]+)/.exec(url);

  if (!match) {
    throw new Error(`Could not read a GitHub repository from packages/components/package.json: ${url}`);
  }

  return match[1];
};

const REPO = repositorySlug();
const REPO_URL = `https://github.com/${REPO}`;
const MILESTONES_URL = `${REPO_URL}/milestones`;

/** One GitHub REST call, authenticated if the environment has a token to authenticate with. */
async function fetchJson(path) {
  // Both names, because Actions supplies the first and the `gh` CLI exports the second.
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      // GitHub rejects an API request with no user agent, and naming the caller is what makes a
      // rate-limit conversation possible later.
      'User-Agent': 'cornerstone-docs-site',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    // The remaining-quota header is the difference between "GitHub is down" and "this IP is out of
    // requests", which are different problems with different fixes.
    const remaining = response.headers.get('x-ratelimit-remaining');
    throw new Error(
      `GitHub returned ${response.status} ${response.statusText} for ${path}` +
        (remaining === '0' ? ` (rate limit exhausted${token ? '' : '; no GITHUB_TOKEN in the environment'})` : ''),
    );
  }

  return response.json();
}

/**
 * `1.10.0` → `[1, 10, 0]`, and anything that is not a plain version → `null`.
 *
 * Milestones are version-keyed, so a version is the thing being sorted and compared. Parsed rather than
 * string-compared because a string compare puts `1.10.0` before `1.2.0`, and this project will reach a
 * tenth minor.
 */
const version = (title) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(title.trim());
  return match ? match.slice(1, 4).map(Number) : null;
};

/**
 * The releases, in release order, or `null` if GitHub could not be reached.
 *
 * **Sorted by version, explicitly, and not by anything GitHub hands back.** The API's own order is
 * creation order, which is not release order and cannot be: `1.1.0` and `1.2.0` were created after `1.3.0`
 * had already been renamed onto an older milestone, so creation order reads 1.3.0, 1.0.0, 1.1.0, 1.2.0 —
 * a roadmap that opens with its last release. `due_on` is not the answer either; none of the milestones
 * sets one, and inventing dates to get an ordering would publish commitments nobody made.
 *
 * A milestone whose title is not a version still renders, after every version, in creation order. Not a
 * hypothetical: the milestones were efforts (`Themes`, `Inspiration`, `Frameworks`) until they were
 * version-keyed, and a roadmap that dropped a milestone it could not parse would have shown a blank page
 * rather than a wrong one — which is worse, because a blank page looks finished.
 */
async function fetchReleases() {
  const [milestones, labelled] = await Promise.all([
    fetchJson('/milestones?state=open&per_page=100'),
    fetchJson(`/issues?state=open&labels=${ROADMAP_LABEL}&per_page=100`),
  ]);

  // `/issues` returns pull requests too — they are issues to GitHub — and the label check is re-applied
  // rather than trusted. See the header: this is the one gate on the page whose failure is unrecoverable.
  const items = labelled
    .filter((issue) => !issue.pull_request)
    .filter((issue) => (issue.labels ?? []).some((label) => label.name === ROADMAP_LABEL));

  const orphans = items.filter((issue) => !issue.milestone);

  if (orphans.length) {
    console.warn(
      `remark-roadmap: ${orphans.length} issue(s) carry the \`${ROADMAP_LABEL}\` label with no milestone, so ` +
        `they have no release to render under: ${orphans.map((issue) => `#${issue.number}`).join(', ')}. ` +
        `Assign a milestone or remove the label.`,
    );
  }

  const byVersion = (a, b) => {
    const [left, right] = [version(a.title), version(b.title)];

    if (!left || !right) {
      // A version always precedes a title that is not one; two non-versions keep creation order.
      return left ? -1 : right ? 1 : a.number - b.number;
    }

    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
  };

  return milestones.sort(byVersion).map((milestone) => ({
    title: milestone.title,
    copy: roadmapCopy[milestone.title] ?? null,
    openQuestions: milestone.open_issues,
    items: items.filter((issue) => issue.milestone?.number === milestone.number).sort((a, b) => a.number - b.number),
  }));
}

/**
 * Fetched once per build process, not once per page.
 *
 * The directive lives on one page today, so this is cheap insurance rather than a measured saving — but the
 * block is self-contained and nothing stops it appearing on a second page, and two identical API calls
 * against a 60-an-hour budget is the kind of cost that only shows up under rate limiting.
 */
let pending;

function loadReleases() {
  pending ??= fetchReleases().catch((error) => {
    console.warn(
      `remark-roadmap: could not generate the roadmap from GitHub — ${error.message}. The page will say so ` +
        `rather than render an empty one; see the header comment in src/plugins/remark-roadmap.js.`,
    );
    return null;
  });

  return pending;
}

const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Escaped, then backtick spans reopened as `<code>`. The one piece of markup a curated summary gets. */
const prose = (value) => escape(value).replace(/`([^`]+)`/g, '<code>$1</code>');

/** `9 open questions`, and `1 open question`. */
const questions = (count) => `${count} open question${count === 1 ? '' : 's'}`;

/**
 * One opt-in item: the issue's title, linking to the issue.
 *
 * The `#123` badge is the changelog's, deliberately — `remark-changelog.js` renders every issue and pull
 * request reference as an outlined neutral badge with the `adjust` glyph, and a reference to a GitHub issue
 * should look the same on both pages. The markup is written here rather than shared because that plugin
 * builds its badge by rewriting a link it found in generated markdown, which is not the shape this is.
 */
const item = (issue) =>
  `<li class="roadmap-item">` +
  `<a class="roadmap-item-link" href="${escape(issue.html_url)}" target="_blank" rel="noreferrer">` +
  `<span class="roadmap-item-title">${escape(issue.title)}</span>` +
  `<cs-badge class="roadmap-item-ref" variant="neutral" appearance="outlined">` +
  `<cs-icon slot="start" name="adjust" aria-hidden="true"></cs-icon>#${issue.number}</cs-badge>` +
  `</a>` +
  `</li>`;

/**
 * One release's card. Its version is not in here: the heading above it is authored as markdown so it lands
 * in the "On this page" outline and gets a real anchor, which is the same reason `remark-page-index.js`
 * emits its group headings that way. A release is a thing people link to.
 *
 * **The outer `<div>` is load-bearing, and `cs-card` cannot replace it.** CommonMark opens a raw HTML block
 * on a *known* block-level tag even with content following on the same line, which is why
 * `remark-page-index.js` can emit its whole grid as one line beginning `<div class="page-index cs-grid">`.
 * An unknown tag only opens a block when it stands alone on its line. So a one-line string beginning
 * `<cs-card …>` is parsed as *inline* HTML, remark wraps it in a paragraph, and the `<p>` inside then closes
 * both the paragraph and the card: the built page had an empty `<cs-card></cs-card>` with the summary and
 * the count sitting outside it. A `div` sidesteps the rule rather than depending on line breaks nobody
 * editing this would know to preserve.
 */
const card = (release) =>
  `<div class="roadmap-release">` +
  `<cs-card>` +
  (release.copy?.summary ? `<p class="roadmap-summary">${prose(release.copy.summary)}</p>` : '') +
  (release.copy?.criteria?.length
    ? `<ul class="roadmap-criteria">` +
      release.copy.criteria.map((entry) => `<li>${prose(entry)}</li>`).join('') +
      `</ul>`
    : '') +
  `<p class="roadmap-questions">${questions(release.openQuestions)}</p>` +
  (release.items.length ? `<ul class="roadmap-items cs-list-plain">${release.items.map(item).join('')}</ul>` : '') +
  `</cs-card>` +
  `</div>`;

/**
 * No open milestones at all — a true state rather than a failure, and a different sentence from the one
 * below. It exists so the page cannot render as a heading over nothing, and so `check-pages.js` has
 * something to assert against in a repo that has closed every release it had planned.
 *
 * The apostrophes below are typographic. Markdown prose on this page gets them from smartypants, which
 * never sees raw HTML, so a straight one here sits next to a curly one in the paragraph above it.
 */
const noReleases = () =>
  `<p class="roadmap-empty">No release is open right now. ` +
  `<a href="${MILESTONES_URL}" target="_blank" rel="noreferrer">The project’s milestones</a> are where ` +
  `the next one will appear.</p>`;

/**
 * The degraded state: honest, pointed at the source, and impossible to mistake for a roadmap. Wrapped in a
 * `div` for the same parsing reason as the card above.
 */
const unavailable = () =>
  `<div class="roadmap-unavailable">` +
  `<cs-callout variant="neutral" appearance="outlined">` +
  `<cs-icon slot="icon" name="cloud_off" aria-hidden="true"></cs-icon>` +
  `<strong>This roadmap could not be generated when the page was built.</strong> It reads the project’s ` +
  `milestones from GitHub, and that request did not succeed. ` +
  `<a href="${MILESTONES_URL}" target="_blank" rel="noreferrer">The milestones on GitHub</a> are the ` +
  `source it reads, and they are current.` +
  `</cs-callout>` +
  `</div>`;

export function remarkRoadmap() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return async (tree) => {
    /**
     * Located before anything is fetched, so a build of the other 130 pages makes no network request. Keyed
     * on the directive rather than on the file path — unlike `remark-changelog.js`, which has to guard by
     * filename because it also rewrites `:::added` containers that appear elsewhere. This block is
     * self-contained, so restricting it to one page would buy nothing and would stand in the way of
     * putting the roadmap on the home page later.
     */
    /** @type {{ index: number, parent: { children: unknown[] } } | undefined} */
    let marker;

    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name === 'roadmap') {
        marker = { index, parent };
        return false;
      }
    });

    if (!marker) {
      return;
    }

    const releases = await loadReleases();

    if (!releases) {
      marker.parent.children.splice(marker.index, 1, ...processor.parse(unavailable()).children);
      return;
    }

    if (!releases.length) {
      marker.parent.children.splice(marker.index, 1, ...processor.parse(noReleases()).children);
      return;
    }

    const missing = releases.filter((release) => !release.copy?.summary).map((release) => release.title);

    if (missing.length) {
      console.warn(
        `remark-roadmap: no consumer-facing copy for ${missing.join(', ')} — the card renders with its ` +
          `version and its open-question count only. Add an entry in src/roadmap-copy.js.`,
      );
    }

    const nodes = releases.flatMap((release) => {
      const parsed = processor.parse(`## ${release.title}\n\n${card(release)}`).children;
      const heading = parsed.find((node) => node.type === 'heading');
      const parts = version(release.title);

      // Astro's slugger strips the dots, so `## 1.0.0` is anchored at `#100` — an id nobody would guess
      // and nobody can read, on the one thing on this page people will link to. `remark-changelog.js` hit
      // exactly this and states its version ids the same way; the two pages now agree on the shape, so a
      // link to `#v1-0-0` means the same thing on both. Verified to reach the "On this page" outline as
      // well as the heading itself.
      if (heading && parts) {
        heading.data = {
          ...heading.data,
          hProperties: { ...heading.data?.hProperties, id: `v${parts.join('-')}` },
        };
      }

      return parsed;
    });

    marker.parent.children.splice(marker.index, 1, ...nodes);
  };
}
