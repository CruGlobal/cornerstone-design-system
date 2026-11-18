/**
 * This is the intended way of using fixtures since it has some nice ways of catching hydration errors.
 * These fixtures will also auto-load all of our components.
 */

import { ssrFixture as LitSSRFixture, cleanupFixtures } from '@lit-labs/testing/fixtures.js';
import { aTimeout, expect, fixture } from '@open-wc/testing';
import type { LitElement, TemplateResult } from 'lit';
import type CornerstoneElement from '../cornerstone-element.js';

/** What the server render needs to know about each tag. `web-test-runner.config.js` builds it from the manifest. */
export type ServerComponents = Record<string, { module: string; dependencies: string[] }>;

declare global {
  interface Window {
    clientComponents: string[];
    serverComponents: ServerComponents;
    SSR_ONLY: boolean;
    CSR_ONLY: boolean;
  }
}

/**
 * This will hopefully move to a library or be built into Lit. Right now this does nothing.
 */
function handleHydrationError(e: Event) {
  const element = e.target as CornerstoneElement;
  const str = `Expected <${element.localName}> to not have hydration error.`;

  expect(true).to.equal(false, str);
}

// This is a non-standard event I have added to the CornerstoneElement base class.
// https://github.com/lit/lit/discussions/4703
document.addEventListener('lit-hydration-error', handleHydrationError);

/**
 * Loads up a fixture and loads all client components
 */
export async function clientFixture<T extends HTMLElement = HTMLElement>(template: TemplateResult | string) {
  // Load all component definitions "customElements.define()"
  return await fixture<T>(template);
}

// Make it easy to register describe blocks and tell what type of test failed.
clientFixture.type = 'client-only' as const;

/**
 * Every string a template holds, however deep: its static parts, and any text or markup among its values.
 *
 * `opaque` is true when the template holds something that makes markup this cannot read without running it: a
 * generator (lit's `map` and `range`), a promise (`until`), or a function handed to a directive (`repeat`).
 */
function templateText(template: unknown) {
  const text: string[] = [];
  const seen = new Set<unknown>();
  let opaque = false;

  const visit = (value: unknown, inDirective: boolean) => {
    if (typeof value === 'string') {
      text.push(value);
      return;
    }
    if (typeof value === 'function') {
      // An event listener in a template cannot add markup; a function given to a directive is how it makes it.
      opaque ||= inDirective;
      return;
    }
    if (typeof value !== 'object' || value === null || value instanceof Node || seen.has(value)) {
      return;
    }
    seen.add(value);

    const isList = Array.isArray(value);
    if ((!isList && Symbol.iterator in value) || 'then' in value) {
      opaque = true;
      return;
    }

    const isDirective = '_$litDirective$' in value;
    for (const [key, child] of Object.entries(value)) {
      if (key !== '_$litDirective$') {
        visit(child, inDirective || isDirective);
      }
    }
  };

  visit(template, false);
  return { text, opaque };
}

/**
 * The server modules a template needs: one for each `cs-*` tag written in it, and one for each tag those
 * components declare with `@dependency`, followed all the way down.
 *
 * The server render runs in a new worker thread for every fixture, and that worker imports each module it is
 * handed before it renders. Handing it every component made each hydrated fixture pay for about eighty imports
 * to render one or two elements.
 *
 * The declared dependencies matter because a component's module does not always import what it renders, though
 * it should. `cs-time-input` renders `<cs-icon>` and is missing the import, which is a bug in that component.
 * Without the declared dependencies its icons would come back from the server as unknown elements and no test
 * would say so.
 *
 * A template gets every module, as before, when it has no known `cs-*` tag in its text, or holds something whose
 * markup cannot be read without running it (see `templateText`): its tags may be built where this cannot see.
 */
export function serverModulesFor(
  template: TemplateResult,
  components: ServerComponents = window.serverComponents,
): string[] {
  const needed = new Set<string>();
  const { text, opaque } = templateText(template);
  const queue = opaque ? [] : text.flatMap((part) => part.match(/<cs-[a-z0-9-]+/g) ?? []);

  while (queue.length > 0) {
    const tag = queue.pop()!.replace(/^</, '');
    if (tag in components && !needed.has(tag)) {
      needed.add(tag);
      queue.push(...components[tag].dependencies);
    }
  }

  const tags = needed.size > 0 ? Object.keys(components).filter((tag) => needed.has(tag)) : Object.keys(components);
  return tags.map((tag) => components[tag].module);
}

/**
 * Loads up a fixture with SSR, using the unbundled modules the template needs (see `serverModulesFor`), then when it finishes, calls hydration scripts, and then when hydration completes, returns the element.
 */
export async function hydratedFixture<T extends HTMLElement = HTMLElement>(template: TemplateResult) {
  const hydratedElement = await LitSSRFixture<T>(template, {
    base: import.meta.url,
    modules: serverModulesFor(template),
    hydrate: true,
  });

  // @ts-expect-error Assume its a lit element.
  await hydratedElement.updateComplete;

  // This can be removed when this is fixed: https://github.com/lit/lit/issues/4709
  // This forces every element to "hydrate" and then wait for an update to complete (hydration)
  await Promise.allSettled(
    [...hydratedElement.querySelectorAll<LitElement>('*')].map(async (el) => {
      el.removeAttribute('defer-hydration');
      return el.updateComplete;
    }),
  );

  return hydratedElement;
}

hydratedFixture.type = 'ssr-client-hydrated' as const;

export const fixtures = [clientFixture, hydratedFixture].filter((fix) => {
  if (window.SSR_ONLY && fix.type === 'client-only') {
    return false;
  }

  if (window.CSR_ONLY && fix.type === 'ssr-client-hydrated') {
    return false;
  }

  return true;
});

/**
 * This registers the fixture cleanup as a side effect
 */
try {
  // We load Mocha globally, so this just makes it so every test file doesn't need to call beforeEach and afterEach to cleanup fixtures.
  if (typeof beforeEach !== 'undefined') {
    beforeEach(async () => {
      cleanupFixtures();
      await aTimeout(1);
    });
  }
  if (typeof afterEach !== 'undefined') {
    afterEach(async () => {
      cleanupFixtures();
      await aTimeout(1);
    });
  }
} catch {
  // We really don't care if there's an error in these.
}
