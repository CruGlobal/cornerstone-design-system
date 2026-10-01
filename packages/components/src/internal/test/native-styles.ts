/**
 * Loads the native styles (`native.css`) into the document, the way a page that uses them would, and resolves once
 * the sheet has applied. Loading it twice returns the `<link>` already there.
 *
 * Returns the `<link>`, so a test file whose other tests must run without the sheet can remove it afterwards.
 */
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
