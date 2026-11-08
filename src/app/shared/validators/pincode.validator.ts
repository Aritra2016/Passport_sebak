import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pinCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const cleanValue = String(control.value).trim();

    // 6 digits, first digit 1-9
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanValue)) {
      return {
        invalidPinCode: 'Please enter a valid 6-digit Indian PIN code (cannot start with 0)'
      };
    }

    return null;
  };
}

