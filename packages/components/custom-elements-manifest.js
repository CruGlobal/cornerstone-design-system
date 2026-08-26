import fs from 'fs';
import * as path from 'node:path';
import * as url from 'url';
import { DOCS_COMPONENTS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { jsxTypesPlugin } from '@wc-toolkit/jsx-types';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { parse } from 'comment-parser';
import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';
import { customElementSveltePlugin } from 'custom-element-svelte-integration';
import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { customElementVuejsPlugin } from 'custom-element-vuejs-integration';
import { pascalCase } from 'pascal-case';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packageData = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// Where a component's documentation lives. Deliberately a single constant: the docs host is expected to
// change, so re-pointing it must be one edit rather than a sweep. The per-component `@documentation`
// JSDoc tags still carry literals and are swept with `tools/docs-url.mjs` — collapsing those into this
// constant needs the manifest analysis to derive the field when the tag is absent, which is build-config
// work tracked on the "Build and verify pipeline ownership" ticket.
const DOCS_BASE = DOCS_COMPONENTS_URL;
const { name, description, version, author, homepage, license } = packageData;
const outdir = 'dist/bundled';

function replace(string, terms) {
  terms.forEach(({ from, to }) => {
    string = string?.replace(from, to);
  });

  return string;
}

export default {
  // `src/components/**/*.ts` will ignore src/internal breaking inheritance chains.
  globs: ['src/**/*.ts'],
  exclude: ['**/*.styles.ts', '**/*.test.ts'],
  litelement: true,
  dependencies: true,
  packagejson: false,
  outdir,
  // Give the plugin access to the TypeScript type checker
  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program.getSourceFiles().filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  plugins: [
    typeParserPlugin(),
    // Append package data
    {
      name: 'cs-package-data',
      packageLinkPhase({ customElementsManifest }) {
        customElementsManifest.package = { name, description, version, author, homepage, license };
      },
    },

    cemInheritancePlugin({
      fileName: 'custom-elements.json',
      outdir,
    }),

    // Parse custom jsDoc tags
    {
      name: 'cs-custom-tags',
      analyzePhase({ ts, node, moduleDoc }) {
        switch (node.kind) {
          case ts.SyntaxKind.ClassDeclaration: {
            const className = node.name.getText();
            const classDoc = moduleDoc?.declarations?.find((declaration) => declaration.name === className);
            const customTags = ['dependency', 'documentation', 'since', 'status', 'title', 'ssr'];
            let customComments = '/**';

            node.jsDoc?.forEach((jsDoc) => {
              jsDoc?.tags?.forEach((tag) => {
                const tagName = tag.tagName.getText();

                if (customTags.includes(tagName)) {
                  customComments += `\n * @${tagName} ${tag.comment}`;
                }
              });
            });

            // This is what allows us to map JSDOC comments to ReactWrappers.
            classDoc['jsDoc'] = node.jsDoc?.map((jsDoc) => jsDoc.getFullText()).join('\n');

            const parsed = parse(`${customComments}\n */`);
            parsed[0].tags?.forEach((t) => {
              switch (t.tag) {
                // Dependencies
                case 'dependency':
                  if (!Array.isArray(classDoc['dependencies'])) {
                    classDoc['dependencies'] = [];
                  }
                  classDoc['dependencies'].push(t.name);
                  break;

                // Value-only metadata tags
                case 'documentation':
                case 'since':
                case 'status':
                case 'title':
                  classDoc[t.tag] = t.name;
                  break;

                // All other tags
                default:
                  if (!Array.isArray(classDoc[t.tag])) {
                    classDoc[t.tag] = [];
                  }

                  classDoc[t.tag].push({
                    name: t.name,
                    description: t.description,
                    type: t.type || undefined,
                  });
              }
            });
          }
        }
      },
    },

    {
      name: 'cs-react-event-names',
      analyzePhase({ ts, node, moduleDoc }) {
        switch (node.kind) {
          case ts.SyntaxKind.ClassDeclaration: {
            const className = node.name.getText();
            const classDoc = moduleDoc?.declarations?.find((declaration) => declaration.name === className);

            if (classDoc?.events) {
              classDoc.events.forEach((event) => {
                if (!event.name) {
                  return;
                }
                event.reactName = `on${pascalCase(event.name)}`;
                event.eventName = `${pascalCase(event.name)}Event`;
              });
            }
          }
        }
      },
    },
    {
      name: 'cs-translate-module-paths',
      packageLinkPhase({ customElementsManifest }) {
        customElementsManifest?.modules?.forEach((mod) => {
          //
          // CEM paths look like this:
          //
          //  src/components/button/button.ts
          //
          // But we want them to look like this:
          //
          //  components/button/button.js
          //
          const terms = [
            { from: /^src\//, to: '' }, // Strip the src/ prefix
            { from: /\.(t|j)sx?$/, to: '.js' }, // Convert .ts to .js
          ];

          mod.path = replace(mod.path, terms);

          for (const ex of mod.exports ?? []) {
            ex.declaration.module = replace(ex.declaration.module, terms);
          }

          for (const dec of mod.declarations ?? []) {
            if (dec.kind === 'class') {
              for (const member of dec.members ?? []) {
                if (member.inheritedFrom) {
                  member.inheritedFrom.module = replace(member.inheritedFrom.module, terms);
                }
              }
            }
          }
        });
      },
    },
    // Generate custom VS Code data
    customElementVsCodePlugin({
      outdir,
      cssFileName: null,
      // `parsedType`, not `type`. The plugin splits the union on `|` to build the value list, and a union
      // written multi-line with a leading pipe yields a leading empty segment — so the editor's first
      // suggestion for `variant` was `""`, which renders as the ambient variant.
      typesSrc: 'parsedType',
      referencesTemplate: (_, tag) => [
        {
          name: 'Documentation',
          url: `${DOCS_BASE}/${tag.replace('cs-', '')}`,
        },
      ],
    }),

    // Generate custom JetBrains data
    customElementJetBrainsPlugin({
      outdir,
      excludeCss: true,
      typesSrc: 'parsedType',
      packageJson: false,
      referencesTemplate: (_, tag) => {
        return {
          name: 'Documentation',
          url: `${DOCS_BASE}/${tag.replace('cs-', '')}`,
        };
      },
    }),

    // Filter out events without names (these come from code analysis detecting
    // dispatchEvent() calls, but lack the event name that comes from @event JSDoc tags)
    {
      name: 'cs-filter-unnamed-events',
      packageLinkPhase({ customElementsManifest }) {
        customElementsManifest?.modules?.forEach((mod) => {
          mod.declarations?.forEach((dec) => {
            if (dec.kind === 'class' && dec.events) {
              dec.events = dec.events.filter((event) => event.name);
            }
          });
        });
      },
    },

    // Generate JSX types (see https://wc-toolkit.com/integrations/jsx/)
    jsxTypesPlugin({
      fileName: 'custom-elements-jsx.d.ts',
      outdir,
      defaultExport: true,
      includeDefaultDOMEvents: true,
      componentTypePath: (name, tag, modulePath) => {
        if (!tag) {
          return `./${modulePath}`;
        }
        const unprefixedTag = tag.replace('cs-', '');
        return `./components/${unprefixedTag}/${unprefixedTag}.js`;
      },
    }),

    //
    // TODO - figure out why this broke when events were updated
    //
    customElementVuejsPlugin({
      outdir: './dist/bundled/types/vue',
      fileName: 'index.d.ts',
      componentTypePath: (_, tag) => `../../components/${tag.replace('cs-', '')}/${tag.replace('cs-', '')}.js`,
    }),
    customElementSveltePlugin({
      outdir: './dist/bundled/types/svelte',
      fileName: 'index.d.ts',
    }),
    // cemValidatorPlugin({
    //   cemFileName: "./dist/bundled/custom-elements.json"
    // }),
  ],
};
