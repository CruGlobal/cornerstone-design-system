/**
 * Whether a pull request carries the changeset it owes.
 *
 * The rule is the root `CLAUDE.md`'s Changeset Rules, as code. CI used to install the whole workspace to
 * run `npx changeset status`, which answered a weaker question: it accepted an empty changeset, and it
 * never looked at the two kinds of pull request that take none. `changesetVerdict()` takes the facts and
 * returns a verdict with the reason, so every clause has a test.
 *
 * Changeset files are read with `@changesets/parse`, the parser `changeset version` itself uses, so a file
 * this gate passes is one the release can read. A parser written here would have to match YAML exactly, and
 * each gap would be a changeset that merges and then stops the release on `main`.
 *
 * `npx changeset status --since=origin/main` is still the closest local check, and `npx changeset` is how
 * to add one.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import parseChangeset from "@changesets/parse";
import { repoDir } from "./workspace.js";

/**
 * The manifests whose runtime dependency ranges a consumer installs. A moved range here changes what they
 * get, so it takes a changeset whoever opened the pull request. The docs site and these build tools are
 * never published.
 */
const PUBLISHED_MANIFESTS = [
  "packages/components/package.json",
  "packages/tokens/package.json",
];
const RUNTIME_FIELDS = ["dependencies", "peerDependencies"];
// Changesets also accepts "none". It releases nothing, which is an empty changeset by another name.
const BUMPS = ["patch", "minor", "major"];

// The package is CommonJS with a `default` export, which Node hands to an ES module one level down.
const parse = parseChangeset.default ?? parseChangeset;

/** What is wrong with one added changeset file, or `null` when it records a real bump. */
function changesetProblem({ path, content }, packages) {
  let changeset;
  try {
    changeset = parse(content);
  } catch (error) {
    return `${path} is not a changeset that changesets can read. ${
      error.message.split("\n")[0]
    }`;
  }
  const { releases, summary } = changeset;
  if (releases.length === 0) {
    return `${path} names no package. Every pull request takes a real bump and a description, never an empty changeset.`;
  }
  if (summary.replace(/-/g, "").trim() === "") {
    return `${path} has no description. Say what changed, starting with its category, such as "Fixed:".`;
  }
  for (const { name, type } of releases) {
    if (!packages.includes(name)) {
      return `${path} names "${name}", which is not a package in this workspace.`;
    }
    if (!BUMPS.includes(type)) {
      return `${path} gives "${name}" the bump "${type}". It has to be patch, minor or major.`;
    }
  }
  return null;
}

/** The runtime dependency ranges that differ between two versions of a manifest, as readable phrases. */
function movedRuntimeRanges(path, { before, after }) {
  const moved = [];
  for (const field of RUNTIME_FIELDS) {
    const was = before?.[field] ?? {};
    const is = after?.[field] ?? {};
    const names = [...new Set([...Object.keys(was), ...Object.keys(is)])];
    const changed = names.filter((name) => was[name] !== is[name]).sort();
    if (changed.length > 0) {
      moved.push(`${changed.join(", ")} in ${field} of ${path}`);
    }
  }
  return moved;
}

/**
 * @param {object} facts
 * @param {object} facts.diff The pull request's own diff against its base.
 * @param {string[]} facts.diff.files Every path it touches.
 * @param {Record<string, { before: object | null, after: object | null }>} facts.diff.manifests The parsed
 *   `package.json` of each published package the diff touches, on each side.
 * @param {{ path: string, content: string }[]} facts.changesets The `.changeset/*.md` files it adds.
 * @param {string} facts.branch Its head branch.
 * @param {string[]} facts.packages The names of the workspace's packages.
 * @returns {{ ok: boolean, reason: string }} `reason` is what the job prints, pass or fail.
 */
export function changesetVerdict({ diff, changesets, branch, packages }) {
  for (const changeset of changesets) {
    const problem = changesetProblem(changeset, packages);
    if (problem) {
      return { ok: false, reason: problem };
    }
  }
  if (changesets.length > 0) {
    return {
      ok: true,
      reason: `Adds ${changesets.map(({ path }) => path).join(", ")}.`,
    };
  }

  const moved = PUBLISHED_MANIFESTS.flatMap((path) =>
    diff.manifests[path] ? movedRuntimeRanges(path, diff.manifests[path]) : []
  );
  if (moved.length > 0) {
    return {
      ok: false,
      reason: `This pull request adds no changeset, and it moves ${moved.join(
        "; "
      )}. That changes what a consumer installs, so it takes a patch changeset ("Changed: …"), on a Dependabot branch too.`,
    };
  }

  if (branch.startsWith("dependabot/")) {
    return {
      ok: true,
      reason:
        "A Dependabot pull request that moves no published runtime dependency takes no changeset.",
    };
  }

  if (
    diff.files.length > 0 &&
    diff.files.every((file) => file === "package-lock.json")
  ) {
    return {
      ok: true,
      reason: "A lockfile-only pull request takes no changeset.",
    };
  }

  return { ok: false, reason: "This pull request adds no changeset." };
}

/**
 * The facts in `git diff --name-status --no-renames -z` output: every path the diff touches, and the
 * changeset files it adds. `-z` gives status and path as separate NUL-ended fields, with the path unquoted.
 *
 * Only an added changeset counts. One the pull request edits or deletes was owed by an earlier change.
 *
 * @param {string} nameStatus
 * @returns {{ files: string[], addedChangesets: string[] }}
 */
export function readDiff(nameStatus) {
  const fields = nameStatus.split("\0").filter(Boolean);
  const changes = [];
  for (let i = 0; i < fields.length; i += 2) {
    changes.push({ status: fields[i], path: fields[i + 1] });
  }
  return {
    files: changes.map(({ path }) => path),
    addedChangesets: changes
      .filter(
        ({ status, path }) =>
          status === "A" &&
          /^\.changeset\/[^/]+\.md$/.test(path) &&
          path !== ".changeset/README.md"
      )
      .map(({ path }) => path),
  };
}

const git = (...args) =>
  execFileSync("git", args, {
    cwd: repoDir(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

/**
 * A file's parsed JSON at a commit, or `null` when the commit does not have the file. A file that is there
 * and does not parse throws: reading it as absent would report that no dependency moved.
 */
function jsonAt(commit, path) {
  try {
    git("cat-file", "-e", `${commit}:${path}`);
  } catch {
    return null;
  }
  return JSON.parse(git("show", `${commit}:${path}`));
}

/** The name of every package under `packages/`. */
function workspacePackages() {
  const dir = join(repoDir(), "packages");
  return readdirSync(dir)
    .map((name) => join(dir, name, "package.json"))
    .filter((path) => existsSync(path))
    .map((path) => JSON.parse(readFileSync(path, "utf8")).name);
}

/**
 * `node changeset-gate.js --base <commit>` judges the checked-out commit's diff against `base` and exits 1
 * when it owes a changeset. In CI the checkout is the pull request's merge commit and `base` is `HEAD^1`,
 * so the diff is this pull request's own: on a stacked pull request an ancestor's changeset does not count.
 */
function main() {
  const base = process.argv[process.argv.indexOf("--base") + 1];
  if (!process.argv.includes("--base") || !base) {
    console.error("Usage: node changeset-gate.js --base <commit>");
    process.exitCode = 2;
    return;
  }

  const { files, addedChangesets } = readDiff(
    git("diff", "--name-status", "--no-renames", "-z", base, "HEAD", "--")
  );

  const { ok, reason } = changesetVerdict({
    diff: {
      files,
      manifests: Object.fromEntries(
        PUBLISHED_MANIFESTS.filter((path) => files.includes(path)).map(
          (path) => [
            path,
            { before: jsonAt(base, path), after: jsonAt("HEAD", path) },
          ]
        )
      ),
    },
    changesets: addedChangesets.map((path) => ({
      path,
      content: git("show", `HEAD:${path}`),
    })),
    branch: process.env.GITHUB_HEAD_REF ?? "",
    packages: workspacePackages(),
  });

  if (ok) {
    console.log(`Changeset check passed. ${reason}`);
    return;
  }
  console.error(
    `Changeset check failed. ${reason}\nAdd one with \`npx changeset\`. The rules are under "Changeset Rules" in CLAUDE.md.`
  );
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
