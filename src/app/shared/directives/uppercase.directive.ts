import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCase]'
})
export class UpperCaseDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private ngControl: NgControl
  ) { }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const upperValue = input.value.toUpperCase();

    if (input.value !== upperValue) {
      input.value = upperValue;
      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(upperValue, { emitEvent: true });
      }
    }
  }
}

