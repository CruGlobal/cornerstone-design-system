/**
 * Whether a pull request carries the changeset it owes.
 *
 * The rule is the root `CLAUDE.md`'s Changeset Rules, as code. CI used to install the whole workspace to
 * run `npx changeset status`, which answered a weaker question: it accepted an empty changeset, and it
 * never looked at the two kinds of pull request that take none. `changesetVerdict()` takes the facts and
 * returns a verdict with the reason, so every clause has a test, and the job that runs it needs a checkout
 * and Node and nothing else.
 *
 * `npx changeset status --since=origin/main` is still the closest local check, and `npx changeset` is how
 * to add one.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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
const BUMPS = ["patch", "minor", "major"];

/** The packages and bumps a changeset's frontmatter names, or `null` when it has no frontmatter. */
function releases(content) {
  const frontmatter = /^---\r?\n([\s\S]*?)^---\s*$/m.exec(content);
  if (!frontmatter) {
    return null;
  }
  return frontmatter[1]
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const pair = /^\s*["']?(.+?)["']?\s*:\s*(.*?)\s*$/.exec(line);
      return pair
        ? { name: pair[1], bump: pair[2] }
        : { name: line.trim(), bump: "" };
    });
}

/** What is wrong with one added changeset file, or `null` when it records a real bump. */
function changesetProblem({ path, content }, packages) {
  const named = releases(content);
  if (!named || named.length === 0) {
    return `${path} names no package. Every pull request takes a real bump and a description, never an empty changeset.`;
  }
  for (const { name, bump } of named) {
    if (!packages.includes(name)) {
      return `${path} names "${name}", which is not a package in this workspace.`;
    }
    if (!BUMPS.includes(bump)) {
      return `${path} gives "${name}" the bump "${bump}". It has to be patch, minor or major.`;
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

const git = (...args) =>
  execFileSync("git", args, {
    cwd: repoDir(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

/** A file's parsed JSON at a commit, or `null` when the commit does not have it. */
function jsonAt(commit, path) {
  try {
    return JSON.parse(git("show", `${commit}:${path}`));
  } catch {
    return null;
  }
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

  const changes = git(
    "diff",
    "--name-status",
    "--no-renames",
    base,
    "HEAD",
    "--"
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, path] = line.split("\t");
      return { status, path };
    });
  const files = changes.map(({ path }) => path);

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
    changesets: changes
      .filter(
        ({ status, path }) =>
          status === "A" &&
          /^\.changeset\/[^/]+\.md$/.test(path) &&
          path !== ".changeset/README.md"
      )
      .map(({ path }) => ({ path, content: git("show", `HEAD:${path}`) })),
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
