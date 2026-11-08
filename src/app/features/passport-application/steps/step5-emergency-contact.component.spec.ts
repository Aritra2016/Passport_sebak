import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step5EmergencyContactComponent } from './step5-emergency-contact.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step5EmergencyContactComponent', () => {
  let component: Step5EmergencyContactComponent;
  let fixture: ComponentFixture<Step5EmergencyContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step5EmergencyContactComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step5EmergencyContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize alternateContacts FormArray', () => {
    expect(component.alternateContactsArray).toBeTruthy();
    expect(component.alternateContactsArray instanceof FormArray).toBeTrue();
    expect(component.alternateContactsArray.length).toBe(0);
  });

  it('should dynamically add and remove alternate contact from FormArray', () => {
    component.addAlternateContact({
      contactName: 'SUNITA SHARMA',
      relationship: 'MOTHER',
      address: 'B-42 ROHINI',
      mobileNumber: '9811122334',
      email: 'sunita@example.com'
    });

    expect(component.alternateContactsArray.length).toBe(1);
    expect(component.alternateContactsArray.at(0).get('contactName')?.value).toBe('SUNITA SHARMA');

    component.removeAlternateContact(0);
    expect(component.alternateContactsArray.length).toBe(0);
  });
});
