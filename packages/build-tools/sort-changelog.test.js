import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { headingCategory } from "./changelog-categories.js";
import { sortChangelog } from "./sort-changelog.js";

/** The attribution `@changesets/changelog-github` writes ahead of a summary. */
const by = (pr) =>
  `[#${pr}](https://github.com/o/r/pull/${pr}) [\`abc${pr}\`](https://github.com/o/r/commit/abc${pr}) Thanks [@u](https://github.com/u)! - `;

const lines = (...rows) => rows.join("\n");

describe("sortChangelog", () => {
  it("groups a release's entries by category, in category order, across bump levels", () => {
    const before = lines(
      "# pkg",
      "",
      "## 1.1.0",
      "",
      "### Minor Changes",
      "",
      `- ${by(1)}Added: a thing.`,
      "",
      `- ${by(2)}Fixed: a bug.`,
      "",
      "### Patch Changes",
      "",
      `- ${by(3)}Fixed: another bug.`,
      "",
      `- ${by(4)}Changed: a tidy-up.`,
      "",
      `- ${by(5)}Breaking: a removal.`,
      "",
      `- ${by(6)}Added: another thing.`,
      ""
    );

    assert.equal(
      sortChangelog(before),
      lines(
        "# pkg",
        "",
        "## 1.1.0",
        "",
        "### Breaking",
        "",
        `- ${by(5)}a removal.`,
        "",
        "### Added",
        "",
        `- ${by(1)}a thing.`,
        "",
        `- ${by(6)}another thing.`,
        "",
        "### Changed",
        "",
        `- ${by(4)}a tidy-up.`,
        "",
        "### Fixed",
        "",
        `- ${by(2)}a bug.`,
        "",
        `- ${by(3)}another bug.`,
        ""
      )
    );
  });

  it("moves an entry with its continuation lines, and leaves a nested bullet's prefix alone", () => {
    const entry = [
      `- ${by(7)}Added: a roadmap page.`,
      "",
      "  A paragraph under it.",
      "",
      "  - A nested point",
      "  - Fixed: a nested fix, which belongs to the entry above it",
    ];

    const sorted = sortChangelog(
      lines(
        "## 1.0.1",
        "",
        "### Patch Changes",
        "",
        `- ${by(8)}Fixed: a bug.`,
        "",
        ...entry,
        ""
      )
    );

    assert.equal(
      sorted,
      lines(
        "## 1.0.1",
        "",
        "### Added",
        "",
        `- ${by(7)}a roadmap page.`,
        ...entry.slice(1),
        "",
        "### Fixed",
        "",
        `- ${by(8)}a bug.`,
        ""
      )
    );
  });

  it("puts entries that declare no category last, in their original order, without guessing", () => {
    const sorted = sortChangelog(
      lines(
        "## 0.2.0",
        "",
        "### Minor Changes",
        "",
        `- ${by(9)}Add a token tree.`,
        "",
        "### Patch Changes",
        "",
        `- ${by(10)}Fix version script.`,
        "",
        `- ${by(11)}Fixed: a declared fix.`,
        ""
      )
    );

    assert.equal(
      sorted,
      lines(
        "## 0.2.0",
        "",
        "### Fixed",
        "",
        `- ${by(11)}a declared fix.`,
        "",
        "### Other changes",
        "",
        `- ${by(9)}Add a token tree.`,
        "",
        `- ${by(10)}Fix version script.`,
        ""
      )
    );
  });

  it("gives a release with one category one heading, and reads an entry with no attribution", () => {
    const sorted = sortChangelog(
      lines(
        "## 0.6.2",
        "",
        "### Patch Changes",
        "",
        "- Fixed: one.",
        "",
        "- fixed: two.",
        ""
      )
    );

    assert.equal(
      sorted,
      lines("## 0.6.2", "", "### Fixed", "", "- one.", "", "- two.", "")
    );
  });

  it("changes nothing on a second run, or in a release that is empty or not in bump-level form", () => {
    const changelog = lines(
      "# pkg",
      "",
      "## 2.0.0",
      "",
      "### Minor Changes",
      "",
      `- ${by(12)}Added: new.`,
      "",
      "### Patch Changes",
      "",
      `- ${by(13)}Fixed: old.`,
      "",
      "## 1.0.1",
      "",
      "## 1.0.0",
      "",
      "### Patch Changes",
      "",
      "Prose changesets would not write.",
      "",
      `- ${by(14)}Fixed: kept where it is.`,
      ""
    );

    const once = sortChangelog(changelog);

    assert.equal(sortChangelog(once), once);
    assert.equal(
      once,
      changelog.replace(
        lines(
          "### Minor Changes",
          "",
          `- ${by(12)}Added: new.`,
          "",
          "### Patch Changes",
          "",
          `- ${by(13)}Fixed: old.`
        ),
        lines(
          "### Added",
          "",
          `- ${by(12)}new.`,
          "",
          "### Fixed",
          "",
          `- ${by(13)}old.`
        )
      )
    );
  });

  it("writes headings the docs changelog maps back to their category", () => {
    const sorted = sortChangelog(
      lines(
        "## 1.0.0",
        "",
        "### Patch Changes",
        "",
        "- Deprecated: a.",
        "",
        "- b.",
        ""
      )
    );
    const headings = sorted.match(/^### .*$/gm).map((line) => line.slice(4));

    assert.deepEqual(headings.map(headingCategory), ["deprecated", null]);
  });
});
