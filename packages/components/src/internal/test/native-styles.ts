import { loadStylesheet } from './load-stylesheet.js';

/** Loads `native.css` into the document and resolves with its `<link>` once applied, reusing one already there. */
export function loadNativeStyles(): Promise<HTMLLinkElement> {
  return loadStylesheet('/dist/bundled/styles/native.css');
}
