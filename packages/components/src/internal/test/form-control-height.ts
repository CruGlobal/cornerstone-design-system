/** The height in pixels that `--cs-form-control-height` resolves to at `element`'s font size. */
export function formControlHeight(element: Element): number {
  const probe = document.createElement('div');
  probe.style.fontSize = getComputedStyle(element).fontSize;
  probe.style.height = 'var(--cs-form-control-height)';
  document.body.append(probe);

  const { height } = probe.getBoundingClientRect();
  probe.remove();

  return height;
}
