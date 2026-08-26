/**
 * Fails when a component doc flags an anatomy example the diagram can't use — the flagged block doesn't
 * contain the component's tag (the clone falls back), the page has no diagram (`hasAnatomy: false` / a
 * `parent` sub-component) so an `.anatomy-only` flag hides the example for nothing, or a multi-instance
 * example doesn't mark exactly one `data-anatomy-subject` (the diagram would silently pick the first).
 * Static analysis, no build.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { globby } from 'globby';
import { getDocsDir } from './utils.js';

// A fenced block flagged `.anatomy`/`.anatomy-only`; captures its body up to the closing fence.
const ANATOMY_FENCE = /^```.*\.anatomy.*\n([\s\S]*?)^```/gm;

function frontMatter(source) {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
}

function hasNoDiagram(fm) {
  if (/(^|\n)hasAnatomy:\s*true\b/.test(fm)) {
    return false;
  } // opt-in override for sub-components
  return /(^|\n)hasAnatomy:\s*false\b/.test(fm) || /(^|\n)parent:\s*\S/.test(fm);
}

export async function check(options = {}) {
  const docsDir = options.docsDir || getDocsDir();
  const files = await globby('src/content/docs/components/*.md', {
    cwd: docsDir,
    absolute: true,
  });

  const failures = [];

  for (const file of files.sort()) {
    const slug = basename(file, '.md');
    const tag = `cs-${slug}`;
    const source = await readFile(file, 'utf8');
    const fm = frontMatter(source);

    const blocks = [...source.matchAll(ANATOMY_FENCE)].map((match) => match[1]);
    const problems = [];

    if (hasNoDiagram(fm)) {
      if (blocks.length > 0) {
        problems.push('flagged an anatomy example, but this page has no diagram');
      }
    } else {
      // Boundary guard so `cs-input` doesn't match `cs-input-foo`.
      const tagPattern = new RegExp(`<${tag}(?![\\w-])`, 'g');
      for (const [index, block] of blocks.entries()) {
        const tagCount = (block.match(tagPattern) || []).length;
        const markedCount = (block.match(/data-anatomy-subject/g) || []).length;
        if (tagCount === 0) {
          problems.push(`anatomy example #${index + 1} has no <${tag}> to render`);
        } else if (markedCount > 1) {
          problems.push(`anatomy example #${index + 1} marks ${markedCount} subjects (need exactly one)`);
        } else if (tagCount > 1 && markedCount === 0) {
          // Several instances but no marker → the diagram would silently pick the first. Force a choice.
          problems.push(`anatomy example #${index + 1} has ${tagCount} <${tag}> but none marked data-anatomy-subject`);
        }
      }
    }

    if (problems.length > 0) {
      failures.push({ slug, problems });
      console.log(`❌ ${slug} — ${problems.join('; ')}`);
    } else {
      console.log(`✅ ${slug}`);
    }
  }

  console.log('');
  if (failures.length > 0) {
    const total = failures.reduce((sum, f) => sum + f.problems.length, 0);
    console.log(`FAILED: ${total} anatomy issue(s) across ${failures.length} page(s).`);
    console.log('Flag the example that contains the component, or drop the flag on pages with no diagram.');
    process.exit(1);
  }

  // Report the count. This check globbed the deleted Eleventy tree for a while and passed on an empty
  // file list — a green check that looked at nothing. A number makes that visible.
  console.log(
    `PASSED: ${files.length} component page(s) checked; every flagged anatomy example resolves to a subject.`,
  );
}

function isRunAsMain() {
  if (import.meta.url.startsWith('file:')) {
    return process.argv[1] === fileURLToPath(import.meta.url);
  }
  return false;
}

if (isRunAsMain()) {
  await check().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
