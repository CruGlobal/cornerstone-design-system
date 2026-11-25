import type { Validator } from '../../../internal/cornerstone-form-associated-element.js';
import type CsDateInput from '../date-input.js';

/**
 * Reports `badInput` when the segments show a date the field won't accept: a partial entry, an impossible date such as
 * 31 April, or a date that `disabled-dates` or `disabled-days-of-week` blocks. Like a native date input, a partial or
 * impossible entry leaves `value` empty. A blocked date stays in `value`, as a date outside `min` and `max` does.
 *
 * An empty field is valid here; `RequiredValidator` reports an empty required one.
 */
export const DateEntryValidator = (): Validator<CsDateInput> => {
  return {
    checkValidity(element) {
      const message = element.entryError;
      return message
        ? { isValid: false, invalidKeys: ['badInput'], message }
        : { isValid: true, invalidKeys: [], message: '' };
    },
  };
};
