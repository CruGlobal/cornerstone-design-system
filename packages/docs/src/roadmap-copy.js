/**
 * What each effort on the roadmap means for someone *using* Cornerstone, keyed by GitHub milestone title.
 *
 * The roadmap's structure is generated — one card per open milestone, counting that milestone's open
 * decisions — so it cannot drift from what the project is actually working on. Its prose is not, and this
 * file is why.
 *
 * A milestone already carries a `description`, and reusing it was the obvious move. It is the wrong text.
 * Those descriptions are written for contributors and say contributor things: Themes' names "a migration
 * hangover from the Web Awesome fork", Frameworks' points at `packages/tokens/libraries`. Rewriting them
 * to read publicly would take that framing away from the people who rely on it, so the milestones are left
 * alone and the consumer-facing sentence lives here instead. Generated structure, curated prose.
 *
 * **Keyed by title, not by number.** A number is stable across a rename and a title is not, which looks
 * like the safer key until you consider what each failure does. Rename a milestone with title keys and its
 * effort renders with no summary and the build warns by name — visibly wrong, one line to fix. Repurpose a
 * milestone with number keys — retitle `Frameworks` to something else, which is a thing that happens to a
 * milestone nobody has started — and the old prose silently reattaches to the new effort, describing work
 * that is not being done. The first failure is loud and cheap; the second is quiet and wrong.
 *
 * **A milestone with no entry here still renders**, with its name and its open-decision count and no
 * summary, and `remark-roadmap.js` warns during the build naming the milestone that needs copy. A new
 * milestone should put itself on the roadmap; it should just look unfinished until someone writes its
 * sentence.
 *
 * Every summary is written to the same brief: what this effort changes for a consumer, in the present
 * tense about the problem and the future tense about the answer, and where an effort waits on another one,
 * *why* it waits — a reader who knows the reason can judge the wait, while a reader told only that it
 * waits has to take it on faith.
 *
 * Backtick-delimited spans render as inline code, which is the one piece of markup a summary gets. A
 * sentence that names `<cs-input>` or `cs-*` should show it as code rather than as prose, and the
 * alternative — routing each summary through the markdown parser — would let a stray character in curated
 * copy reshape the card around it.
 */
export const roadmapCopy = {
  Themes:
    'Making a brand’s look something you configure rather than something you fork. One generator will ' +
    'take a brand’s knobs — its palette, its type scale, its shape — and emit the tokens that the ' +
    'components, the CSS utilities and the published token package all read, so retuning a colour or ' +
    'adding a third brand reaches every consumer from one place. The same effort settles what the ' +
    'published token package guarantees, which is what tells you whether a token name is safe to build on.',

  Inspiration:
    'A prescriptive library of patterns, screens and flows, composed from the components that already ' +
    'ship. The component reference tells you what `<cs-input>` does; this will tell you what a sign-in ' +
    'screen built out of Cornerstone parts should look like, and publish the reasoning next to it so you ' +
    'can tell when your case is genuinely different. It adds no new behaviour — every entry is components ' +
    'and utilities you already have.',

  Frameworks:
    'Cornerstone for teams that are not adopting the `cs-*` components: the native element styles and the ' +
    'CSS utilities, the adapters that hand Cornerstone’s tokens to a component library you already ' +
    'use (MUI and DaisyUI today), and the React wrappers. It waits on Themes, because an adapter is only ' +
    'as stable as the token contract it reads — building one against a contract that is still being ' +
    'decided means rebuilding it.',
};
