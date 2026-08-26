import { DOCS_COMPONENTS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';

export default function (plop) {
  plop.setHelper('tagWithoutPrefix', (tag) => tag.replace(/^cs-/, ''));

  // The component reference root, so a scaffolded component is not born with a dead
  // `@documentation` tag — which is what the hardcoded `cornerstone.com` did.
  plop.setHelper('docsUrl', () => DOCS_COMPONENTS_URL);

  plop.setHelper('tagToTitle', (tag) => {
    const withoutPrefix = plop.getHelper('tagWithoutPrefix');
    const titleCase = plop.getHelper('titleCase');
    return titleCase(withoutPrefix(tag).replace(/-/g, ' '));
  });

  plop.setGenerator('component', {
    description: 'Generate a new component',
    prompts: [
      {
        type: 'input',
        name: 'tag',
        message: 'Tag name? (e.g. cs-button)',
        validate: (value) => {
          // Start with cs- and include only a-z + dashes
          if (!/^cs-[a-z-+]+/.test(value)) {
            return false;
          }

          // No double dashes or ending dash
          if (value.includes('--') || value.endsWith('-')) {
            return false;
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/components/{{ tagWithoutPrefix tag }}/{{ tagWithoutPrefix tag }}.ts',
        templateFile: 'templates/component/component.hbs',
      },
      {
        type: 'add',
        path: '../../src/components/{{ tagWithoutPrefix tag }}/{{ tagWithoutPrefix tag }}.styles.ts',
        templateFile: 'templates/component/styles.hbs',
      },
      {
        type: 'add',
        path: '../../src/components/{{ tagWithoutPrefix tag }}/{{ tagWithoutPrefix tag }}.test.ts',
        templateFile: 'templates/component/tests.hbs',
      },
      {
        type: 'add',
        path: '../../docs-site/src/content/docs/components/{{ tagWithoutPrefix tag }}.md',
        templateFile: 'templates/component/docs.hbs',
      },
    ],
  });
}
