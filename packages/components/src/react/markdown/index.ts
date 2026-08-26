import * as React from 'react';
import { createComponent } from '@lit/react';
import Component from '../../components/markdown/markdown.js';

const tagName = 'cs-markdown';

/**
 * @summary Markdown elements render markdown content as HTML directly in the browser, making it easy to display
 *  user-generated content or documentation without a server-side build step.
 * @documentation https://cruglobal.github.io/cornerstone-design-system/components/markdown
 * @status experimental
 * @since 3.4
 *
 * @ssr - `<cs-markdown>` parses the content of its children at runtime, which requires a DOM. It can't render during SSR — use it on the client only.
 */
const reactWrapper = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {},
  displayName: 'CsMarkdown',
});

export default reactWrapper;
