type LitClass = { elementProperties?: Map<PropertyKey, { state?: boolean }> };
type Fields = Record<PropertyKey, unknown>;

/** Events a copy fires on its own, such as an avatar's image failing. The page already heard them from the original. */
const CONTAINED_EVENTS = ['cs-error', 'cs-load'];

const copies = new WeakMap<Element, { source: unknown[]; copy: Element }>();

/**
 * Copies the elements an option puts in its `start` slot, for the tag that stands for the option.
 *
 * The tag renders in its control's shadow root, so page CSS does not reach the copy: only self-styled content, such as
 * `<cs-icon>`, `<cs-avatar>` or a `style` attribute, looks the same there. The copy is inert, because the tag's text is
 * the option's label and already names it, and the copy has none of the original's listeners.
 *
 * Each copy is kept until its original's markup or properties change, so a render does not fetch an image again or
 * restart an animation.
 */
export function copyStartContent(option: Element): Element[] {
  return [...option.querySelectorAll(':scope > [slot="start"]')].map((original) => {
    const source = sourceOf(original);
    const kept = copies.get(original);
    if (kept && kept.source.length === source.length && kept.source.every((value, index) => value === source[index])) {
      return kept.copy;
    }
    const copy = makeCopy(original);
    copies.set(original, { source, copy });
    return copy;
  });
}

/** What a copy is made from: the original's markup, and the properties its components can hold without attributes. */
function sourceOf(original: Element) {
  const source: unknown[] = [original.outerHTML];
  for (const element of [original, ...original.querySelectorAll('*')]) {
    for (const name of carriedProperties(element)) {
      source.push((element as unknown as Fields)[name]);
    }
  }
  return source;
}

/** A Lit component's properties, which Lit, React and Vue can set without writing attributes. Not its private state. */
function carriedProperties(element: Element) {
  const properties = (element.constructor as LitClass).elementProperties;
  if (!properties) {
    return [];
  }
  return [...properties].filter(([name, options]) => !options.state && name !== 'didSSR').map(([name]) => name);
}

function makeCopy(original: Element) {
  const clone = original.cloneNode(true) as Element;
  const originals = [original, ...original.querySelectorAll('*')];
  const clones = [clone, ...clone.querySelectorAll('*')];
  // Carrying pairs elements by position, which holds only while cloning kept the count.
  const pairs = originals.length === clones.length;

  clones.forEach((element, index) => {
    if (pairs) {
      for (const name of carriedProperties(originals[index])) {
        (element as unknown as Fields)[name] = (originals[index] as unknown as Fields)[name];
      }
    }
    // An id would collide with the control's own and with other tags' copies. The markers say the server rendered
    // the element, and this copy was made on the client; Lit never renders one that keeps defer-hydration.
    element.removeAttribute('id');
    element.removeAttribute('did-ssr');
    element.removeAttribute('defer-hydration');
  });

  // inert is an HTML attribute and does nothing on SVG, so other content goes inside an HTML element that carries it.
  let copy = clone;
  if (!(clone instanceof HTMLElement)) {
    copy = Object.assign(document.createElement('span'), { slot: 'start' });
    copy.setAttribute('style', 'display: contents');
    clone.removeAttribute('slot');
    copy.append(clone);
  }
  copy.setAttribute('inert', '');
  for (const type of CONTAINED_EVENTS) {
    copy.addEventListener(type, (event) => event.stopPropagation());
  }
  return copy;
}
