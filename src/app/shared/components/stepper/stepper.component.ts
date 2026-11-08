import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface StepItem {
  step: number;
  label: string;
  shortLabel: string;
  icon: string;
}

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent {
  @Input() activeStep = 1;
  @Input() maxReachedStep = 9;
  @Output() stepChange = new EventEmitter<number>();

  readonly steps: StepItem[] = [
    { step: 1, label: 'Service Type', shortLabel: 'Service', icon: 'file' },
    { step: 2, label: 'Personal Info', shortLabel: 'Personal', icon: 'user' },
    { step: 3, label: 'Family Details', shortLabel: 'Family', icon: 'users' },
    { step: 4, label: 'Address History', shortLabel: 'Address', icon: 'home' },
    { step: 5, label: 'Emergency Contact', shortLabel: 'Emergency', icon: 'phone' },
    { step: 6, label: 'Previous Passport', shortLabel: 'Passport', icon: 'book' },
    { step: 7, label: 'Declarations', shortLabel: 'Legal', icon: 'check' },
    { step: 8, label: 'Documents', shortLabel: 'Uploads', icon: 'upload' },
    { step: 9, label: 'Review & Submit', shortLabel: 'Review', icon: 'send' }
  ];

  onStepClick(stepNumber: number): void {
    if (stepNumber <= this.maxReachedStep) {
      this.stepChange.emit(stepNumber);
    }
  }
}

