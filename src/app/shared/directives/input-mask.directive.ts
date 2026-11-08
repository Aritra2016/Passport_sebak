import { Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

export type MaskType = 'aadhaar' | 'pincode' | 'phone' | 'pan' | 'date' | 'arn';

@Directive({
  selector: '[appInputMask]'
})
export class InputMaskDirective {
  @Input('appInputMask') maskType: MaskType | string = 'aadhaar';

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(): void {
    const input = this.el.nativeElement;
    const rawValue = input.value;
    const formatted = this.applyMask(rawValue, this.maskType);

    if (input.value !== formatted) {
      input.value = formatted;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(formatted, { emitEvent: false });
      }
    }
  }

  private applyMask(value: string, type: string): string {
    if (!value) return '';

    switch (type) {
      case 'aadhaar': {
        // Digits only, max 12 digits, grouped 4-4-4
        const digits = value.replace(/\D/g, '').slice(0, 12);
        const parts = [];
        for (let i = 0; i < digits.length; i += 4) {
          parts.push(digits.substring(i, i + 4));
        }
        return parts.join(' ');
      }

      case 'pincode': {
        // 6 digits
        return value.replace(/\D/g, '').slice(0, 6);
      }

      case 'phone': {
        // 10 digits
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length > 5) {
          return `${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        return digits;
      }

      case 'pan': {
        // 5 letters, 4 digits, 1 letter, total 10
        const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        return clean;
      }

      case 'arn': {
        return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 22);
      }

      case 'date': {
        // DD/MM/YYYY
        const digits = value.replace(/\D/g, '').slice(0, 8);
        if (digits.length >= 5) {
          return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        } else if (digits.length >= 3) {
          return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }
        return digits;
      }

      default:
        return value;
    }
  }
}

