import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ServiceTypeDetails } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step1-service-type',
  templateUrl: './step1-service-type.component.html',
  styleUrls: ['./step1-service-type.component.css']
})
export class Step1ServiceTypeComponent implements OnInit, OnDestroy {
  @Input() initialData!: ServiceTypeDetails;
  @Output() stepComplete = new EventEmitter<ServiceTypeDetails>();

  form!: FormGroup;
  private telemetrySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) {}

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [val]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [val]);
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      applicationType: [this.initialData?.applicationType || 'FRESH', [Validators.required]],
      reissueReason: [this.initialData?.reissueReason || ''],
      schemeType: [this.initialData?.schemeType || 'NORMAL', [Validators.required]],
      bookletSize: [this.initialData?.bookletSize || '36_PAGES', [Validators.required]]
    });

    this.form.get('applicationType')?.valueChanges.subscribe(type => {
      if (type === 'REISSUE') {
        this.form.get('reissueReason')?.setValidators([Validators.required]);
      } else {
        this.form.get('reissueReason')?.clearValidators();
      }
      this.form.get('reissueReason')?.updateValueAndValidity();
    });

    // Direct Component tracking - logs with exact step1-service-type.component.ts line number in DevTools
    console.warn('createServiceTypeFormGroup:', this.form.getRawValue());
    console.warn('[Step1ServiceTypeComponent] Initialized FormGroup:', this.form);

    let previousValues = { ...this.form.getRawValue() };
    this.form.valueChanges.subscribe(currentValues => {
      Object.keys(currentValues).forEach(key => {
        const oldVal = previousValues[key];
        const newVal = currentValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          console.warn(`[Step1ServiceTypeComponent] Value changing for "${key}":`, {
            component: 'Step1ServiceTypeComponent',
            field: key,
            oldValue: oldVal,
            newValue: newVal,
            formStatus: this.form.status,
            formGroup: this.form,
            currentFormValue: currentValues
          });
        }
      });
      previousValues = { ...this.form.getRawValue() };
    });

    // Also register with telemetry service for Network tab tracking
    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.form,
      'Step 1: Service Type Selection Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.stepComplete.emit(this.form.value);
  }
}

