type LitClass = { elementProperties?: Map<PropertyKey, { state?: boolean }> };

/**
 * Copies the elements an option puts in its `start` slot, for the tag that stands for the option. The tag copies them
 * each time it renders, so the copy matches the option as it is then.
 *
 * The tag renders in its control's shadow root, so page CSS does not reach the copy: only self-styled content, such as
 * `<cs-icon>`, `<cs-avatar>` or a `style` attribute, looks the same there. The copy is inert, because the tag's text is
 * the option's label and already names it, and the copy has none of the original's listeners.
 */
export function copyStartContent(option: Element): Element[] {
  return [...option.querySelectorAll(':scope > [slot="start"]')].map((original) => {
    const copy = original.cloneNode(true) as Element;
    const originals = [original, ...original.querySelectorAll('*')];

    [copy, ...copy.querySelectorAll('*')].forEach((element, index) => {
      carryProperties(originals[index], element);
      // An id would collide with the control's own and with other tags' copies. The markers say the server rendered
      // the element, and this copy was made on the client; Lit never renders one that keeps defer-hydration.
      element.removeAttribute('id');
      element.removeAttribute('did-ssr');
      element.removeAttribute('defer-hydration');
    });
    copy.setAttribute('inert', '');
    return copy;
  });
}

/** Lit, React and Vue can set a component's properties without writing attributes, which cloneNode() leaves behind. */
function carryProperties(from: Element, to: Element) {
  const properties = (from.constructor as LitClass).elementProperties;
  if (!properties) {
    return;
  }
  for (const [name, options] of properties) {
    if (!options.state && name !== 'didSSR') {
      (to as unknown as Record<PropertyKey, unknown>)[name] = (from as unknown as Record<PropertyKey, unknown>)[name];
    }
  }
}
