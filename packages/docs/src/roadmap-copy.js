/**
 * What each release on the roadmap is for, keyed by GitHub milestone title.
 *
 * The roadmap's structure is generated — one card per open milestone, counting that milestone's open
 * decisions — so it cannot drift from what the project is actually working on. Its prose is not, and this
 * file is why.
 *
 * A milestone already carries a `description`, and reusing it was the obvious move. It is the wrong text.
 * Those descriptions are written for contributors and say contributor things: one names "a migration
 * hangover from the Web Awesome fork", another points at `packages/tokens/libraries`. Rewriting them to
 * read publicly would take that framing away from the people who rely on it, so the milestones are left
 * alone and the consumer-facing copy lives here instead. Generated structure, curated prose.
 *
 * **Keyed by title, not by number.** A number is stable across a rename and a title is not, which looks
 * like the safer key until you consider what each failure does. Rename a milestone with title keys and its
 * card renders with no summary and the build warns by name — visibly wrong, one line to fix. Re-point a
 * milestone with number keys and the old copy silently reattaches to the new one, describing work that is
 * not being done. The first failure is loud and cheap; the second is quiet and wrong. This has already
 * happened once: the milestones were renamed from efforts (`Themes`, `Inspiration`, `Frameworks`) to
 * versions, and every card lost its summary and said so.
 *
 * **A milestone with no entry here still renders**, with its name and its open-question count and no
 * summary, and `remark-roadmap.js` warns during the build naming the milestone that needs copy. A new
 * milestone should put itself on the roadmap; it should just look unfinished until someone writes its copy.
 *
 * Every entry is `{ summary, criteria? }`. The summary is the release in a paragraph; `criteria` is a list
 * for the one release that needs one — `1.0.0`, whose whole meaning is the bar it has to clear, so the bar
 * is stated rather than implied. A summary that ends by promising a list has to supply one.
 *
 * Written to the same brief throughout: what this release changes for a consumer, and where something is
 * blocked or waiting, *why* — a reader who knows the reason can judge it, while a reader told only that it
 * is blocked has to take it on faith. No dates, and no claim about which release lands first.
 *
 * Backtick-delimited spans render as inline code, which is the one piece of markup this copy gets. A
 * sentence that names `<cs-input>` or `theme.json` should show it as code rather than as prose, and the
 * alternative — routing each string through the markdown parser — would let a stray character in curated
 * copy reshape the card around it.
 */
export const roadmapCopy = {
  '1.0.0': {
    summary:
      'The release that declares the component API stable: a version you can build on, where a breaking ' +
      'change waits for the next major and anything deprecated stays available through it. It is the one ' +
      'release on this page whose meaning is a bar rather than a subject, so the bar is stated — three ' +
      'things are true before the number is used.',
    criteria: [
      'Every component is marked stable. A component still marked experimental can change its API in a ' +
        'minor release, which is the opposite of what this version promises, so the ones that remain ' +
        'either settle or come out of the release.',
      'Every component carries its accessibility record — what has been reviewed, and what a consumer ' +
        'still has to do themselves. A component library cannot hand you an accessible page on its own, ' +
        'and the record is where that line is drawn per component rather than claimed once for all of them.',
      'The Inspiration library has shipped: a prescriptive set of patterns, screens and flows, composed ' +
        'from the components that already ship. The component reference tells you what `<cs-input>` does; ' +
        'Inspiration tells you what a sign-in screen built out of Cornerstone parts should look like, and ' +
        'publishes the reasoning next to it so you can tell when your case is genuinely different. It ' +
        'adds no new behaviour — every entry is components and utilities you already have.',
    ],
  },

  '1.1.0': {
    summary:
      'Cornerstone in a WordPress theme. What stands in the way is a safe path from the CSS the token ' +
      'build emits to `theme.json`, which is where a WordPress theme is expected to keep its palette, its ' +
      'type scale and its spacing. WordPress reads those values from that file rather than from a ' +
      'stylesheet, and the token build does not emit it — so today a theme would have to restate every ' +
      'value by hand, which is exactly the drift the token pipeline exists to prevent. The pipeline comes ' +
      'first; the theme follows it.',
  },

  '1.2.0': {
    summary:
      'Cornerstone in a Rails application, which is two problems rather than one. The asset pipeline has ' +
      'to serve the stylesheets and the element definitions the way it serves the rest of an app’s ' +
      'assets, fingerprinted and cached alongside them. And the `cs-*` elements and the native element ' +
      'styles have to arrive on a page with no JavaScript bundler in front of them, because a Rails app ' +
      'is entitled not to have one and a library that assumes otherwise is not usable there.',
  },

  '1.3.0': {
    summary:
      'Making a brand’s look something you configure rather than something you fork. One generator takes ' +
      'a brand’s knobs — its palette, its type scale, its shape — and emits the tokens that the ' +
      'components, the CSS utilities and the published token package all read, so retuning a colour or ' +
      'adding a third brand reaches every consumer from one place. The same work settles what the ' +
      'published token package guarantees, which is what tells you whether a token name is safe to build on.',
  },
};
