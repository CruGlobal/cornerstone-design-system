import type { Validator } from '../cornerstone-form-associated-element.js';

type ValidationElement = HTMLSelectElement | HTMLInputElement;

export interface RequiredValidatorOptions {
  /**
   * This is a cheap way for us to get translation strings for the user without having proper translations.
   *
   * Prefer a factory over an element. A component's `static get validators()` also runs during server render,
   * so a caller that builds an element eagerly has to guard `document` itself; passing a factory keeps that
   * obligation here, in the one place that already guards it.
   */
  validationElement?: ValidationElement | (() => ValidationElement);

  /**
   * The property to check if its not null-ish. For most elements this will be "value".
   * For "checkbox" for example it will be "checked"
   */
  validationProperty?: string;
}

export const RequiredValidator = (options: RequiredValidatorOptions = {}): Validator => {
  const { validationProperty = 'value' } = options;
  const canCreateElement = typeof document !== 'undefined' && 'createElement' in document;
  const provided = options.validationElement;

  let validationElement: ValidationElement | undefined;

  if (typeof provided === 'function') {
    // Only in a browser: this is what lets callers drop their own `isServer` guard.
    if (canCreateElement) {
      validationElement = provided();
    }
  } else if (provided) {
    validationElement = provided;
  } else if (canCreateElement) {
    validationElement = Object.assign(document.createElement('input'), { required: true });
  }

  const obj: Validator = {
    observedAttributes: ['required'],
    message: validationElement?.validationMessage, // @TODO: Add a translation.
    checkValidity(element) {
      const validity: ReturnType<Validator['checkValidity']> = {
        message: '',
        isValid: true,
        invalidKeys: [],
      };

      const isRequired = element.required ?? element.hasAttribute('required');

      // Always true if the element isn't required.
      if (!isRequired) {
        return validity;
      }

      const value = element[validationProperty as keyof typeof element];

      const isEmpty = !value;

      if (isEmpty) {
        validity.message = typeof obj.message === 'function' ? obj.message(element) : obj.message || '';
        validity.isValid = false;
        validity.invalidKeys.push('valueMissing');
      }

      return validity;
    },
  };

  return obj;
};
