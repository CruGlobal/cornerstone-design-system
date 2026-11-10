import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { changesetVerdict } from "./changeset-gate.js";

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
