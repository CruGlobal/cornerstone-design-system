/**
 * What a change reaches, and so which of CI's jobs have to run.
 *
 * `ci.yml` used to answer this in several places: two path-filter steps holding three copies of one path
 * list, an `if:` on each job, and two token jobs that asked nothing and ran on every pull request. Nothing
 * could test any of it. This module is the one place the answer is written. `affected()` takes facts and
 * returns decisions: it reads no git and calls no API, so `node --test` drives it with a list of paths.
 * The command at the bottom gathers the facts in the `changes` job, and each job in `ci.yml` reads one
 * field of the result: `if: fromJSON(needs.changes.outputs.gates).docs`.
 *
 * A gate that is false skips its job, and `CI gate` counts a skipped job as passed. So a rule here that is
 * wrong in the "false" direction lets an untested change merge. When in doubt a rule answers true.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { repoDir } from "./workspace.js";

/**
 * Paths every package depends on: the shared build modules, the root manifest and lockfile that decide
 * what is installed, the Node version, and the workflow that runs the gates.
 */
const EVERY_PACKAGE = [
  "packages/build-tools/",
  "package.json",
  "package-lock.json",
  ".tool-versions",
  ".github/workflows/ci.yml",
];

/**
 * Which paths reach which package's gate. A trailing slash is a directory and everything under it; anything
 * else is that one file.
 *
 * The dependency runs one way, and the lists mirror it: the documentation site renders the component
 * library, so a component change reaches `docs`, but a docs page cannot change a component.
 */
const REACHES = {
  tokens: ["packages/tokens/", ...EVERY_PACKAGE],
  components: ["packages/components/", ...EVERY_PACKAGE],
  docs: ["packages/docs/", "packages/components/", ...EVERY_PACKAGE],
};

const reaches = (file, paths) =>
  paths.some((path) =>
    path.endsWith("/") ? file.startsWith(path) : file === path
  );

/**
 * A glossary, a CLAUDE.md or a skill reference cannot change how a component behaves in a browser. The
 * static gate still runs prettier, cspell and the skill checks on it.
 */
const isMarkdown = (file) => file.endsWith(".md");

/**
 * The release pull request exists to consume changesets, so it has none of its own. Dependabot is not
 * excused here: most of its pull requests owe nothing, but one that moves a published runtime dependency
 * does, and `changeset-gate.js` is what tells them apart.
 */
const RELEASE_BRANCH = "changeset-release/main";

/**
 * @param {object} facts
 * @param {string[] | null} facts.changedFiles Repo-relative paths the change touches. `null` when the diff
 *   could not be read, which opens every path gate.
 * @param {string} facts.event The workflow event: `pull_request` or `push`.
 * @param {string} facts.branch The pull request's head branch, or the pushed branch.
 * @returns {{ gates: { tokens: boolean, components: boolean, browser: boolean, docs: boolean, changeset: boolean } }}
 *   `tokens`, `components` and `docs` are each package's own gate. `browser` is the component suite in
 *   three engines, which is the expensive one and so has the narrower rule. `changeset` is whether
 *   `changeset-gate.js` has anything to judge.
 */
export function affected({ changedFiles, event, branch }) {
  const any = (test) => changedFiles === null || changedFiles.some(test);

  return {
    gates: {
      tokens: any((file) => reaches(file, REACHES.tokens)),
      components: any((file) => reaches(file, REACHES.components)),
      browser: any(
        (file) => reaches(file, REACHES.components) && !isMarkdown(file)
      ),
      docs: any((file) => reaches(file, REACHES.docs)),
      changeset: event === "pull_request" && branch !== RELEASE_BRANCH,
    },
  };
}

/**
 * The Playwright version the lockfile resolved, which is also the tag of the container image the browser
 * jobs run in. Reading it here is what keeps the image and the package from disagreeing: a mismatch fails
 * at launch with "Executable doesn't exist".
 *
 * @param {{ packages?: Record<string, { version?: string }> }} lockfile The parsed `package-lock.json`.
 */
export function playwrightVersion(lockfile) {
  const version = lockfile.packages?.["node_modules/playwright"]?.version;
  if (!version) {
    throw new Error("package-lock.json has no `playwright` entry.");
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `package-lock.json's playwright version is not a release version: ${JSON.stringify(
        version
      )}`
    );
  }
  const others = Object.entries(lockfile.packages)
    .filter(([path]) => path.endsWith("/node_modules/playwright"))
    .filter(([, entry]) => entry.version !== version)
    .map(([path, entry]) => `${path} (${entry.version})`);
  if (others.length > 0) {
    throw new Error(
      `package-lock.json resolves more than one playwright version: ${version} at the root and ${others.join(
        ", "
      )}. One image cannot hold the browsers for both.`
    );
  }
  return version;
}

/**
 * The paths that differ between `base` and the checked-out commit, or `null` when git cannot say: a shallow
 * clone that does not hold `base`, or a first push with no commit before it.
 */
function changedSince(base) {
  try {
    const out = execFileSync(
      "git",
      // `-z` because git otherwise quotes and escapes a path with a non-ASCII character in it, and a
      // quoted path matches no rule.
      ["diff", "--name-only", "--no-renames", "-z", base, "HEAD", "--"],
      { cwd: repoDir(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return out.split("\0").filter(Boolean);
  } catch (error) {
    console.error(
      `Could not diff against "${base}", so every gate is open.\n${
        error.stderr || error.message
      }`
    );
    return null;
  }
}

/**
 * `node affected.js --base <commit>` prints the two outputs the `changes` job publishes, as
 * `name=value` lines for `$GITHUB_OUTPUT`. What it decided, and from which files, goes to stderr for the
 * job log.
 */
function main() {
  const base = process.argv[process.argv.indexOf("--base") + 1];
  if (!process.argv.includes("--base") || !base) {
    console.error("Usage: node affected.js --base <commit>");
    process.exitCode = 2;
    return;
  }

  const changedFiles = changedSince(base);
  const { gates } = affected({
    changedFiles,
    event: process.env.GITHUB_EVENT_NAME ?? "",
    branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "",
  });
  const lockfile = JSON.parse(
    readFileSync(join(repoDir(), "package-lock.json"), "utf8")
  );

  if (changedFiles) {
    console.error(
      `${changedFiles.length} changed file(s) since ${base}:\n${changedFiles
        .map((file) => `  ${file}`)
        .join("\n")}`
    );
  }
  console.error(
    Object.entries(gates)
      .map(([gate, open]) => `${gate}: ${open ? "run" : "skip"}`)
      .join("\n")
  );

  console.log(`gates=${JSON.stringify(gates)}`);
  console.log(`playwright=${playwrightVersion(lockfile)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
