/**
 * Kills Playwright browsers left behind by an interrupted test run, before the next one starts.
 *
 * `web-test-runner` launches three engines through Playwright — 21 processes on this machine for a full
 * run. They are children of the runner, so anything that kills the runner abruptly (`Ctrl-C`, a CI
 * timeout, a tool killing the npm process) leaves every one of them running, and they never exit.
 *
 * The next run then competes with them for the machine. Pages get starved past the mocha timeout and
 * 50-60 tests fail with `Timeout of Nms exceeded`, spread across all three engines and concentrated in
 * the slower SSR fixtures. It reads exactly like a mass regression in whatever was just changed, and it
 * is not reproducible, because the second run inherits fewer orphans than the first. Two tickets lost
 * time to this. The tell: every failure is a timeout and none is an assertion.
 *
 * Note that `Ctrl-C` is *not* the case that needs this: web-test-runner handles SIGINT properly and takes
 * its browsers with it — verified, 22 processes down to 0. What leaks is any death it cannot catch, such as
 * a tool killing the npm process, a CI step timing out, or a SIGKILL. Those cannot be handled from inside
 * the run at all, which is why cleaning up on the way in is the only approach that always works.
 *
 * Safety: only processes with **no live `web-test-runner` ancestor** are killed, so a concurrent
 * `npm run test:watch` in another terminal is left alone.
 *
 * Usage: node scripts/reap-browsers.js [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const dryRun = process.argv.includes('--dry-run');

/** Every process, as `{ pid, ppid, command }`. */
function processTable() {
  const out = execFileSync('ps', ['-eo', 'pid=,ppid=,command='], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  const rows = new Map();
  for (const line of out.split('\n')) {
    const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
    if (match) {
      rows.set(Number(match[1]), {
        pid: Number(match[1]),
        ppid: Number(match[2]),
        command: match[3],
      });
    }
  }
  return rows;
}

const table = processTable();
const isRunner = (row) => row.command.includes('web-test-runner') && !row.command.includes('reap-browsers');

/**
 * Only the executable path counts, not the whole command line. Matching the line catches a shell that
 * happens to mention the path — including a `pkill -f ms-playwright` cleaning these up.
 */
const isBrowser = (row) => (row.command.split(' ')[0] ?? '').includes('ms-playwright');

/**
 * If a runner is alive, reap nothing.
 *
 * Walking ancestry to tell a live browser from an orphan does not work: WebKit's helpers
 * (`WebKit.Networking.xpc`, `WebKit.GPU.xpc`, `WebKit.WebContent.xpc`) are started through launchd and
 * reparented away from the runner, so five processes of a perfectly healthy run look parentless.
 * Killing those would break the very run this is supposed to protect.
 *
 * A live runner therefore means hands off — someone is testing, possibly in another terminal. This
 * script runs as `pretest`, before a runner of our own exists, so the case it needs to handle is
 * exactly the one where nothing is running.
 */
const liveRunners = [...table.values()].filter(isRunner);

if (liveRunners.length > 0) {
  process.exit(0);
}

const orphans = [...table.values()].filter(isBrowser);

if (orphans.length === 0) {
  process.exit(0);
}

const engines = new Set(
  orphans.map((row) => row.command.match(/ms-playwright\/([a-z_]+)/)?.[1] ?? 'unknown').map((n) => n.split('_')[0]),
);

console.log(
  `Reaping ${orphans.length} orphaned browser process(es) from an interrupted test run ` +
    `(${[...engines].sort().join(', ')}).`,
);

if (dryRun) {
  for (const row of orphans) {
    console.log(`  would kill ${row.pid}  ${row.command.slice(0, 90)}`);
  }
  process.exit(0);
}

let killed = 0;
for (const row of orphans) {
  try {
    process.kill(row.pid, 'SIGKILL');
    killed += 1;
  } catch {
    // Already gone, or not ours to kill.
  }
}

console.log(`Reaped ${killed}. Left them alone and the next run competes with them for the machine.`);
