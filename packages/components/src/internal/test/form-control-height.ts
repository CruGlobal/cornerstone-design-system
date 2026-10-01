/**
 * The height in pixels that `--cs-form-control-height` resolves to for `element`.
 *
 * The token is written in `em`, and `size` works by setting the host's `font-size`, so the value depends on the
 * element's font size. This measures a probe given that font size, which keeps the answer independent of the
 * element being tested.
 */
export function formControlHeight(element: Element): number {
  const probe = document.createElement('div');
  probe.style.fontSize = getComputedStyle(element).fontSize;
  probe.style.height = 'var(--cs-form-control-height)';
  document.body.append(probe);

  const { height } = probe.getBoundingClientRect();
  probe.remove();

  return height;
}
