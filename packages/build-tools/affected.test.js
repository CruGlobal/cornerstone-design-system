import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { affected, playwrightVersion } from "./affected.js";

/** The gates for a pull request from an ordinary branch that changed `files`. */
const gatesFor = (...files) =>
  affected({ changedFiles: files, event: "pull_request", branch: "feature" })
    .gates;

describe("affected", () => {
  describe("tokens", () => {
    it("opens for a token source change", () => {
      assert.equal(
        gatesFor("packages/tokens/tokens/sys/color.json").tokens,
        true
      );
    });

    it("stays shut for a component change", () => {
      assert.equal(
        gatesFor("packages/components/src/components/button/button.ts").tokens,
        false
      );
    });
  });

  describe("components", () => {
    it("opens for anything in the component package, Markdown included", () => {
      assert.equal(
        gatesFor("packages/components/GLOSSARY.md").components,
        true
      );
    });

    it("opens for a Claude Code plugin, whose pages the docs-URL check reads", () => {
      assert.equal(
        gatesFor("plugins/cornerstone/agents/daniel.md").components,
        true
      );
      assert.equal(
        gatesFor("plugins/cornerstone/plugin.json").components,
        true
      );
    });

    it("stays shut for a docs page", () => {
      assert.equal(
        gatesFor("packages/docs/src/content/docs/components/button.mdx")
          .components,
        false
      );
    });
  });

  describe("browser", () => {
    it("opens for component code", () => {
      assert.equal(
        gatesFor("packages/components/src/components/button/button.ts").browser,
        true
      );
    });

    it("stays shut when every component change is Markdown", () => {
      assert.equal(
        gatesFor(
          "packages/components/GLOSSARY.md",
          "packages/components/CLAUDE.md"
        ).browser,
        false
      );
    });

    it("opens when code changed alongside Markdown", () => {
      assert.equal(
        gatesFor(
          "packages/components/GLOSSARY.md",
          "packages/components/src/internal/watch.ts"
        ).browser,
        true
      );
    });

    it("stays shut for a plugin, which no component loads", () => {
      assert.equal(gatesFor("plugins/cornerstone/plugin.json").browser, false);
    });

    it("stays shut for code outside what the suite loads", () => {
      assert.equal(
        gatesFor("packages/docs/scripts/check-a11y.js").browser,
        false
      );
      assert.equal(gatesFor("packages/tokens/build.mjs").browser, false);
    });
  });

  describe("docs", () => {
    it("opens for a docs page", () => {
      assert.equal(
        gatesFor("packages/docs/src/content/docs/components/button.mdx").docs,
        true
      );
    });

    it("opens for a component change, because the site renders the library", () => {
      assert.equal(
        gatesFor("packages/components/src/components/button/button.ts").docs,
        true
      );
    });

    it("stays shut for a token change", () => {
      assert.equal(
        gatesFor("packages/tokens/tokens/sys/color.json").docs,
        false
      );
    });
  });

  describe("files every package depends on", () => {
    for (const file of [
      "package.json",
      "package-lock.json",
      ".npmrc",
      ".tool-versions",
      ".github/workflows/ci.yml",
      "packages/build-tools/site-url.js",
      // A workspace no rule names yet. One `npm ci` installs every workspace, so it changes every job.
      "packages/a-new-package/package.json",
    ]) {
      it(`${file} opens every path gate`, () => {
        const { tokens, components, browser, docs } = gatesFor(file);
        assert.deepEqual(
          { tokens, components, browser, docs },
          { tokens: true, components: true, browser: true, docs: true }
        );
      });
    }

    it("matches whole path segments, not prefixes", () => {
      const { tokens, components, browser, docs } = gatesFor(
        "packages/components-archive/x.ts",
        "packages/docs/package.json.bak",
        "package.json.orig"
      );
      assert.deepEqual(
        { tokens, components, browser, docs },
        { tokens: false, components: false, browser: false, docs: true }
      );
    });
  });

  describe("a change no gate covers", () => {
    it("opens no path gate", () => {
      const { tokens, components, browser, docs } = gatesFor(
        "CLAUDE.md",
        ".changeset/x.md",
        "docs/standards/testing.md",
        ".github/workflows/release.yml"
      );
      assert.deepEqual(
        { tokens, components, browser, docs },
        { tokens: false, components: false, browser: false, docs: false }
      );
    });

    it("opens no path gate for an empty diff", () => {
      const { tokens, components, browser, docs } = gatesFor();
      assert.deepEqual(
        { tokens, components, browser, docs },
        { tokens: false, components: false, browser: false, docs: false }
      );
    });
  });

  describe("when the diff could not be read", () => {
    it("opens every path gate, so an unknown change is a tested one", () => {
      const { gates } = affected({
        changedFiles: null,
        event: "push",
        branch: "main",
      });
      assert.deepEqual(gates, {
        tokens: true,
        components: true,
        browser: true,
        docs: true,
        changeset: false,
      });
    });
  });

  describe("changeset", () => {
    const changeset = (event, branch) =>
      affected({ changedFiles: [], event, branch }).gates.changeset;

    it("opens for a pull request", () => {
      assert.equal(changeset("pull_request", "feature"), true);
    });

    it("stays shut on a push, which has no pull request to hold one", () => {
      assert.equal(changeset("push", "main"), false);
    });

    it("stays shut for the release pull request, which exists to consume them", () => {
      assert.equal(changeset("pull_request", "changeset-release/main"), false);
    });

    it("opens for Dependabot, whose pull requests can owe one", () => {
      assert.equal(
        changeset("pull_request", "dependabot/npm_and_yarn/qs-6.17.1"),
        true
      );
    });
  });

  // What CI actually ran on the last 30 pull requests merged before this module replaced the path
  // filters in `ci.yml`: each one's changed files and which jobs were not skipped. The module has to
  // reach the verdicts the workflow reached. The changeset job is left out: it used to skip Dependabot
  // outright and now runs to judge it, which `changeset-gate.test.js` covers.
  describe("replays the 30 pull requests merged before it existed", () => {
    const replay = JSON.parse(
      readFileSync(
        new URL("./fixtures/affected-replay.json", import.meta.url),
        "utf8"
      )
    );

    it("has all 30", () => {
      assert.equal(replay.length, 30);
    });

    for (const { pr, branch, files, ran } of replay) {
      it(`#${pr} (${branch})`, () => {
        const { components, browser, docs } = affected({
          changedFiles: files,
          event: "pull_request",
          branch,
        }).gates;
        assert.deepEqual(
          { components, browser, docs },
          { components: ran.components, browser: ran.browser, docs: ran.docs }
        );
      });
    }
  });
});

// `ci.yml` names each gate as a bare string. One it misspells reads as null, the job skips, and `CI gate`
// counts a skipped job as passed.
describe("ci.yml", () => {
  const JOB_ID = /^  ([a-z0-9-]+):$/gm;
  const workflow = readFileSync(
    new URL("../../.github/workflows/ci.yml", import.meta.url),
    "utf8"
  );
  const read = [
    ...workflow.matchAll(
      /^\s+if: fromJSON\(needs\.changes\.outputs\.gates\)\.(\S+)$/gm
    ),
  ].map(([, gate]) => gate);
  const gates = Object.keys(
    affected({ changedFiles: [], event: "push", branch: "main" }).gates
  );

  it("reads each gate affected() returns exactly once, and no other", () => {
    assert.deepEqual([...read].sort(), [...gates].sort());
  });

  it("gives every job but the first and the last a gate", () => {
    const jobs = [
      ...workflow.slice(workflow.indexOf("\njobs:\n")).matchAll(JOB_ID),
    ].map(([, job]) => job);
    assert.equal(jobs.length, read.length + 2, `jobs: ${jobs.join(", ")}`);
  });

  // A job `gate` does not need can fail and `CI gate`, the one check branch protection requires, still
  // passes.
  it("makes the gate job need every other job", () => {
    const jobsBlock = workflow.slice(workflow.indexOf("\njobs:\n"));
    const jobs = [...jobsBlock.matchAll(JOB_ID)].map(([, job]) => job);
    const needs = /^  gate:\n(?:.*\n)*?    needs:\n((?:      - .+\n)+)/m.exec(
      jobsBlock
    );
    assert.ok(needs, "the gate job has a needs list");
    assert.deepEqual(
      [...needs[1].matchAll(/- ([a-z0-9-]+)/g)].map(([, job]) => job).sort(),
      jobs.filter((job) => job !== "gate").sort()
    );
  });
});

describe("playwrightVersion", () => {
  it("reads the version the lockfile resolved", () => {
    const lockfile = {
      packages: { "node_modules/playwright": { version: "1.55.1" } },
    };
    assert.equal(playwrightVersion(lockfile), "1.55.1");
  });

  it("refuses a lockfile with no Playwright in it, which would name an image that does not exist", () => {
    assert.throws(
      () => playwrightVersion({ packages: {} }),
      /no `playwright` entry/
    );
  });

  it("refuses a lockfile that resolves a second, different Playwright under one package", () => {
    const lockfile = {
      packages: {
        "node_modules/playwright": { version: "1.55.1" },
        "packages/docs/node_modules/playwright": { version: "1.56.0" },
      },
    };
    assert.throws(
      () => playwrightVersion(lockfile),
      /more than one playwright version.*packages\/docs\/node_modules\/playwright \(1\.56\.0\)/
    );
  });

  it("refuses a version that is not a plain release, since it becomes part of an image tag", () => {
    const lockfile = {
      packages: { "node_modules/playwright": { version: "1.55.1\nx=y" } },
    };
    assert.throws(() => playwrightVersion(lockfile), /not a release version/);
  });
});

// The script itself, for the one branch `affected()` cannot reach: git failing to produce the diff.
describe("node affected.js", () => {
  const script = fileURLToPath(new URL("./affected.js", import.meta.url));
  const run = (...args) =>
    spawnSync(process.execPath, [script, ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_EVENT_NAME: "push",
        GITHUB_HEAD_REF: "",
        GITHUB_REF_NAME: "main",
      },
    });

  it("opens every path gate, and still succeeds, when git cannot diff against the base", () => {
    const { status, stdout, stderr } = run("--base", "0".repeat(40));
    assert.equal(status, 0, stderr);
    assert.match(stderr, /every gate is open/);

    const gates = JSON.parse(/^gates=(.+)$/m.exec(stdout)[1]);
    assert.deepEqual(gates, {
      tokens: true,
      components: true,
      browser: true,
      docs: true,
      changeset: false,
    });
    assert.match(stdout, /^playwright=\d+\.\d+\.\d+$/m);
  });

  it("exits 2 with a usage line when --base is missing", () => {
    const { status, stderr } = run();
    assert.equal(status, 2);
    assert.match(stderr, /Usage: node affected\.js --base <commit>/);
  });
});
