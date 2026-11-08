import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LegalDeclarations } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step7-declarations',
  templateUrl: './step7-declarations.component.html',
  styleUrls: ['./step7-declarations.component.css']
})
export class Step7DeclarationsComponent implements OnInit, OnDestroy {
  @Input() initialData!: LegalDeclarations;
  @Output() stepComplete = new EventEmitter<LegalDeclarations>();
  @Output() prevStep = new EventEmitter<void>();

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
    const d = this.initialData;

    this.form = this.fb.group({
      hasCriminalProceedings: [d?.hasCriminalProceedings ?? false],
      criminalDetails: [d?.criminalDetails || ''],
      hasWarrantOrSummons: [d?.hasWarrantOrSummons ?? false],
      hasBeenConvicted: [d?.hasBeenConvicted ?? false],
      hasRefusedPassport: [d?.hasRefusedPassport ?? false],
      hasImpoundedPassport: [d?.hasImpoundedPassport ?? false],
      hasForeignCitizenship: [d?.hasForeignCitizenship ?? false],
      hasEmergencyCertificate: [d?.hasEmergencyCertificate ?? false],
      agreedToTerms: [d?.agreedToTerms ?? true, [Validators.requiredTrue]]
    });

    // Direct Component tracking - logs with exact step7-declarations.component.ts line number in DevTools
    console.warn('createDeclarationsFormGroup:', this.form.getRawValue());
    console.warn('[Step7DeclarationsComponent] Initialized FormGroup:', this.form);

    let previousValues = { ...this.form.getRawValue() };
    this.form.valueChanges.subscribe(currentValues => {
      Object.keys(currentValues).forEach(key => {
        const oldVal = previousValues[key];
        const newVal = currentValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          console.warn(`[Step7DeclarationsComponent] Value changing for "${key}":`, {
            component: 'Step7DeclarationsComponent',
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

    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.form,
      'Step 7: Statutory Declarations Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onPrev(): void {
    this.prevStep.emit();
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.stepComplete.emit(this.form.value);
  }
}

