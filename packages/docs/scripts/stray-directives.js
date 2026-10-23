/**
 * Whether a built page shows a `:::` directive to the reader as text.
 *
 * A directive the remark plugins did not handle reaches the page as its literal `:::name` line. Prose that
 * talks about a directive puts it in inline code or a code block, so `:::` inside `<code>` or `<pre>` is
 * the page quoting the syntax, not failing to render it. The changelog does exactly that whenever an entry
 * names a callout, and those entries come from `CHANGELOG.md`, which changesets writes and nobody edits.
 */
export function hasStrayDirective(html) {
  return html
    .replace(/<pre[\s>][\s\S]*?<\/pre>/g, '')
    .replace(/<code[\s>][\s\S]*?<\/code>/g, '')
    .includes(':::');
}
