/**
 * Verifies skill content stays in sync with the library.
 *
 * Catches the regression we hit when shipping `choosing-components.md`: silent drift between the
 * hand-authored decision tree and the actual component catalog (tags that don't exist, etc.). Also
 * checks relative markdown links inside the skill files resolve.
 *
 * Run: `node scripts/verify-skills.js`. Exits non-zero on any failure so it can be wired into CI.
 *
 * Checks:
 *  1. Every `<cs-*>` tag mentioned in `agent-skill/choosing-components.md` exists as a component
 *     under `src/components/<name>/`.
 *  2. Every attribute cited alongside those tags exists on that component per the CEM.
 *  3. Every relative markdown link in `agent-skill/**.md` and `design-skill/**.md` resolves to a file
 *     that exists.
 *  4. No file asserts a claim known to be false: a domain Cru does not own, a Pro product that does not
 *     exist, a mangled third-party host, or a component count that is wrong.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const COMPONENTS_DIR = path.join(PACKAGE_ROOT, 'src', 'components');

const CEM_PATH = path.join(PACKAGE_ROOT, 'dist', 'unbundled', 'custom-elements.json');

const CHOOSING_COMPONENTS = path.join(__dirname, 'agent-skill', 'choosing-components.md');
const DESIGN_SKILL_DIR = path.join(__dirname, 'design-skill');
/**
 * Every markdown source the agent files are compiled from. Checks 2 and 2b run over all of them:
 * scoping them to `choosing-components.md` alone is how `size="large"` — a value deleted by an
 * earlier sweep — survived in `SKILL.md` and `references/layouts-page.md`.
 */
function skillMarkdownSources() {
  const files = [];
  const dirs = [path.join(__dirname, 'agent-skill'), DESIGN_SKILL_DIR, path.join(DESIGN_SKILL_DIR, 'references')];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }
    for (const name of fs.readdirSync(dir)) {
      // README.md is developer documentation about the skill, not shipped skill content, and it
      // quotes deliberately-wrong markup as an example of what this checker catches.
      if (name.endsWith('.md') && name !== 'README.md') {
        files.push(path.join(dir, name));
      }
    }
  }
  return files.sort();
}

// `choosing-components.md` lives at source in `scripts/agent-skill/` but ships into the same
// `references/` dir as everything else the agent-skill generator produces — so relative links it
// makes to its runtime siblings (form-controls.md, themes.md, etc.) won't resolve against the source
// path. This allowlist captures the sibling refs the generator is known to emit; relative links
// against any of these are accepted.
const AGENT_SKILL_RUNTIME_SIBLINGS = new Set([
  'themes.md',
  'support.md',
  'installation.md',
  'usage.md',
  'form-controls.md',
  'customizing.md',
  'localization.md',
  'choosing-components.md',
]);

// Attributes a component reads via CSS selectors (`:host([disable-sticky~='banner'])` in
// page.styles.ts) but doesn't expose via a `@property` decorator, so they never appear in the CEM.
// The skills correctly document them; the CEM is the one out of sync. Allowlisted so a real bug
// elsewhere isn't drowned out. Re-evaluate if/when those components add the missing declarations.
const CSS_ONLY_ATTRS = new Set(['disable-sticky']);

// How many markdown sources checks 2 and 2b read, for the summary line.
let attrCheckFiles = 0;
let attrValuesChecked = 0;

const errors = [];
const warnings = [];

function listComponents(dir) {
  if (!fs.existsSync(dir)) {
    return new Set();
  }
  return new Set(
    fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

const components = listComponents(COMPONENTS_DIR);

if (components.size === 0) {
  errors.push(`No components found under ${COMPONENTS_DIR}`);
}

/**
 * Loads the Custom Elements Manifest into a tagName → declaration map.
 * Each declaration carries `attributes`, `members`, `events`, etc. — used by the attribute-existence
 * check below. The CEM is produced by the build, so when running `verify:skills` standalone (no build),
 * the map may be empty; in that case the attribute check is skipped with a warning rather than a hard
 * failure, since `verify` always builds before running this and CI catches it there.
 */
function loadCem(cemPath) {
  if (!fs.existsSync(cemPath)) {
    return null;
  }
  const cem = JSON.parse(fs.readFileSync(cemPath, 'utf-8'));
  const decls = new Map();
  for (const mod of cem.modules || []) {
    for (const decl of mod.declarations || []) {
      if (decl.tagName) {
        decls.set(decl.tagName, decl);
      }
    }
  }
  return decls;
}

const cemByTag = loadCem(CEM_PATH) || new Map();
const cemAvailable = cemByTag.size > 0;
if (!cemAvailable) {
  warnings.push(
    `Custom Elements Manifest not found (run \`npm run build\` first); skipping attribute-existence check.`,
  );
}

// --- Check 1: every `<cs-*>` tag in a choosing-components.md table row exists ---
const choosingMd = fs.readFileSync(CHOOSING_COMPONENTS, 'utf-8');

const tagPattern = /<cs-([a-z-]+)>/g;

// Track the lines each tag was seen on so a failure points at every offending row.
const seenTags = new Map(); // name -> { lines: number[] }

choosingMd.split('\n').forEach((line, idx) => {
  if (!line.startsWith('|') || line.startsWith('| -')) {
    return;
  }
  let match;
  const tagRegex = new RegExp(tagPattern.source, 'g');
  while ((match = tagRegex.exec(line)) !== null) {
    const name = match[1];
    if (!seenTags.has(name)) {
      seenTags.set(name, { lines: [idx + 1] });
    } else {
      seenTags.get(name).lines.push(idx + 1);
    }
  }
});

for (const [name, info] of seenTags) {
  if (!components.has(name)) {
    errors.push(`choosing-components.md mentions <cs-${name}> on line ${info.lines.join(', ')} but it doesn't exist`);
  }
}

// --- Check 1b: prose mentions of `<cs-*>` tags must also exist in the catalog ---
//
// Tags already validated by the table-row scan are skipped to avoid double-reporting.
const proseChecked = new Set(seenTags.keys());
const proseTagRegex = /<cs-([a-z][a-z0-9-]*)>/g;
choosingMd.split('\n').forEach((line, idx) => {
  // Table rows are already covered above.
  if (line.startsWith('|') && !line.startsWith('| -')) {
    return;
  }
  let match;
  const re = new RegExp(proseTagRegex.source, 'g');
  while ((match = re.exec(line)) !== null) {
    const name = match[1];
    if (proseChecked.has(name)) {
      continue;
    }
    proseChecked.add(name);
    if (!components.has(name)) {
      errors.push(`choosing-components.md:${idx + 1}: prose mentions <cs-${name}> but it doesn't exist`);
    }
  }
});

// --- Check 2: attribute names cited in choosing-components.md exist on those components per CEM ---
//
// Tables and prose make concrete claims like `<cs-tag removable>` and `<cs-button variant="brand">`.
// Catch the case where the cited attribute doesn't actually exist on that component (e.g. the real
// attribute is `with-remove`, not `removable`). Skipped silently when no CEM is available.
//
// `data-*`, `aria-*`, `slot`, and a handful of globals are universal and not always declared in the
// CEM. Skip those rather than false-flag them.
const UNIVERSAL_ATTRS = new Set(['class', 'id', 'style', 'slot', 'role', 'title', 'hidden', 'tabindex']);
function isUniversalAttr(name) {
  return UNIVERSAL_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-') || name.startsWith('on');
}

if (cemAvailable) {
  // Match the tag and everything between the tag name and the closing `>` so we can pull attributes
  // off the rest. Tag names use lowercase + hyphen only.
  const tagWithAttrsRegex = /<cs-([a-z][a-z0-9-]*)((?:\s+[^>]+)?)>/g;
  // Inside the attributes blob, attribute names are tokens that precede `=` or whitespace/EOS.
  const attrNameRegex = /\s+([a-z][a-z0-9-]*)(?==|\s|$)/g;

  // Attribute values, for check 2b. Only a union of string literals is a closed set; `string`,
  // `number` and booleans are open and must not be checked.
  const attrPairRegex = /\s+([a-z][a-z0-9-]*)="([^"]*)"/g;
  /** The declared value set for an attribute, or null when the type is not a closed union. */
  function closedSet(attr) {
    const text = attr.parsedType?.text ?? attr.type?.text ?? '';
    const parts = text
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 2 || !parts.every((s) => /^'[^']*'$/.test(s))) {
      return null;
    }
    return new Set(parts.map((s) => s.slice(1, -1)));
  }

  for (const file of skillMarkdownSources()) {
    attrCheckFiles += 1;
    const label = path.relative(__dirname, file);
    fs.readFileSync(file, 'utf-8')
      .split('\n')
      .forEach((line, idx) => {
        let tagMatch;
        const tagRegex = new RegExp(tagWithAttrsRegex.source, 'g');
        while ((tagMatch = tagRegex.exec(line)) !== null) {
          const [, tagSuffix, rest] = tagMatch;
          if (!rest || !rest.trim()) {
            continue;
          }
          const tagName = `cs-${tagSuffix}`;
          const decl = cemByTag.get(tagName);
          if (!decl) {
            continue;
          } // tag-existence check already errored above
          const declAttrs = new Set((decl.attributes || []).map((a) => a.name));

          let attrMatch;
          const attrRegex = new RegExp(attrNameRegex.source, 'g');
          while ((attrMatch = attrRegex.exec(rest)) !== null) {
            const attr = attrMatch[1];
            if (isUniversalAttr(attr) || CSS_ONLY_ATTRS.has(attr)) {
              continue;
            }
            if (!declAttrs.has(attr)) {
              // Surface a helpful hint when a near-name exists (often a JS-property vs HTML-attribute mismatch).
              const memberNames = (decl.members || [])
                .filter((m) => m.kind === 'field' && m.privacy !== 'private')
                .map((m) => m.name);
              const hint = memberNames.find(
                (m) => m.toLowerCase().replace(/[^a-z0-9]/g, '') === attr.replace(/-/g, ''),
              );
              const hintText = hint ? ` (did you mean the HTML attribute for the JS property \`${hint}\`?)` : '';
              errors.push(`${label}:${idx + 1}: <${tagName}> doesn't have an attribute named \`${attr}\`${hintText}`);
            }
          }

          // --- Check 2b: an attribute with a closed value set must carry a declared value ---
          const pairRegex = new RegExp(attrPairRegex.source, 'g');
          let pairMatch;
          while ((pairMatch = pairRegex.exec(rest)) !== null) {
            const [, attr, value] = pairMatch;
            if (isUniversalAttr(attr)) {
              continue;
            }
            const decl2 = (decl.attributes || []).find((a) => a.name === attr);
            if (!decl2) {
              continue;
            } // the name check above already errored
            const allowed = closedSet(decl2);
            if (allowed) {
              attrValuesChecked += 1;
            }
            if (allowed && !allowed.has(value)) {
              errors.push(
                `${label}:${idx + 1}: <${tagName} ${attr}="${value}"> is not a declared value ` +
                  `(expected one of ${[...allowed].join(', ')})`,
              );
            }
          }
        }
      });
  }
}

// --- Check 3: layouts-page.md API tables match cs-page CEM declaration ---
//
// The design skill's `layouts-page.md` ends with hand-authored summary tables of `<cs-page>`'s slots,
// attributes, and CSS custom properties. These drift the same way `choosing-components.md` did — the
// maintainer README explicitly calls this out as a known risk. Cross-check every cited name against
// the actual CEM declaration so renames or removals upstream don't silently outlive the doc.
//
// Forward direction only: every cited name must exist in the CEM. The reverse (every CEM entry must
// appear in the doc) is intentionally NOT enforced — the design skill curates, omitting internal-only
// slots/attrs like `dir`, `lang`, `did-ssr`.
const LAYOUTS_PAGE = path.join(DESIGN_SKILL_DIR, 'references', 'layouts-page.md');
if (cemAvailable && fs.existsSync(LAYOUTS_PAGE)) {
  const csPageDecl = cemByTag.get('cs-page');
  if (!csPageDecl) {
    warnings.push(`cs-page not found in CEM; skipping layouts-page.md API table cross-check`);
  } else {
    const cemSlots = new Set((csPageDecl.slots || []).map((s) => s.name || '_default'));
    const cemAttrs = new Set((csPageDecl.attributes || []).map((a) => a.name));
    const cemCssProps = new Set((csPageDecl.cssProperties || []).map((p) => p.name));

    for (const a of CSS_ONLY_ATTRS) {
      cemAttrs.add(a);
    }

    const sections = {
      '### Slots': cemSlots,
      '### Attributes': cemAttrs,
      '### CSS custom properties': cemCssProps,
    };

    const layoutsLines = fs.readFileSync(LAYOUTS_PAGE, 'utf-8').split('\n');

    for (const [heading, validSet] of Object.entries(sections)) {
      const startIdx = layoutsLines.findIndex((l) => l.trim() === heading);
      if (startIdx === -1) {
        warnings.push(`layouts-page.md missing expected heading "${heading}"`);
        continue;
      }
      // Find the table's separator row (| --- | --- |) following the heading.
      let sepIdx = startIdx + 1;
      while (sepIdx < layoutsLines.length && !/^\|\s*-+/.test(layoutsLines[sepIdx])) {
        if (/^#{1,4}\s/.test(layoutsLines[sepIdx])) {
          sepIdx = -1;
          break;
        }
        sepIdx++;
      }
      if (sepIdx === -1 || sepIdx >= layoutsLines.length) {
        continue;
      }

      // Walk the data rows until we leave the table.
      for (let i = sepIdx + 1; i < layoutsLines.length; i++) {
        const line = layoutsLines[i];
        if (!line.startsWith('|')) {
          break;
        }
        const firstCell = line.split('|')[1]?.trim();
        if (!firstCell) {
          continue;
        }
        let name;
        if (firstCell === '_(default)_') {
          name = '_default';
        } else {
          const m = firstCell.match(/^`([^`]+)`$/);
          if (!m) {
            continue;
          }
          name = m[1];
        }
        if (!validSet.has(name)) {
          errors.push(
            `layouts-page.md:${i + 1}: "${name}" cited under ${heading} but not in <cs-page>'s CEM declaration`,
          );
        }
      }
    }
  }
}

// --- Check 4: relative markdown links resolve ---
function* walkMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdown(p);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield p;
    }
  }
}

const linkRegex = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const AGENT_SKILL_DIR = path.join(__dirname, 'agent-skill');
const filesToScan = [
  ...new Set([CHOOSING_COMPONENTS, ...walkMarkdown(AGENT_SKILL_DIR), ...walkMarkdown(DESIGN_SKILL_DIR)]),
];

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    let m;
    const re = new RegExp(linkRegex.source, 'g');
    while ((m = re.exec(line)) !== null) {
      const href = m[2];
      // Skip http(s), mailto, anchors, and template placeholders
      if (/^(https?:|mailto:|#)/.test(href) || href.startsWith('${')) {
        continue;
      }
      // Strip any fragment
      const [pathPart] = href.split('#');
      if (!pathPart) {
        continue;
      }
      // Files in `agent-skill/` ship into the generated `references/` dir alongside other refs the
      // generator produces. Accept links that target those known runtime siblings.
      if (file.startsWith(path.join(__dirname, 'agent-skill')) && AGENT_SKILL_RUNTIME_SIBLINGS.has(pathPart)) {
        continue;
      }
      // Resolve relative to the file's directory
      const resolved = path.resolve(path.dirname(file), pathPart);
      if (!fs.existsSync(resolved)) {
        errors.push(
          `${path.relative(PACKAGE_ROOT, file)}:${idx + 1}: broken link to '${href}' (resolved to ${path.relative(PACKAGE_ROOT, resolved)})`,
        );
      }
    }
  });
}

// --- Prose claims ---
// The link check above proves a path resolves; it says nothing about what the prose asserts. Ticket 02's
// Pro purge missed the design skill entirely for exactly that reason, so these are the claims that were
// wrong and must not come back. Patterns are deliberately narrow: `Font Awesome Pro` is a real product a
// user may hold, so only `Cornerstone Pro` is forbidden.
const FORBIDDEN_PROSE = [
  [/cornerstone\.com/i, "a domain Cru does not own — it is upstream's own, with the rename applied"],
  [/Cornerstone Pro\b/i, 'there is no Pro product; Font Awesome Pro is a separate, real thing'],
  [/\bka-[fp]\./i, 'a third-party kit host the rename mangled into a domain Cru does not own'],
  [/shoelace-style\/cornerstone/i, 'a repository that does not exist'],
  [/50\+\s*components/i, 'the library ships 70'],
  [/Theme Builder/i, 'a Pro feature Cornerstone does not ship'],
];

// The hand-written sources above are only half the skill. The rest is generated from the docs, and that
// half shipped `Cornerstone Pro` and a link to a repository that does not exist while this check was
// passing — because it never looked at the built output. Scan it too when it is there.
const BUILT_SKILLS_DIR = path.join(PACKAGE_ROOT, 'dist', 'unbundled', 'skills');
const builtFilesToScan = fs.existsSync(BUILT_SKILLS_DIR) ? [...walkMarkdown(BUILT_SKILLS_DIR)] : [];
if (builtFilesToScan.length === 0) {
  warnings.push(
    `no built skill found at ${path.relative(PACKAGE_ROOT, BUILT_SKILLS_DIR)} — run \`npm run build\` to check the generated half`,
  );
}

for (const [file, generated] of [...filesToScan.map((f) => [f, false]), ...builtFilesToScan.map((f) => [f, true])]) {
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, idx) => {
    for (const [pattern, why] of FORBIDDEN_PROSE) {
      const match = line.match(pattern);
      if (!match) {
        continue;
      }
      const message = `${path.relative(PACKAGE_ROOT, file)}:${idx + 1}: prose says '${match[0]}' — ${why}`;
      // Generated findings were warnings while the generator scraped the Eleventy tree, which carried
      // upstream's Pro documentation. It now reads `docs-site/src/content/docs` and the manifest, so a
      // violation in its output means a violation in a page we author. That is an error.
      errors.push(generated ? `[generated] ${message}` : message);
    }
  });
}

// Every component the manifest ships must have a reference file in the skill. A component with no
// reference is invisible to an agent, which is the failure this whole surface exists to prevent.
const COMPONENT_REFS_DIR = path.join(BUILT_SKILLS_DIR, 'cornerstone', 'references', 'components');
if (builtFilesToScan.length > 0) {
  const referenced = fs.existsSync(COMPONENT_REFS_DIR)
    ? new Set(
        fs
          .readdirSync(COMPONENT_REFS_DIR)
          .filter((name) => name.endsWith('.md'))
          .map((name) => name.replace(/\.md$/, '')),
      )
    : new Set();
  const missing = [...components].filter((tag) => !referenced.has(tag)).sort();
  if (missing.length > 0) {
    errors.push(`${missing.length} component(s) have no reference file in the skill: ${missing.join(', ')}`);
  }
}

// --- Report ---
if (warnings.length > 0) {
  console.warn('Warnings:');
  for (const w of warnings) {
    console.warn(`  ${w}`);
  }
}

if (errors.length > 0) {
  console.error(`\nFound ${errors.length} skill verification error(s):`);
  for (const e of errors) {
    console.error(`  ✗ ${e}`);
  }
  process.exit(1);
}

console.log(`✓ Skill verification passed.`);
console.log(`  ${seenTags.size} <cs-*> tags checked against ${components.size} components`);
console.log(`  ${filesToScan.length} markdown files scanned for broken relative links`);
console.log(
  `  ${attrValuesChecked} closed-set attribute value(s) checked against the CEM across ${attrCheckFiles} skill source(s)`,
);
console.log(
  `  ${FORBIDDEN_PROSE.length} forbidden prose claims checked across those and ${builtFilesToScan.length} generated file(s)`,
);
if (builtFilesToScan.length > 0) {
  console.log(`  ${components.size} manifest component(s) each have a reference file`);
}
