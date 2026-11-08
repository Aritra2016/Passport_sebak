import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApplicantPersonalDetails } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { aadhaarValidator } from '../../../shared/validators/aadhaar.validator';
import { dobValidator, calculateAge } from '../../../shared/validators/dob.validator';

@Component({
  selector: 'app-step2-personal-details',
  templateUrl: './step2-personal-details.component.html',
  styleUrls: ['./step2-personal-details.component.css']
})
export class Step2PersonalDetailsComponent implements OnInit, OnDestroy {
  @Input() initialData!: ApplicantPersonalDetails;
  @Output() stepComplete = new EventEmitter<ApplicantPersonalDetails>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  applicantAge: number | null = null;
  private telemetrySub?: Subscription;

  // Accordion Section states (Matching EDE Dashboard Reference)
  demographicsOpen = true;
  birthDetailsOpen = true;
  aliasesOpen = true;
  prevNamesOpen = true;
  identifiersOpen = true;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) { }

  toggleSection(section: string): void {
    if (section === 'demographics') this.demographicsOpen = !this.demographicsOpen;
    if (section === 'birth') this.birthDetailsOpen = !this.birthDetailsOpen;
    if (section === 'aliases') this.aliasesOpen = !this.aliasesOpen;
    if (section === 'prevNames') this.prevNamesOpen = !this.prevNamesOpen;
    if (section === 'identifiers') this.identifiersOpen = !this.identifiersOpen;
  }

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + val, [val]);
  }

  ngOnInit(): void {
    const d = this.initialData;

    let defaultGiven = '';
    let defaultSurname = '';
    try {
      const stored = localStorage.getItem('passport_portal_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.fullName) {
          const parts = u.fullName.trim().split(/\s+/);
          defaultGiven = parts.length > 1 ? parts.slice(0, parts.length - 1).join(' ').toUpperCase() : parts[0].toUpperCase();
          defaultSurname = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
        }
      }
    } catch { }

    this.form = this.fb.group({
      givenName: [d?.givenName || defaultGiven, [Validators.required]],
      surname: [d?.surname || defaultSurname, [Validators.required]],
      hasAlias: [d?.hasAlias ?? false],
      aliasGivenName: [d?.aliasGivenName || ''],
      aliasSurname: [d?.aliasSurname || ''],
      aliases: this.fb.array([]),
      hasChangedName: [d?.hasChangedName ?? false],
      previousName: [d?.previousName || ''],
      previousNames: this.fb.array([]),
      dateOfBirth: [d?.dateOfBirth || '1995-08-15', [Validators.required, dobValidator()]],
      isBirthOutOfIndia: [d?.isBirthOutOfIndia ?? false],
      birthPlace: [d?.birthPlace || 'NEW DELHI', [Validators.required]],
      birthDistrict: [d?.birthDistrict || 'NEW DELHI', [Validators.required]],
      birthState: [d?.birthState || 'DELHI', [Validators.required]],
      birthCountry: [d?.birthCountry || 'INDIA', [Validators.required]],
      gender: [d?.gender || 'MALE', [Validators.required]],
      maritalStatus: [d?.maritalStatus || 'SINGLE', [Validators.required]],
      educationalQualification: [d?.educationalQualification || 'GRADUATE_AND_ABOVE', [Validators.required]],
      isNonEcrEligible: [d?.isNonEcrEligible ?? true],
      employmentType: [d?.employmentType || 'PRIVATE', [Validators.required]],
      panNumber: [d?.panNumber || ''],
      voterId: [d?.voterId || ''],
      aadhaarNumber: [d?.aadhaarNumber || '3675 9834 6012', [Validators.required, aadhaarValidator()]]
    });

    if (d?.hasAlias) {
      if (d.aliasesList && d.aliasesList.length > 0) {
        d.aliasesList.forEach(a => this.addAlias(a.givenName, a.surname));
      } else {
        this.addAlias(d.aliasGivenName || '', d.aliasSurname || '');
      }
    }

    if (d?.hasChangedName) {
      if (d.previousNamesList && d.previousNamesList.length > 0) {
        d.previousNamesList.forEach(p => this.addPreviousName(p.previousGivenName, p.previousSurname));
      } else {
        this.addPreviousName(d.previousName || '', '');
      }
    }

    this.setupDynamicConditionals();
    this.onDobChange();

    // Direct Component tracking - logs with exact step2-personal-details.component.ts line number in DevTools
    console.warn('createPersonalDetailsFormGroup:', this.form.getRawValue());
    console.warn('[Step2PersonalDetailsComponent] Initialized FormGroup:', this.form);

    let previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.form.valueChanges.subscribe(currentValues => {
      // 1. Check scalar form controls
      Object.keys(currentValues).forEach(key => {
        if (key !== 'aliases' && key !== 'previousNames') {
          const oldVal = previousValues[key];
          const newVal = currentValues[key];
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            console.warn(`[Step2PersonalDetailsComponent] Value changing for "${key}":`, {
              component: 'Step2PersonalDetailsComponent',
              field: key,
              oldValue: oldVal,
              newValue: newVal,
              formStatus: this.form.status,
              formGroup: this.form
            });
          }
        }
      });

      // 2. Check aliases FormArray
      const oldAliases: any[] = previousValues.aliases || [];
      const newAliases: any[] = currentValues.aliases || [];
      newAliases.forEach((alias, idx) => {
        const oldAlias = oldAliases[idx] || {};
        ['givenName', 'surname'].forEach(field => {
          if (alias[field] !== oldAlias[field]) {
            console.warn(`[Step2PersonalDetailsComponent] Value changing for "aliases[${idx}].${field}":`, {
              component: 'Step2PersonalDetailsComponent',
              field: `aliases[${idx}].${field}`,
              oldValue: oldAlias[field] || '(empty)',
              newValue: alias[field],
              formStatus: this.form.status,
              formGroup: this.form
            });
          }
        });
      });

      // 3. Check previousNames FormArray
      const oldPrev: any[] = previousValues.previousNames || [];
      const newPrev: any[] = currentValues.previousNames || [];
      newPrev.forEach((prevItem, idx) => {
        const oldP = oldPrev[idx] || {};
        ['previousGivenName', 'previousSurname'].forEach(field => {
          if (prevItem[field] !== oldP[field]) {
            console.warn(`[Step2PersonalDetailsComponent] Value changing for "previousNames[${idx}].${field}":`, {
              component: 'Step2PersonalDetailsComponent',
              field: `previousNames[${idx}].${field}`,
              oldValue: oldP[field] || '(empty)',
              newValue: prevItem[field],
              formStatus: this.form.status,
              formGroup: this.form
            });
          }
        });
      });

      previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    });

    // Also register with telemetry engine for Network tab tracking
    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.form,
      'Step 2: Applicant Personal Particulars Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  get aliasesArray(): FormArray {
    return this.form.get('aliases') as FormArray;
  }

  get previousNamesArray(): FormArray {
    return this.form.get('previousNames') as FormArray;
  }

  addAlias(givenName = '', surname = ''): void {
    this.aliasesArray.push(this.fb.group({
      givenName: [givenName, Validators.required],
      surname: [surname, Validators.required]
    }));
    console.warn('[Step2PersonalDetailsComponent] this is coming:::::::: FormArray "aliases"', this.aliasesArray);
  }

  removeAlias(index: number): void {
    this.aliasesArray.removeAt(index);
    console.warn(`[Step2PersonalDetailsComponent] FormArray "aliases" removed index ${index}:`, this.aliasesArray);
  }

  addPreviousName(previousGivenName = '', previousSurname = ''): void {
    this.previousNamesArray.push(this.fb.group({
      previousGivenName: [previousGivenName, Validators.required],
      previousSurname: [previousSurname]
    }));
    console.warn('[Step2PersonalDetailsComponent] this is coming:::::::: FormArray "previousNames"', this.previousNamesArray);
  }

  removePreviousName(index: number): void {
    this.previousNamesArray.removeAt(index);
    console.warn(`[Step2PersonalDetailsComponent] FormArray "previousNames" removed index ${index}:`, this.previousNamesArray);
  }

  private setupDynamicConditionals(): void {
    this.form.get('hasAlias')?.valueChanges.subscribe(hasAlias => {
      if (hasAlias) {
        if (this.aliasesArray.length === 0) {
          this.addAlias();
        }
      } else {
        this.aliasesArray.clear();
      }
    });

    this.form.get('hasChangedName')?.valueChanges.subscribe(hasChanged => {
      if (hasChanged) {
        if (this.previousNamesArray.length === 0) {
          this.addPreviousName();
        }
      } else {
        this.previousNamesArray.clear();
      }
    });
  }

  onDobChange(): void {
    const dob = this.form.get('dateOfBirth')?.value;
    if (dob) {
      this.applicantAge = calculateAge(dob);
    }
  }

  onEducationChange(): void {
    const edu = this.form.get('educationalQualification')?.value;
    const isNonEcr = edu === 'GRADUATE_AND_ABOVE' || edu === '10TH_AND_ABOVE';
    this.form.get('isNonEcrEligible')?.setValue(isNonEcr);
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
    // Keep first alias and previous name in scalar fields for backward compatibility
    const firstAlias = val.aliases && val.aliases.length > 0 ? val.aliases[0] : null;
    const firstPrev = val.previousNames && val.previousNames.length > 0 ? val.previousNames[0] : null;

    const result: ApplicantPersonalDetails = {
      ...val,
      aliasGivenName: firstAlias ? firstAlias.givenName : val.aliasGivenName,
      aliasSurname: firstAlias ? firstAlias.surname : val.aliasSurname,
      previousName: firstPrev ? `${firstPrev.previousGivenName} ${firstPrev.previousSurname || ''}`.trim() : val.previousName,
      aliasesList: val.aliases || [],
      previousNamesList: val.previousNames || []
    };

    this.stepComplete.emit(result);
  }
}
