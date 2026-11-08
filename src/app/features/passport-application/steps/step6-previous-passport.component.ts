import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PreviousPassportDetails, ServiceTypeDetails, PastApplicationItem } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step6-previous-passport',
  templateUrl: './step6-previous-passport.component.html',
  styleUrls: ['./step6-previous-passport.component.css']
})
export class Step6PreviousPassportComponent implements OnInit, OnDestroy {
  @Input() initialData!: PreviousPassportDetails;
  @Input() serviceType!: ServiceTypeDetails;
  @Output() stepComplete = new EventEmitter<PreviousPassportDetails>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  private telemetrySub?: Subscription;

  // Accordion Sections (Matching EDE Dashboard Reference)
  heldPassportOpen = true;
  pastAppliedOpen = true;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) {}

  toggleSection(sec: string): void {
    if (sec === 'held') this.heldPassportOpen = !this.heldPassportOpen;
    if (sec === 'applied') this.pastAppliedOpen = !this.pastAppliedOpen;
  }

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + val, [val]);
  }

  ngOnInit(): void {
    const d = this.initialData;
    const isReissue = this.serviceType?.applicationType === 'REISSUE';

    this.form = this.fb.group({
      hasHeldPassport: [d?.hasHeldPassport ?? isReissue],
      previousPassportNumber: [d?.previousPassportNumber || ''],
      dateOfIssue: [d?.dateOfIssue || ''],
      dateOfExpiry: [d?.dateOfExpiry || ''],
      placeOfIssue: [d?.placeOfIssue || ''],
      fileNumber: [d?.fileNumber || ''],
      hasAppliedAndNotIssued: [d?.hasAppliedAndNotIssued ?? false],
      appliedFileNumber: [d?.appliedFileNumber || ''],
      appliedYear: [d?.appliedYear || ''],
      appliedPassportOffice: [d?.appliedPassportOffice || ''],
      appliedReason: [d?.appliedReason || ''],
      pastApplications: this.fb.array([])
    });

    if (d?.hasAppliedAndNotIssued) {
      if (d.pastApplications && d.pastApplications.length > 0) {
        d.pastApplications.forEach(app => this.addPastApplication(app));
      } else {
        this.addPastApplication({
          fileNumber: d.appliedFileNumber || '',
          appliedYear: d.appliedYear || '',
          appliedPassportOffice: d.appliedPassportOffice || '',
          appliedReason: d.appliedReason || ''
        });
      }
    }

    this.setupConditionalValidation();

    // Direct Component tracking - logs with exact step6-previous-passport.component.ts line number in DevTools
    console.warn('createPreviousPassportFormGroup:', this.form.getRawValue());
    console.warn('[Step6PreviousPassportComponent] Initialized FormGroup:', this.form);

    let previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.form.valueChanges.subscribe(currentValues => {
      ['hasHeldPassport', 'previousPassportNumber', 'dateOfIssue', 'dateOfExpiry', 'placeOfIssue', 'fileNumber', 'hasAppliedAndNotIssued'].forEach(field => {
        if (currentValues[field] !== previousValues[field]) {
          console.warn(`[Step6PreviousPassportComponent] Value changing for "${field}":`, {
            component: 'Step6PreviousPassportComponent',
            field: field,
            oldValue: previousValues[field],
            newValue: currentValues[field],
            formStatus: this.form.status,
            formGroup: this.form
          });
        }
      });

      const oldPast: any[] = previousValues.pastApplications || [];
      const newPast: any[] = currentValues.pastApplications || [];
      newPast.forEach((past, idx) => {
        const o = oldPast[idx] || {};
        ['fileNumber', 'appliedYear', 'appliedPassportOffice', 'appliedReason'].forEach(f => {
          if (past[f] !== o[f]) {
            console.warn(`[Step6PreviousPassportComponent] Value changing for "pastApplications[${idx}].${f}":`, {
              component: 'Step6PreviousPassportComponent',
              field: `pastApplications[${idx}].${f}`,
              oldValue: o[f] || '(empty)',
              newValue: past[f],
              formStatus: this.form.status,
              formGroup: this.form
            });
          }
        });
      });

      previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    });

    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.form,
      'Step 6: Previous Passport & History Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  get pastApplicationsArray(): FormArray {
    return this.form.get('pastApplications') as FormArray;
  }

  addPastApplication(data: Partial<PastApplicationItem> = {}): void {
    const group = this.fb.group({
      fileNumber: [data.fileNumber || '', [Validators.required]],
      appliedYear: [data.appliedYear || '', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      appliedPassportOffice: [data.appliedPassportOffice || '', [Validators.required]],
      appliedReason: [data.appliedReason || '']
    });
    this.pastApplicationsArray.push(group);
    console.warn('this is coming::::::::', this.pastApplicationsArray);
  }

  removePastApplication(index: number): void {
    this.pastApplicationsArray.removeAt(index);
    console.warn('this is coming::::::::', this.pastApplicationsArray);
  }

  private setupConditionalValidation(): void {
    const updatePassportValidation = (held: boolean) => {
      const controls = ['previousPassportNumber', 'dateOfIssue', 'dateOfExpiry', 'placeOfIssue'];
      controls.forEach(ctrlName => {
        const ctrl = this.form.get(ctrlName);
        if (held) {
          ctrl?.setValidators([Validators.required]);
        } else {
          ctrl?.clearValidators();
        }
        ctrl?.updateValueAndValidity();
      });
    };

    this.form.get('hasHeldPassport')?.valueChanges.subscribe(updatePassportValidation);
    updatePassportValidation(this.form.get('hasHeldPassport')?.value);

    this.form.get('hasAppliedAndNotIssued')?.valueChanges.subscribe(hasApplied => {
      if (hasApplied) {
        if (this.pastApplicationsArray.length === 0) {
          this.addPastApplication();
        }
      } else {
        this.pastApplicationsArray.clear();
      }
    });
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

    const val = this.form.value;
    const firstPast = val.pastApplications && val.pastApplications.length > 0 ? val.pastApplications[0] : null;

    const result: PreviousPassportDetails = {
      ...val,
      appliedFileNumber: firstPast ? firstPast.fileNumber : val.appliedFileNumber,
      appliedYear: firstPast ? firstPast.appliedYear : val.appliedYear,
      appliedPassportOffice: firstPast ? firstPast.appliedPassportOffice : val.appliedPassportOffice,
      appliedReason: firstPast ? firstPast.appliedReason : val.appliedReason,
      pastApplications: val.pastApplications || []
    };

    this.stepComplete.emit(result);
  }
}
