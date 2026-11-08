import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EmergencyContact, EmergencyContactItem } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step5-emergency-contact',
  templateUrl: './step5-emergency-contact.component.html',
  styleUrls: ['./step5-emergency-contact.component.css']
})
export class Step5EmergencyContactComponent implements OnInit, OnDestroy {
  @Input() initialData!: EmergencyContact;
  @Output() stepComplete = new EventEmitter<EmergencyContact>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  private telemetrySub?: Subscription;

  primaryOpen = true;
  alternateOpen = true;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) { }

  toggleSection(sec: string): void {
    if (sec === 'primary') this.primaryOpen = !this.primaryOpen;
    if (sec === 'alternate') this.alternateOpen = !this.alternateOpen;
  }

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

    let defaultFatherName = 'RAMESH CHANDER SHARMA';
    let defaultFatherEmail = 'ramesh.sharma@example.gov.in';
    try {
      const stored = localStorage.getItem('passport_portal_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.fullName) {
          const parts = u.fullName.trim().split(/\s+/);
          if (parts.length > 1) {
            const surname = parts[parts.length - 1].toUpperCase();
            defaultFatherName = `RAMESH CHANDER ${surname}`;
            defaultFatherEmail = `family.${surname.toLowerCase()}@example.gov.in`;
          }
        }
      }
    } catch { }

    this.form = this.fb.group({
      contactName: [d?.contactName || defaultFatherName, [Validators.required]],
      relationship: [d?.relationship || 'FATHER', [Validators.required]],
      address: [d?.address || 'B-42, SECTOR 14, ROHINI, NEW DELHI 110085', [Validators.required]],
      mobileNumber: [d?.mobileNumber || '9810012345', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [d?.email || defaultFatherEmail, [Validators.email]],
      alternateContacts: this.fb.array([])
    });

    if (d?.alternateContacts && d.alternateContacts.length > 0) {
      d.alternateContacts.forEach(ac => this.addAlternateContact(ac));
    }

    // Direct Component tracking - logs with exact step5-emergency-contact.component.ts line number in DevTools
    console.warn('createEmergencyContactFormGroup:', this.form.getRawValue());
    console.warn('[Step5EmergencyContactComponent] Initialized FormGroup:', this.form);

    let previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.form.valueChanges.subscribe(currentValues => {
      ['contactName', 'relationship', 'address', 'mobileNumber', 'email'].forEach(field => {
        if (currentValues[field] !== previousValues[field]) {
          console.warn(`[Step5EmergencyContactComponent] Value changing for "${field}":`, {
            component: 'Step5EmergencyContactComponent',
            field: field,
            oldValue: previousValues[field],
            newValue: currentValues[field],
            formStatus: this.form.status,
            formGroup: this.form
          });
        }
      });

      const oldAlt: any[] = previousValues.alternateContacts || [];
      const newAlt: any[] = currentValues.alternateContacts || [];
      newAlt.forEach((alt, idx) => {
        const o = oldAlt[idx] || {};
        ['contactName', 'relationship', 'address', 'mobileNumber'].forEach(f => {
          if (alt[f] !== o[f]) {
            console.warn(`[Step5EmergencyContactComponent] Value changing for "alternateContacts[${idx}].${f}":`, {
              component: 'Step5EmergencyContactComponent',
              field: `alternateContacts[${idx}].${f}`,
              oldValue: o[f] || '(empty)',
              newValue: alt[f],
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
      'Step 5: Emergency Contacts Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  get alternateContactsArray(): FormArray {
    return this.form.get('alternateContacts') as FormArray;
  }

  addAlternateContact(data: Partial<EmergencyContactItem> = {}): void {
    const itemGroup = this.fb.group({
      contactName: [data.contactName || '', [Validators.required]],
      relationship: [data.relationship || 'MOTHER', [Validators.required]],
      address: [data.address || '', [Validators.required]],
      mobileNumber: [data.mobileNumber || '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [data.email || '', [Validators.email]]
    });

    this.alternateContactsArray.push(itemGroup);
    console.warn('this is coming::::::::', this.alternateContactsArray);
  }

  removeAlternateContact(index: number): void {
    this.alternateContactsArray.removeAt(index);
    console.warn('this is coming::::::::', this.alternateContactsArray);
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
