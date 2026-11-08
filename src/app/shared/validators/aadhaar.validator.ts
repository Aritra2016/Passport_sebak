import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Verhoeff algorithm multiplication table
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// Verhoeff algorithm permutation table
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

export function validateVerhoeff(numStr: string): boolean {
  let c = 0;
  const invertedArray = numStr.split('').map(Number).reverse();

  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }

  return c === 0;
}

export function aadhaarValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't fail here if empty; required validator handles presence
    }

    // Clean whitespace and hyphens
    const cleanValue = String(control.value).replace(/[\s-]/g, '');

    // Must be exactly 12 numeric digits
    if (!/^\d{12}$/.test(cleanValue)) {
      return { invalidAadhaarFormat: 'Aadhaar must be a 12-digit number' };
    }

    // Aadhaar does not start with 0 or 1
    if (cleanValue.startsWith('0') || cleanValue.startsWith('1')) {
      return { invalidAadhaarPrefix: 'Aadhaar cannot start with 0 or 1' };
    }

    // Mathematical Verhoeff checksum algorithm check
    if (!validateVerhoeff(cleanValue)) {
      return { invalidAadhaarChecksum: 'Invalid Aadhaar number checksum according to UIDAI standard' };
    }

    return null;
  };
}

