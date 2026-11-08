import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step3FamilyDetailsComponent } from './step3-family-details.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step3FamilyDetailsComponent', () => {
  let component: Step3FamilyDetailsComponent;
  let fixture: ComponentFixture<Step3FamilyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step3FamilyDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step3FamilyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize familyMembers FormArray with Father and Mother', () => {
    const array = component.familyMembersArray;
    expect(array).toBeTruthy();
    expect(array instanceof FormArray).toBeTrue();
    expect(array.length).toBeGreaterThanOrEqual(2);
    expect(array.at(0).get('relationship')?.value).toBe('FATHER');
    expect(array.at(1).get('relationship')?.value).toBe('MOTHER');
  });

  it('should dynamically add Legal Guardian to FormArray', () => {
    const initialLen = component.familyMembersArray.length;
    component.addMember('LEGAL_GUARDIAN');
    expect(component.familyMembersArray.length).toBe(initialLen + 1);
    const last = component.familyMembersArray.at(component.familyMembersArray.length - 1);
    expect(last.get('relationship')?.value).toBe('LEGAL_GUARDIAN');
  });

  it('should remove member from FormArray', () => {
    component.addMember('OTHER');
    const lenAfterAdd = component.familyMembersArray.length;
    component.removeMember(lenAfterAdd - 1);
    expect(component.familyMembersArray.length).toBe(lenAfterAdd - 1);
  });

  it('should adjust validators when singleParent is toggled to MOTHER_ONLY', () => {
    component.form.get('isSingleParent')?.setValue(true);
    component.form.get('singleParentType')?.setValue('MOTHER_ONLY');

    const fatherGroup = component.familyMembersArray.at(0);
    const motherGroup = component.familyMembersArray.at(1);

    expect(fatherGroup.get('givenName')?.validator).toBeNull();
    expect(motherGroup.get('givenName')?.validator).not.toBeNull();
  });
});
