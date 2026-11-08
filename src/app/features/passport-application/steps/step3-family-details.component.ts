import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FamilyDetails, FamilyMemberItem } from '../../../core/models/passport.model';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step3-family-details',
  templateUrl: './step3-family-details.component.html',
  styleUrls: ['./step3-family-details.component.css']
})
export class Step3FamilyDetailsComponent implements OnInit, OnDestroy {
  @Input() initialData!: FamilyDetails;
  @Output() stepComplete = new EventEmitter<FamilyDetails>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  private telemetrySub?: Subscription;

  // Accordion Sections (Matching EDE Dashboard Reference)
  fatherOpen = true;
  motherOpen = true;
  additionalOpen = true;

  constructor(
    private fb: FormBuilder,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) { }

  toggleSection(sec: string): void {
    if (sec === 'father') this.fatherOpen = !this.fatherOpen;
    if (sec === 'mother') this.motherOpen = !this.motherOpen;
    if (sec === 'additional') this.additionalOpen = !this.additionalOpen;
  }

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + val, [val]);
  }

  ngOnInit(): void {
    const d = this.initialData;

    this.form = this.fb.group({
      isSingleParent: [d?.isSingleParent ?? false],
      singleParentType: [d?.singleParentType || 'MOTHER_ONLY'],
      familyMembers: this.fb.array([])
    });

    this.initFamilyMembers(d);
    this.setupSingleParentSync();

    // Direct Component tracking - logs with exact step3-family-details.component.ts line number in DevTools
    console.warn('createFamilyDetailsFormGroup:', this.form.getRawValue());
    console.warn('[Step3FamilyDetailsComponent] Initialized FormGroup:', this.form);
    console.warn('this is coming::::::::', this.familyMembersArray);

    let previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.form.valueChanges.subscribe(currentValues => {
      // 1. Check root controls (isSingleParent, singleParentType)
      ['isSingleParent', 'singleParentType'].forEach(key => {
        const oldVal = previousValues[key];
        const newVal = currentValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          console.warn(`[Step3FamilyDetailsComponent] Value changing for "${key}":`, {
            component: 'Step3FamilyDetailsComponent',
            field: key,
            oldValue: oldVal,
            newValue: newVal,
            formStatus: this.form.status,
            formGroup: this.form
          });
        }
      });

      // 2. Check familyMembers FormArray items (Father, Mother, Legal Guardian, Spouse)
      const oldMembers: any[] = previousValues.familyMembers || [];
      const newMembers: any[] = currentValues.familyMembers || [];

      newMembers.forEach((member, idx) => {
        const oldMember = oldMembers[idx] || {};
        ['relationship', 'givenName', 'surname', 'nationality'].forEach(field => {
          if (member[field] !== oldMember[field]) {
            const relLabel = member.relationship || `Member #${idx + 1}`;
            console.warn(`[Step3FamilyDetailsComponent] Value changing for "${relLabel} -> ${field}":`, {
              component: 'Step3FamilyDetailsComponent',
              memberIndex: idx,
              relationship: member.relationship,
              field: field,
              oldValue: oldMember[field] || '(empty)',
              newValue: member[field],
              formStatus: this.form.status,
              formGroup: this.form,
              memberGroup: this.familyMembersArray.at(idx)
            });
          }
        });
      });

      // Store deep clone for accurate subsequent comparisons
      previousValues = JSON.parse(JSON.stringify(this.form.getRawValue()));
    });

    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.form,
      'Step 3: Family Details Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  get familyMembersArray(): FormArray {
    return this.form.get('familyMembers') as FormArray;
  }

  createMemberGroup(member: Partial<FamilyMemberItem> = {}): FormGroup {
    const isFather = member.relationship === 'FATHER';
    const isMother = member.relationship === 'MOTHER';
    const isSingle = this.form?.get('isSingleParent')?.value;
    const singleType = this.form?.get('singleParentType')?.value;

    let isRequired = false;
    if (isFather) {
      isRequired = !isSingle || singleType === 'FATHER_ONLY';
    } else if (isMother) {
      isRequired = !isSingle || singleType === 'MOTHER_ONLY';
    }

    return this.fb.group({
      relationship: [member.relationship || 'OTHER', Validators.required],
      givenName: [member.givenName || '', isRequired ? [Validators.required] : []],
      surname: [member.surname || '', isRequired ? [Validators.required] : []],
      nationality: [member.nationality || 'INDIAN']
    });
  }

  private initFamilyMembers(d?: FamilyDetails): void {
    let defaultSurname = 'SHARMA';
    try {
      const stored = localStorage.getItem('passport_portal_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.fullName) {
          const parts = u.fullName.trim().split(/\s+/);
          if (parts.length > 1) defaultSurname = parts[parts.length - 1].toUpperCase();
        }
      }
    } catch { }

    if (d?.familyMembers && d.familyMembers.length > 0) {
      d.familyMembers.forEach(m => this.familyMembersArray.push(this.createMemberGroup(m)));
    } else {
      this.familyMembersArray.push(this.createMemberGroup({
        relationship: 'FATHER',
        givenName: d?.fatherGivenName || 'RAMESH CHANDER',
        surname: d?.fatherSurname || defaultSurname
      }));

      this.familyMembersArray.push(this.createMemberGroup({
        relationship: 'MOTHER',
        givenName: d?.motherGivenName || 'SUNITA',
        surname: d?.motherSurname || defaultSurname
      }));

      if (d?.legalGuardianGivenName) {
        this.familyMembersArray.push(this.createMemberGroup({
          relationship: 'LEGAL_GUARDIAN',
          givenName: d.legalGuardianGivenName,
          surname: d.legalGuardianSurname || ''
        }));
      }

      if (d?.spouseGivenName) {
        this.familyMembersArray.push(this.createMemberGroup({
          relationship: 'SPOUSE',
          givenName: d.spouseGivenName,
          surname: d.spouseSurname || ''
        }));
      }
    }
  }

  addMember(rel: 'LEGAL_GUARDIAN' | 'SPOUSE' | 'OTHER'): void {
    const exists = this.familyMembersArray.controls.some(
      c => c.get('relationship')?.value === rel && rel !== 'OTHER'
    );
    if (exists && rel !== 'OTHER') {
      return;
    }
    const newGroup = this.createMemberGroup({ relationship: rel });
    this.familyMembersArray.push(newGroup);
    console.warn('createCommonVlanFormGroup:', newGroup.value);
    console.warn('this is coming::::::::', this.familyMembersArray);
  }

  removeMember(index: number): void {
    this.familyMembersArray.removeAt(index);
    console.warn('this is coming::::::::', this.familyMembersArray);
  }

  isRemovable(index: number): boolean {
    const rel = this.familyMembersArray.at(index)?.get('relationship')?.value;
    return rel !== 'FATHER' && rel !== 'MOTHER';
  }

  private setupSingleParentSync(): void {
    const updateValidators = () => {
      const isSingle = this.form.get('isSingleParent')?.value;
      const type = this.form.get('singleParentType')?.value;

      this.familyMembersArray.controls.forEach(control => {
        const group = control as FormGroup;
        const rel = group.get('relationship')?.value;
        const given = group.get('givenName');
        const surname = group.get('surname');

        if (rel === 'FATHER') {
          if (isSingle && type === 'MOTHER_ONLY') {
            given?.clearValidators();
            surname?.clearValidators();
          } else {
            given?.setValidators([Validators.required]);
            surname?.setValidators([Validators.required]);
          }
        } else if (rel === 'MOTHER') {
          if (isSingle && type === 'FATHER_ONLY') {
            given?.clearValidators();
            surname?.clearValidators();
          } else {
            given?.setValidators([Validators.required]);
            surname?.setValidators([Validators.required]);
          }
        }
        given?.updateValueAndValidity();
        surname?.updateValueAndValidity();
      });
    };

    this.form.get('isSingleParent')?.valueChanges.subscribe(updateValidators);
    this.form.get('singleParentType')?.valueChanges.subscribe(updateValidators);
  }

  isMemberVisible(index: number): boolean {
    const group = this.familyMembersArray.at(index) as FormGroup;
    const rel = group.get('relationship')?.value;
    const isSingle = this.form.get('isSingleParent')?.value;
    const type = this.form.get('singleParentType')?.value;

    if (rel === 'FATHER' && isSingle && type === 'MOTHER_ONLY') {
      return false;
    }
    if (rel === 'MOTHER' && isSingle && type === 'FATHER_ONLY') {
      return false;
    }
    return true;
  }

  getLabel(relationship: string): string {
    switch (relationship) {
      case 'FATHER': return "Father's Legal Particulars";
      case 'MOTHER': return "Mother's Legal Particulars";
      case 'LEGAL_GUARDIAN': return "Legal Guardian's Details";
      case 'SPOUSE': return "Spouse Details (If Married)";
      default: return "Additional Family Member / Relative";
    }
  }

  hasMember(rel: string): boolean {
    return this.familyMembersArray.controls.some(c => c.get('relationship')?.value === rel);
  }

  onPrev(): void {
    this.prevStep.emit();
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const members: FamilyMemberItem[] = this.familyMembersArray.value;
    const father = members.find(m => m.relationship === 'FATHER');
    const mother = members.find(m => m.relationship === 'MOTHER');
    const guardian = members.find(m => m.relationship === 'LEGAL_GUARDIAN');
    const spouse = members.find(m => m.relationship === 'SPOUSE');

    const result: FamilyDetails = {
      isSingleParent: this.form.get('isSingleParent')?.value,
      singleParentType: this.form.get('singleParentType')?.value,
      fatherGivenName: father?.givenName || '',
      fatherSurname: father?.surname || '',
      motherGivenName: mother?.givenName || '',
      motherSurname: mother?.surname || '',
      legalGuardianGivenName: guardian?.givenName || '',
      legalGuardianSurname: guardian?.surname || '',
      spouseGivenName: spouse?.givenName || '',
      spouseSurname: spouse?.surname || '',
      familyMembers: members
    };

    this.stepComplete.emit(result);
  }
}
