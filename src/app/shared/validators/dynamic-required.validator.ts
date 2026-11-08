import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dynamicRequiredValidator(
  conditionFn: (control: AbstractControl) => boolean,
  errorMessage = 'This field is required based on your previous answers'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!conditionFn(control)) {
      return null;
    }

    const value = control.value;
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return { dynamicRequired: errorMessage };
    }

    return null;
  };
}

