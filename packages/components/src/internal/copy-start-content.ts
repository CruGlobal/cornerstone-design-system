const copies = new WeakMap<Element, { source: string; nodes: Element[] }>();

/**
 * Copies the elements an option puts in its `start` slot, for the tag that stands for the option.
 *
 * The tag renders in its control's shadow root, so page CSS does not reach the copy: only self-styled content, such as
 * `<cs-icon>`, `<cs-avatar>` or inline styles, looks the same there. Each copy is hidden from assistive technology,
 * because the tag's text is the option's label and already names it.
 *
 * The same copies come back while the start content is unchanged. A new copy on every render would restart each
 * icon's load, and the icons would flash as people type.
 */
export function copyStartContent(option: Element): Element[] {
  const originals = [...option.querySelectorAll(':scope > [slot="start"]')];
  const source = originals.map((original) => original.outerHTML).join('');
  const cached = copies.get(option);
  if (cached?.source === source) {
    return cached.nodes;
  }

  const nodes = originals.map((original) => {
    const copy = original.cloneNode(true) as Element;
    copy.setAttribute('aria-hidden', 'true');
    // Made on the client, so not server-rendered, whatever the original was. Lit never renders an element that still
    // carries defer-hydration.
    for (const element of [copy, ...copy.querySelectorAll('[did-ssr], [defer-hydration]')]) {
      element.removeAttribute('did-ssr');
      element.removeAttribute('defer-hydration');
    }
    return copy;
  });
  copies.set(option, { source, nodes });
  return nodes;
}
