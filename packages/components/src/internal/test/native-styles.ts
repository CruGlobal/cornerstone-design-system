/** Loads `native.css` into the document and resolves with its `<link>` once applied, reusing one already there. */
export async function loadNativeStyles(): Promise<HTMLLinkElement> {
  const existing = document.querySelector<HTMLLinkElement>('link[data-test-native-styles]');
  if (existing) {
    return existing;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/dist/bundled/styles/native.css';
  link.dataset.testNativeStyles = '';
  document.head.append(link);

  await new Promise<void>((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error('Failed to load native styles')), { once: true });
  });

  return link;
}
