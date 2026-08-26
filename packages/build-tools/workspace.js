/**
 * Where the workspace's packages are, resolved once.
 *
 * Six modules across three packages were each deriving this with their own stack of `dirname`
 * calls — `join(dirname(getRootDir()), 'docs')` in one place, four nested `dirname`s in another —
 * and one of them claimed to be "one seam to move if it relocates" while five others existed.
 * This is that seam.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** `packages/`, derived from this file's own location. */
const packagesDir = dirname(dirname(fileURLToPath(import.meta.url)));

/** A sibling package's directory. Overridable per package for tests and one-off builds. */
export const componentsDir = () =>
  process.env.COMPONENTS_DIR || join(packagesDir, "components");
export const docsDir = () => process.env.DOCS_DIR || join(packagesDir, "docs");
export const tokensDir = () =>
  process.env.TOKENS_DIR || join(packagesDir, "tokens");
