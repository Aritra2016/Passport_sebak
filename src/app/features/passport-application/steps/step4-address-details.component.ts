import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddressDetails, AddressHistoryItem } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { pinCodeValidator } from '../../../shared/validators/pincode.validator';

@Component({
  selector: 'app-step4-address-details',
  templateUrl: './step4-address-details.component.html',
  styleUrls: ['./step4-address-details.component.css']
})
export class Step4AddressDetailsComponent implements OnInit, OnDestroy {
  @Input() initialData!: AddressDetails;
  @Output() stepComplete = new EventEmitter<AddressDetails>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  currentAddressGroup!: FormGroup;
  permanentAddressGroup!: FormGroup;

  isLessThanOneYear = false;
  private telemetrySub?: Subscription;

  // Accordion Sections (Matching EDE Dashboard Reference)
  presentOpen = true;
  permanentOpen = true;
  previousOpen = true;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) { }

  toggleSection(sec: string): void {
    if (sec === 'present') this.presentOpen = !this.presentOpen;
    if (sec === 'permanent') this.permanentOpen = !this.permanentOpen;
    if (sec === 'previous') this.previousOpen = !this.previousOpen;
  }

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + val, [val]);
  }

  ngOnInit(): void {
    const d = this.initialData;

    this.currentAddressGroup = this.fb.group({
      houseNoAndStreet: [d?.houseNoAndStreet || 'B-42, SECTOR 14, ROHINI', [Validators.required]],
      villageOrCity: [d?.villageOrCity || 'NEW DELHI', [Validators.required]],
      state: [d?.state || 'DELHI', [Validators.required]],
      district: [d?.district || 'NORTH WEST DELHI', [Validators.required]],
      policeStation: [d?.policeStation || 'PRASHANT VIHAR', [Validators.required]],
      pinCode: [d?.pinCode || '110085', [Validators.required, pinCodeValidator()]]
    });

    this.permanentAddressGroup = this.fb.group({
      houseNoAndStreet: [d?.permanentAddress?.houseNoAndStreet || ''],
      villageOrCity: [d?.permanentAddress?.villageOrCity || ''],
      state: [d?.permanentAddress?.state || ''],
      district: [d?.permanentAddress?.district || ''],
      policeStation: [d?.permanentAddress?.policeStation || ''],
      pinCode: [d?.permanentAddress?.pinCode || '', [pinCodeValidator()]]
    });

    let defaultEmail = 'citizen@example.gov.in';
    try {
      const stored = localStorage.getItem('passport_portal_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.email) defaultEmail = u.email;
      }
    } catch { }

    this.form = this.fb.group({
      currentAddress: this.currentAddressGroup,
      mobileNumber: [d?.mobileNumber || '9876543210', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [d?.email || defaultEmail, [Validators.required, Validators.email]],
      residingSinceYear: [d?.residingSinceYear ?? 4, [Validators.required]],
      residingSinceMonths: [d?.residingSinceMonths ?? 6, [Validators.required]],
      isPermanentSameAsCurrent: [d?.isPermanentSameAsCurrent ?? true],
      permanentAddress: this.permanentAddressGroup,
      previousAddresses: this.fb.array([])
    });

    if (d?.previousAddresses && d.previousAddresses.length > 0) {
      d.previousAddresses.forEach(prev => this.addPreviousAddress(prev));
    }

    this.onDurationChange();

    // Direct Component tracking - logs with exact step4-address-details.component.ts line number in DevTools
    console.warn('createAddressDetailsFormGroup:', this.form.getRawValue());
    console.warn('[Step4AddressDetailsComponent] Initialized FormGroup:', this.form);

    let previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.form.valueChanges.subscribe(currentValues => {
      // 1. Check currentAddress nested group
      const oldCur = previousValues.currentAddress || {};
      const newCur = currentValues.currentAddress || {};
      Object.keys(newCur).forEach(field => {
        if (newCur[field] !== oldCur[field]) {
          console.warn(`[Step4AddressDetailsComponent] Value changing for "currentAddress.${field}":`, {
            component: 'Step4AddressDetailsComponent',
            field: `currentAddress.${field}`,
            oldValue: oldCur[field] || '(empty)',
            newValue: newCur[field],
            formStatus: this.form.status,
            formGroup: this.form
          });
        }
      });

      // 2. Check root address fields
      ['mobileNumber', 'email', 'residingSinceYear', 'residingSinceMonths', 'isPermanentSameAsCurrent'].forEach(field => {
        if (currentValues[field] !== previousValues[field]) {
          console.warn(`[Step4AddressDetailsComponent] Value changing for "${field}":`, {
            component: 'Step4AddressDetailsComponent',
            field: field,
            oldValue: previousValues[field],
            newValue: currentValues[field],
            formStatus: this.form.status,
            formGroup: this.form
          });
        }
      });

      // 3. Check previousAddresses FormArray
      const oldPrev: any[] = previousValues.previousAddresses || [];
      const newPrev: any[] = currentValues.previousAddresses || [];
      newPrev.forEach((prev, idx) => {
        const o = oldPrev[idx] || {};
        ['houseNoAndStreet', 'villageOrCity', 'district', 'state', 'pinCode'].forEach(f => {
          if (prev[f] !== o[f]) {
            console.warn(`[Step4AddressDetailsComponent] Value changing for "previousAddresses[${idx}].${f}":`, {
              component: 'Step4AddressDetailsComponent',
              field: `previousAddresses[${idx}].${f}`,
              oldValue: o[f] || '(empty)',
              newValue: prev[f],
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
      'Step 4: Residential Address Details Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  get previousAddressesArray(): FormArray {
    return this.form.get('previousAddresses') as FormArray;
  }

  onDurationChange(): void {
    const years = Number(this.form.get('residingSinceYear')?.value || 0);
    this.isLessThanOneYear = years < 1;

    if (this.isLessThanOneYear && this.previousAddressesArray.length === 0) {
      this.addPreviousAddress({
        houseNoAndStreet: 'Flat 12, Kalka Road',
        villageOrCity: 'KALKA',
        state: 'HARYANA',
        district: 'PANCHKULA',
        policeStation: 'KALKA POLICE STATION',
        pinCode: '133302',
        fromDate: '2025-06-01',
        toDate: '2026-05-31'
      });
    }
  }

  addPreviousAddress(data?: Partial<AddressHistoryItem>): void {
    const itemGroup = this.fb.group({
      houseNoAndStreet: [data?.houseNoAndStreet || '', [Validators.required]],
      villageOrCity: [data?.villageOrCity || '', [Validators.required]],
      state: [data?.state || '', [Validators.required]],
      district: [data?.district || '', [Validators.required]],
      policeStation: [data?.policeStation || '', [Validators.required]],
      pinCode: [data?.pinCode || '', [Validators.required, pinCodeValidator()]],
      fromDate: [data?.fromDate || '', [Validators.required]],
      toDate: [data?.toDate || '', [Validators.required]]
    });

    this.previousAddressesArray.push(itemGroup);
    console.warn('this is coming::::::::', this.previousAddressesArray);
  }

  removePreviousAddress(index: number): void {
    this.previousAddressesArray.removeAt(index);
    console.warn('this is coming::::::::', this.previousAddressesArray);
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
    const result: AddressDetails = {
      houseNoAndStreet: val.currentAddress.houseNoAndStreet,
      villageOrCity: val.currentAddress.villageOrCity,
      state: val.currentAddress.state,
      district: val.currentAddress.district,
      policeStation: val.currentAddress.policeStation,
      pinCode: val.currentAddress.pinCode,
      mobileNumber: val.mobileNumber,
      email: val.email,
      isPermanentSameAsCurrent: val.isPermanentSameAsCurrent,
      permanentAddress: val.isPermanentSameAsCurrent ? undefined : val.permanentAddress,
      residingSinceYear: val.residingSinceYear,
      residingSinceMonths: val.residingSinceMonths,
      hasResidedLessThanOneYear: this.isLessThanOneYear,
      previousAddresses: val.previousAddresses || []
    };

    this.stepComplete.emit(result);
  }
}

