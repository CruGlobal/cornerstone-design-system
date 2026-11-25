/**
 * The typing rule for a segment holding a one- or two-digit number in `[min, max]`: an hour, minute or second in
 * `<cs-time-input>`, a month or day in `<cs-date-input>`. Shared so both pickers type the same way.
 */

import type { TypeDigitResult } from './segmented-field-controller.js';

/**
 * Applies one typed digit to a segment's pending `buffer`:
 *
 * - A first digit that no second digit could follow without passing `max` commits and advances (`4` for a day).
 * - Any other first digit is held in the buffer, and is already the segment's value (`1` for a month).
 * - A second digit that keeps the pair in range commits the pair and advances (`1` then `2` is 12).
 * - A second digit that would pass `max` starts over from that digit (`1` then `3` for a month is 3).
 * - `0` is held, as 0 when `min` is 0 and as no value otherwise, so `0` then `5` is 5.
 */
export function typeNumericSegment(buffer: string, digit: string, min: number, max: number): TypeDigitResult {
  const d = Number(digit);

  if (buffer === '') {
    if (d === 0 && min === 0) {
      return { value: 0, buffer: '0', advance: false };
    }
    if (d === 0) {
      return { value: null, buffer: '0', advance: false };
    }
    if (d * 10 > max) {
      return { value: Math.min(max, Math.max(min, d)), buffer: '', advance: true };
    }
    return { value: d, buffer: digit, advance: false };
  }

  const combined = Number(buffer + digit);
  if (combined >= min && combined <= max) {
    return { value: combined, buffer: '', advance: true };
  }
  if (buffer === '0' && d === 0) {
    return { value: min === 0 ? 0 : null, buffer: '0', advance: false };
  }
  // The pair passes `max`, so the new digit starts the segment over.
  return typeNumericSegment('', digit, min, max);
}
