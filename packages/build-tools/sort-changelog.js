/**
 * Groups each release in a package's `CHANGELOG.md` by category, right after `changeset version` writes it.
 *
 * changesets groups a release by bump level, `### Minor Changes` and `### Patch Changes`, so an addition
 * and a fix sit side by side in both groups. Its changelog hook formats one entry at a time and never sees
 * a release whole, so the regrouping is a step of its own in the root `npm run version`, which
 * changesets/action runs. Everything downstream reads the file this leaves: the release pull request, the
 * GitHub release, the published package and the docs changelog.
 *
 * Each entry moves as a unit, its `- ` line and every continuation line under it, to one `### <label>`
 * heading per category the release uses, in `CATEGORIES` order and keeping its order within the category.
 * Its `Fixed:` prefix comes off, since the heading now says it; a nested bullet keeps its own. An entry
 * that declares no category goes last, under `### Other changes`.
 *
 * Only a release still in bump-level form is rewritten. Running this twice changes nothing, and a release
 * already grouped, or in a shape changesets would not write, is left exactly as it is.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, declaredCategory } from "./changelog-categories.js";
import { repoDir } from "./workspace.js";

const BUMP_HEADING = /^### (?:Major|Minor|Patch) Changes\s*$/;

const OTHER_CHANGES = "Other changes";

/**
 * What `@changesets/changelog-github` writes ahead of the summary: the pull request, the commit and the
 * thanks, each optional, then ` - `. The category prefix starts after it.
 */
const ATTRIBUTION =
  /^- ((?:\[#\d+\]\([^)]*\)\s*)?(?:\[`[0-9a-f]+`\]\([^)]*\)\s*)?(?:Thanks .*?!\s*)?)- /;

const isBlank = (line) => line.trim() === "";

function withoutTrailingBlankLines(lines) {
  let end = lines.length;

  while (end > 0 && isBlank(lines[end - 1])) {
    end -= 1;
  }

  return lines.slice(0, end);
}

/** A release's entries, each as its lines, or `null` when the release is not in bump-level form. */
function bumpLevelEntries(body) {
  const entries = [];
  let entry = null;
  let bumpLevel = false;

  for (const line of body) {
    if (/^#{1,6}\s/.test(line)) {
      if (!BUMP_HEADING.test(line)) {
        return null;
      }

      bumpLevel = true;
      entry = null;
    } else if (line.startsWith("- ")) {
      entry = [line];
      entries.push(entry);
    } else if (entry) {
      entry.push(line);
    } else if (!isBlank(line)) {
      return null;
    }
  }

  return bumpLevel ? entries.map(withoutTrailingBlankLines) : null;
}

/** An entry with its category prefix removed, and the category it declared (`null` for none). */
function categorise([first, ...rest]) {
  const attribution = ATTRIBUTION.exec(first);
  const head = attribution?.[1] ? attribution[0] : "- ";
  const declared = declaredCategory(first.slice(head.length));

  return declared
    ? {
        name: declared.name,
        lines: [(head + declared.rest).trimEnd(), ...rest],
      }
    : { name: null, lines: [first, ...rest] };
}

/** One release, grouped by category, or `null` to leave it as it is. */
function groupRelease([heading, ...body]) {
  const entries = bumpLevelEntries(body);

  if (!entries) {
    return null;
  }

  const groups = new Map(
    [...Object.keys(CATEGORIES), null].map((name) => [name, []])
  );

  for (const entry of entries) {
    const { name, lines } = categorise(entry);
    groups.get(name).push(lines);
  }

  const lines = [heading, ""];

  for (const [name, grouped] of groups) {
    if (grouped.length) {
      lines.push(`### ${name ? CATEGORIES[name].label : OTHER_CHANGES}`, "");
      grouped.forEach((entry) => lines.push(...entry, ""));
    }
  }

  return withoutTrailingBlankLines(lines);
}

/** A whole `CHANGELOG.md`, with every release still in bump-level form grouped by category instead. */
export function sortChangelog(markdown) {
  const sections = [[]];

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      sections.push([]);
    }

    sections.at(-1).push(line);
  }

  const [preamble, ...releases] = sections;

  return [
    preamble,
    ...releases.map((release) => {
      const grouped = groupRelease(release);
      const content = withoutTrailingBlankLines(release);

      // The blank lines after a release are what separate it from the next, so they stay as they were.
      return grouped ? [...grouped, ...release.slice(content.length)] : release;
    }),
  ]
    .flat()
    .join("\n");
}

/** Every package's `CHANGELOG.md`, found rather than listed, so a package that starts releasing is included. */
function changelogs() {
  const packagesDir = join(repoDir(), "packages");

  return readdirSync(packagesDir)
    .map((name) => join(packagesDir, name, "CHANGELOG.md"))
    .filter((path) => existsSync(path));
}

function main() {
  for (const path of changelogs()) {
    const before = readFileSync(path, "utf8");
    const after = sortChangelog(before);

    if (after !== before) {
      writeFileSync(path, after);
      console.log(`Grouped ${relative(repoDir(), path)} by category.`);
    }
  }
}

function isRunAsMain() {
  if (import.meta.url.startsWith("file:")) {
    return process.argv[1] === fileURLToPath(import.meta.url);
  }
  return false;
}

if (isRunAsMain()) {
  main();
}
