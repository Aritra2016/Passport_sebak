import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function dobValidator(requireAdult = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const today = new Date();

    if (isNaN(inputDate.getTime())) {
      return { invalidDate: 'Invalid date format' };
    }

    // Must not be future date
    if (inputDate > today) {
      return { futureDate: 'Date of birth cannot be in the future' };
    }

    const age = calculateAge(control.value);

    if (age > 120) {
      return { unrealisticAge: 'Age exceeds 120 years. Please verify date.' };
    }

    if (requireAdult && age < 18) {
      return { requiresAdult: 'Applicant must be at least 18 years old.' };
    }

    return null;
  };
}

