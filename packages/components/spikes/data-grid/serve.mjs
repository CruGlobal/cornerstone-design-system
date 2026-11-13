/**
 * Serves the data-grid spike. `node spikes/data-grid/serve.mjs` from `packages/components`, then open the printed
 * URL. Builds in memory only (nothing lands in `dist/` or the repo), so it can run beside `npm start`.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const styles = resolve(here, '../../src/styles');

export async function startServer({ port = 8710, quiet = false } = {}) {
  const context = await esbuild.context({
    entryPoints: {
      demo: resolve(here, 'demo.ts'),
      cornerstone: resolve(styles, 'cornerstone.css'),
      fl: resolve(styles, 'themes/fl.css'),
    },
    outdir: resolve(here, 'out'),
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    sourcemap: true,
    tsconfig: resolve(here, '../../tsconfig.json'),
    logLevel: quiet ? 'error' : 'info',
  });
  const server = await context.serve({
    servedir: here,
    port,
    host: '127.0.0.1',
  });
  return {
    url: `http://127.0.0.1:${server.port}/`,
    stop: () => context.dispose(),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startServer();
  process.stdout.write(`cs-data-grid spike: ${url}\n`);
}
