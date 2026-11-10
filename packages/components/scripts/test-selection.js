/**
 * Which test files one run of the browser suite covers.
 *
 * `web-test-runner.config.js` calls this once and hands the list to the runner. Everything about slicing
 * the suite lives here, where `node --test` can reach it, and not in the config, which only a real browser
 * run can exercise.
 *
 * **Why shards are dealt by weight.** CI splits the suite across runners with `WTR_SHARD=2/6`, and the run is
 * as slow as its slowest shard. Test files vary widely in cost: `time-input` and `otp-input` take tens of
 * seconds, `spinner` under one. Dealing the sorted list round robin gave each shard the same number of files
 * but not the same amount of work, and over 14 runs in November 2026 the slowest shard took 496 to 661
 * seconds against 308 to 391 for the fastest. So each file goes, heaviest first, to whichever shard is
 * lightest so far. That keeps any two shards within one file's weight of each other.
 *
 * Weights are seconds per file from `test-durations.json`, which `npm run test:durations` records. A file
 * the map does not know weighs 1, so a new test file always runs; it is only placed less well until the map
 * is refreshed. With no weights at all the deal comes out as plain round robin.
 */

/** What a file costs when `test-durations.json` has not seen it yet. */
const UNKNOWN_WEIGHT = 1;

/**
 * @param {object} input
 * @param {string[]} input.all Every test file in the suite.
 * @param {string} [input.shard] `"2/6"` for the second of six shards. Unset, every file runs.
 * @param {Record<string, number>} [input.weights] Seconds per file.
 * @returns {string[]} The files to run, sorted.
 */
export function selectTestFiles({ all, shard, weights = {} }) {
  const selection = [...all].sort();
  const files = shard ? dealShard(selection, parseShard(shard), weights) : selection;

  // The runner treats an empty file list as nothing to do, and exits 0.
  if (files.length === 0) {
    throw new Error(`${shard ? `WTR_SHARD=${shard}` : 'The test selection'} selected no test files.`);
  }

  return files;
}

function parseShard(shard) {
  const match = /^(\d+)\/(\d+)$/.exec(shard);
  const [index, total] = match ? [Number(match[1]), Number(match[2])] : [];

  if (!match || index < 1 || index > total) {
    throw new Error(`WTR_SHARD must look like "2/6"; got "${shard}"`);
  }

  return { index, total };
}

/** Greedy bin packing: heaviest file first, each into the lightest shard so far. */
function dealShard(sortedFiles, { index, total }, weights) {
  const weigh = (file) => weights[file] ?? UNKNOWN_WEIGHT;
  const bins = Array.from({ length: total }, () => ({ files: [], load: 0 }));

  // The sort is stable, so equal weights keep their alphabetical order and the deal is repeatable.
  for (const file of [...sortedFiles].sort((a, b) => weigh(b) - weigh(a))) {
    // `reduce` keeps the first of equally light bins, which is what makes equal weights deal round robin.
    const lightest = bins.reduce((best, bin) => (bin.load < best.load ? bin : best));
    lightest.files.push(file);
    lightest.load += weigh(file);
  }

  return bins[index - 1].files.sort();
}
