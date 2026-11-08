import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PassportApplication } from '../../../core/models/passport.model';

@Component({
  selector: 'app-step9-review',
  templateUrl: './step9-review.component.html',
  styleUrls: ['./step9-review.component.css']
})
export class Step9ReviewComponent {
  @Input() application!: PassportApplication;
  @Output() editStep = new EventEmitter<number>();
  @Output() submitFinal = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  hasConfirmedReview = true;

  jumpToStep(stepNumber: number): void {
    this.editStep.emit(stepNumber);
  }

  onPrev(): void {
    this.prevStep.emit();
  }

  onSubmit(): void {
    if (this.hasConfirmedReview) {
      console.warn('final payload:', this.application);
      this.submitFinal.emit();
    }
  }
}

