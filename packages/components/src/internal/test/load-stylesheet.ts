/** Loads a stylesheet into the document and resolves with its `<link>` once applied, reusing one already there. */
export async function loadStylesheet(href: string): Promise<HTMLLinkElement> {
  const existing = [...document.querySelectorAll<HTMLLinkElement>('link[data-test-stylesheet]')].find(
    (link) => link.dataset.testStylesheet === href,
  );
  if (existing) {
    return existing;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.testStylesheet = href;
  document.head.append(link);

  await new Promise<void>((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error(`Failed to load ${href}`)), { once: true });
  });

  return link;
}
