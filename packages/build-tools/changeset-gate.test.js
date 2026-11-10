import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { changesetVerdict, readDiff } from "./changeset-gate.js";

const packages = [
  "@cruglobal/cornerstone-components",
  "@cruglobal/cornerstone-design-system",
];

const patch = (name = "@cruglobal/cornerstone-components", bump = "patch") => ({
  path: ".changeset/a-change.md",
  content: `---\n'${name}': ${bump}\n---\n\nChanged: a thing.\n`,
});

/** A verdict for a diff of `files`, with nothing else going on unless `more` says so. */
const verdict = (files, more = {}) =>
  changesetVerdict({
    diff: { files, manifests: {}, ...more.diff },
    changesets: more.changesets ?? [],
    branch: more.branch ?? "feature",
    packages,
  });

const manifest = (before, after) => ({ before, after });

describe("changesetVerdict", () => {
  describe("a pull request that adds a changeset", () => {
    it("passes", () => {
      const result = verdict(
        ["packages/components/src/components/button/button.ts", patch().path],
        { changesets: [patch()] }
      );
      assert.equal(result.ok, true);
    });

    it("passes with double quotes and more than one package", () => {
      const content = `---\n"@cruglobal/cornerstone-components": minor\n'@cruglobal/cornerstone-design-system': major\n---\n\nAdded: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, true);
    });

    // Changesets reads the frontmatter as YAML, where `@` cannot start an unquoted key. A changeset like
    // this one would pass here, merge, and then fail `changeset version` on `main`.
    it("fails when a scoped package name is not quoted, which changesets cannot parse", () => {
      const content = `---\n@cruglobal/cornerstone-design-system: major\n---\n\nAdded: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /changesets cannot read/);
      assert.match(
        result.reason,
        /@cruglobal\/cornerstone-design-system: major/
      );
    });

    it("fails when the quotes around a package name do not match", () => {
      const content = `---\n'@cruglobal/cornerstone-components": patch\n---\n\nFixed: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /changesets cannot read/);
    });

    it("fails when there is no space after the colon, which YAML reads as part of the name", () => {
      for (const line of [
        "'@cruglobal/cornerstone-components':patch",
        "cornerstone-docs-site:patch",
      ]) {
        const content = `---\n${line}\n---\n\nFixed: a thing.\n`;
        const result = changesetVerdict({
          diff: { files: [".changeset/a.md"], manifests: {} },
          changesets: [{ path: ".changeset/a.md", content }],
          branch: "feature",
          packages: [...packages, "cornerstone-docs-site"],
        });
        assert.equal(result.ok, false, line);
        assert.match(result.reason, /changesets cannot read/, line);
      }
    });

    it("fails when one package is named twice", () => {
      const content = `---\n'@cruglobal/cornerstone-components': patch\n'@cruglobal/cornerstone-components': minor\n---\n\nFixed: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /twice/);
    });

    it("fails when the frontmatter is not at the top of the file", () => {
      const content = `Fixed: a thing.\n\n---\n'@cruglobal/cornerstone-components': patch\n---\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /names no package/);
    });

    it("passes an unquoted name that has no scope, which is plain YAML", () => {
      const content = `---\ncornerstone-docs-site: patch\n---\n\nFixed: a thing.\n`;
      const result = changesetVerdict({
        diff: { files: [".changeset/a.md"], manifests: {} },
        changesets: [{ path: ".changeset/a.md", content }],
        branch: "feature",
        packages: [...packages, "cornerstone-docs-site"],
      });
      assert.equal(result.ok, true);
    });

    it("passes with a comment line and a quoted bump, both of which changesets reads", () => {
      const content = `---\n# why this is a minor\n'@cruglobal/cornerstone-components': "minor"\n---\n\nAdded: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, true);
    });

    it("fails when a comment is the only thing in the frontmatter", () => {
      const content = `---\n# nothing to release\n---\n\nChanged: a thing.\n`;
      const result = verdict([".changeset/a.md"], {
        changesets: [{ path: ".changeset/a.md", content }],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /names no package/);
    });

    it("fails when the changeset is empty, as `changeset add --empty` writes it", () => {
      const empty = { path: ".changeset/empty.md", content: "---\n---\n" };
      const result = verdict(["CLAUDE.md", empty.path], {
        changesets: [empty],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /\.changeset\/empty\.md names no package/);
    });

    it("fails when the changeset names a bump and says nothing about it", () => {
      const silent = {
        path: ".changeset/silent.md",
        content: "---\n'@cruglobal/cornerstone-components': patch\n---\n\n",
      };
      const result = verdict([silent.path], { changesets: [silent] });
      assert.equal(result.ok, false);
      assert.match(result.reason, /\.changeset\/silent\.md has no description/);
    });

    it("fails on an empty changeset even beside a real one", () => {
      const empty = { path: ".changeset/empty.md", content: "---\n---\n" };
      const result = verdict([patch().path, empty.path], {
        changesets: [patch(), empty],
      });
      assert.equal(result.ok, false);
    });

    it("fails when the changeset names a package this workspace does not have", () => {
      const result = verdict([patch().path], {
        changesets: [patch("@cruglobal/cornerstone-componets")],
      });
      assert.equal(result.ok, false);
      assert.match(result.reason, /@cruglobal\/cornerstone-componets/);
    });

    it("fails when the bump is not patch, minor or major", () => {
      for (const bump of ["none", "huge", ""]) {
        const result = verdict([patch().path], {
          changesets: [patch(undefined, bump)],
        });
        assert.equal(result.ok, false, `bump "${bump}"`);
      }
    });

    it("fails, without throwing, on a frontmatter line that is not a package and a bump", () => {
      const result = verdict([".changeset/a.md"], {
        changesets: [
          { path: ".changeset/a.md", content: "---\nnonsense\n---\n" },
        ],
      });
      assert.equal(result.ok, false);
    });

    it("fails when the file has no frontmatter at all", () => {
      const result = verdict([".changeset/a.md"], {
        changesets: [
          { path: ".changeset/a.md", content: "Changed: a thing.\n" },
        ],
      });
      assert.equal(result.ok, false);
    });
  });

  describe("a pull request that adds none", () => {
    it("fails, and says so", () => {
      const result = verdict([
        "packages/components/src/components/button/button.ts",
      ]);
      assert.equal(result.ok, false);
      assert.match(result.reason, /adds no changeset/);
    });

    it("fails for a tooling-only change, which still takes a real bump", () => {
      assert.equal(verdict([".github/workflows/ci.yml"]).ok, false);
    });

    it("fails for an empty diff", () => {
      assert.equal(verdict([]).ok, false);
    });
  });

  describe("devDependencies", () => {
    it("never owe a changeset of their own, on any branch: the pull request owes one as usual", () => {
      const path = "packages/components/package.json";
      const result = verdict([path, "package-lock.json"], {
        diff: {
          manifests: {
            [path]: manifest(
              { devDependencies: { eslint: "^9.0.0" } },
              { devDependencies: { eslint: "^9.1.0" } }
            ),
          },
        },
      });
      assert.equal(result.ok, false);
      assert.equal(result.reason, "This pull request adds no changeset.");
    });
  });

  describe("a lockfile-only pull request", () => {
    it("passes with no changeset", () => {
      assert.equal(verdict(["package-lock.json"]).ok, true);
    });

    it("fails once anything else changed with the lockfile", () => {
      assert.equal(verdict(["package-lock.json", "package.json"]).ok, false);
      assert.equal(
        verdict([
          "package-lock.json",
          "packages/components/src/internal/watch.ts",
        ]).ok,
        false
      );
    });
  });

  describe("a Dependabot pull request", () => {
    const branch = "dependabot/npm_and_yarn/lit-3.4.0";

    it("passes with no changeset when only devDependencies moved", () => {
      const result = verdict(
        ["package-lock.json", "packages/components/package.json"],
        {
          branch,
          diff: {
            manifests: {
              "packages/components/package.json": manifest(
                {
                  dependencies: { lit: "^3.3.0" },
                  devDependencies: { eslint: "^9.0.0" },
                },
                {
                  dependencies: { lit: "^3.3.0" },
                  devDependencies: { eslint: "^9.1.0" },
                }
              ),
            },
          },
        }
      );
      assert.equal(result.ok, true);
    });

    for (const [path, field] of [
      ["packages/components/package.json", "dependencies"],
      ["packages/components/package.json", "peerDependencies"],
      ["packages/tokens/package.json", "dependencies"],
      ["packages/tokens/package.json", "peerDependencies"],
    ]) {
      it(`fails with no changeset when a ${field} range moved in ${path}`, () => {
        const result = verdict(["package-lock.json", path], {
          branch,
          diff: {
            manifests: {
              [path]: manifest(
                { [field]: { lit: "^3.3.0" } },
                { [field]: { lit: "^3.4.0" } }
              ),
            },
          },
        });
        assert.equal(result.ok, false);
        assert.match(result.reason, new RegExp(`${field} of ${path}`));
        assert.match(result.reason, /lit/);
      });
    }

    it("fails when a dependency was added or removed, not only when a range changed", () => {
      const path = "packages/components/package.json";
      const added = verdict([path], {
        branch,
        diff: {
          manifests: {
            [path]: manifest(
              { dependencies: {} },
              { dependencies: { lit: "^3" } }
            ),
          },
        },
      });
      const removed = verdict([path], {
        branch,
        diff: {
          manifests: { [path]: manifest({ dependencies: { lit: "^3" } }, {}) },
        },
      });
      assert.equal(added.ok, false);
      assert.equal(removed.ok, false);
    });

    it("passes that same change once it carries a changeset", () => {
      const path = "packages/components/package.json";
      const result = verdict(["package-lock.json", path, patch().path], {
        branch,
        changesets: [patch()],
        diff: {
          manifests: {
            [path]: manifest(
              { dependencies: { lit: "^3.3.0" } },
              { dependencies: { lit: "^3.4.0" } }
            ),
          },
        },
      });
      assert.equal(result.ok, true);
    });

    it("passes when the docs site's dependencies moved, since the site is not published", () => {
      const result = verdict(
        ["package-lock.json", "packages/docs/package.json"],
        {
          branch,
        }
      );
      assert.equal(result.ok, true);
    });
  });

  it("gives a reason with every verdict, for the job log", () => {
    for (const result of [verdict(["package-lock.json"]), verdict(["x"])]) {
      assert.equal(typeof result.reason, "string");
      assert.ok(result.reason.length > 0);
    }
  });
});

describe("readDiff", () => {
  const nameStatus = (...pairs) =>
    pairs.map(([status, path]) => `${status}\0${path}\0`).join("");

  it("lists every path the diff touches, whatever happened to it", () => {
    const { files } = readDiff(
      nameStatus(
        ["M", "packages/components/package.json"],
        ["A", "packages/components/src/new.ts"],
        ["D", "docs/old.md"]
      )
    );
    assert.deepEqual(files, [
      "packages/components/package.json",
      "packages/components/src/new.ts",
      "docs/old.md",
    ]);
  });

  it("counts a changeset the diff adds, and not one it edits or deletes", () => {
    const { files, addedChangesets } = readDiff(
      nameStatus(
        ["A", ".changeset/added.md"],
        ["M", ".changeset/edited.md"],
        ["D", ".changeset/deleted.md"]
      )
    );
    assert.deepEqual(addedChangesets, [".changeset/added.md"]);
    assert.equal(files.length, 3);
  });

  it("does not count the changeset README, the config, or a file in a folder below", () => {
    const { addedChangesets } = readDiff(
      nameStatus(
        ["A", ".changeset/README.md"],
        ["A", ".changeset/config.json"],
        ["A", ".changeset/drafts/later.md"]
      )
    );
    assert.deepEqual(addedChangesets, []);
  });

  it("keeps a path with a space or a non-ASCII character whole", () => {
    const { files } = readDiff(nameStatus(["A", "docs/a note é.md"]));
    assert.deepEqual(files, ["docs/a note é.md"]);
  });

  it("reads an empty diff as no files", () => {
    assert.deepEqual(readDiff(""), { files: [], addedChangesets: [] });
  });
});

// The gate reads changesets with its own few lines so that the job needs no install. That is only safe
// while it never passes a file the real parser throws on: such a file would merge and then stop
// `changeset version` on `main`. This runs both over every mix of the shapes below. The other direction
// is allowed: the gate may turn away a form changesets would read.
describe("the gate against @changesets/parse", () => {
  // Found through the CLI the root manifest declares, wherever npm hoisted it.
  const fromCli = createRequire(
    createRequire(import.meta.url).resolve("@changesets/cli/package.json")
  );
  const parse = fromCli("@changesets/parse").default;

  const names = [
    "'@cruglobal/cornerstone-components'",
    '"@cruglobal/cornerstone-components"',
    "'@cruglobal/cornerstone-components\"",
    "@cruglobal/cornerstone-components",
    "cornerstone-docs-site",
    "'cornerstone-docs-site'",
    "'it''s'",
    '"a\\"b"',
    "- cornerstone-docs-site",
    "? cornerstone-docs-site",
    "  cornerstone-docs-site",
    "[cornerstone-docs-site]",
    "*cornerstone-docs-site",
  ];
  const separators = [": ", ":", " : ", ":\t", " :", ":  "];
  const bumps = [
    "patch",
    "minor",
    "major",
    "none",
    '"patch"',
    "'minor'",
    "patch # why",
    "patch#why",
    "[patch]",
    "{}",
    "|",
    ">",
    "&a patch",
    "!!str patch",
    "",
    "Patch",
  ];
  const line = (name, separator, bump) => `${name}${separator}${bump}`;
  const frontmatters = [];
  for (const name of names) {
    for (const separator of separators) {
      for (const bump of bumps) {
        frontmatters.push(line(name, separator, bump));
      }
    }
  }
  const good = "'@cruglobal/cornerstone-components': patch";
  frontmatters.push(
    `${good}\n${good}`,
    `${good}\n"@cruglobal/cornerstone-components": minor`,
    `${good}\ncornerstone-docs-site: minor`,
    `# a comment\n${good}`,
    `${good}\n# a comment`,
    `${good}\n\n`,
    `${good}\n  nested: patch`,
    `${good}\n...`,
    `${good}\n---\n${good}`,
    `%YAML 1.2\n${good}`,
    `\t${good}`,
    `${good}\r`
  );
  const files = frontmatters.flatMap((frontmatter) => [
    `---\n${frontmatter}\n---\n\nFixed: a thing.\n`,
    `---\r\n${frontmatter}\r\n---\r\n\r\nFixed: a thing.\r\n`,
    `\n---\n${frontmatter}\n---\n\nFixed: a thing.\n`,
    `Fixed: a thing.\n\n---\n${frontmatter}\n---\n`,
    `---\n${frontmatter}\n---\nFixed: a thing.`,
    `---\n${frontmatter}\n--- \n\nFixed: a thing.\n`,
    `\uFEFF---\n${frontmatter}\n---\n\nFixed: a thing.\n`,
  ]);

  const everyPackage = [
    ...packages,
    "cornerstone-docs-site",
    "it's",
    'a"b',
    "nested",
  ];
  const gatePasses = (content) =>
    changesetVerdict({
      diff: { files: [".changeset/a.md"], manifests: {} },
      changesets: [{ path: ".changeset/a.md", content }],
      branch: "feature",
      packages: everyPackage,
    }).ok;
  const parses = (content) => {
    try {
      parse(content);
      return true;
    } catch {
      return false;
    }
  };

  it("never passes a changeset the real parser throws on", () => {
    const wronglyPassed = files.filter(
      (content) => gatePasses(content) && !parses(content)
    );
    assert.deepEqual(
      wronglyPassed.map((content) => JSON.stringify(content)),
      []
    );
  });

  it("agrees with the real parser on what a passing changeset releases", () => {
    for (const content of files.filter(gatePasses)) {
      const { releases, summary } = parse(content);
      assert.ok(releases.length > 0, JSON.stringify(content));
      assert.ok(summary.length > 0, JSON.stringify(content));
      for (const { type } of releases) {
        assert.match(type, /^(patch|minor|major)$/, JSON.stringify(content));
      }
    }
  });

  it("still passes the forms people write", () => {
    const written = files.filter(gatePasses).length;
    assert.ok(written > 30, `only ${written} of ${files.length} pass`);
    assert.equal(gatePasses(`---\n${good}\n---\n\nFixed: a thing.\n`), true);
  });
});
