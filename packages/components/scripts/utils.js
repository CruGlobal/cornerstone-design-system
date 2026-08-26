import childProcess from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helpful directories
// These are all functions because process.env can sometimes get evaluated in a weird order, so this lazy evals.
export const getRootDir = () => process.env.ROOT_DIR || dirname(__dirname);

// `dist` is a container, not an artifact: it holds both builds of the library.
// The unbundled build keeps dependencies as bare specifiers, so it needs a bundler.
// The bundled build inlines them, so a browser can load it on its own.
export const getDistDir = () => process.env.DIST_DIR || join(getRootDir(), 'dist');
export const getUnbundledDir = () => process.env.UNBUNDLED_DIR || join(getDistDir(), 'unbundled');
export const getBundledDir = () => process.env.BUNDLED_DIR || join(getDistDir(), 'bundled');
/**
 * The documentation package. It is a sibling in the workspace rather than a directory inside this
 * package, so everything that reaches into it goes through here — one seam to move if it relocates.
 */
export const getDocsDir = () => process.env.DOCS_DIR || join(dirname(getRootDir()), 'docs');
/** The Astro content collection — the source the agent files are generated from. */
export const getContentDir = () => process.env.CONTENT_DIR || join(getDocsDir(), 'src', 'content', 'docs');

/**
 * Formats an error for display in dev terminals. 11ty wraps template
 * failures in a TemplateContentRenderError whose `originalError` carries
 * the actionable detail (file path, line, column). For the inner error
 * we prefer `.message` over `.stack` because the message already has
 * everything useful and the stack adds many lines of internal frames.
 */
export function formatError(err) {
  const inner = err?.originalError || err?.cause;
  const innerStr = inner?.message || inner?.stack;
  const outer = err?.message;
  return innerStr && outer && !innerStr.includes(outer)
    ? `${outer}\n\n${innerStr}`
    : innerStr || err?.stack || outer || String(err);
}

/**
 * Runs a script and returns a promise that resolves with the content of stdout when the script exits or rejects with
 * the content of stderr when the script exits with an error.
 */
export function runScript(scriptPath, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = childProcess.fork(scriptPath, args, { silent: true, ...options });
    let wasInvoked = false;
    let stderr = '';
    let stdout = '';

    child.on('error', (err) => {
      if (wasInvoked) {
        return;
      }

      wasInvoked = true;

      reject(err);
    });

    // Capture output
    child.stderr.on('data', (data) => (stderr += data));
    child.stdout.on('data', (data) => (stdout += data));

    // execute the callback once the process has finished running
    child.on('exit', (code) => {
      if (wasInvoked) {
        return;
      }

      wasInvoked = true;

      if (code === 0) {
        // The process exited normally
        resolve(stdout.trim());
      } else {
        // An error code was received
        reject(new Error(stderr));
      }

      child.unref();
    });
  });
}
