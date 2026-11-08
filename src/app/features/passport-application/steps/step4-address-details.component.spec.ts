import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step4AddressDetailsComponent } from './step4-address-details.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step4AddressDetailsComponent', () => {
  let component: Step4AddressDetailsComponent;
  let fixture: ComponentFixture<Step4AddressDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step4AddressDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step4AddressDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize previousAddresses FormArray', () => {
    expect(component.previousAddressesArray).toBeTruthy();
    expect(component.previousAddressesArray instanceof FormArray).toBeTrue();
  });

  it('should dynamically add previous address to FormArray when residing duration is under 1 year', () => {
    component.form.get('residingSinceYear')?.setValue(0);
    component.onDurationChange();

    expect(component.isLessThanOneYear).toBeTrue();
    expect(component.previousAddressesArray.length).toBeGreaterThanOrEqual(1);

    const initialLen = component.previousAddressesArray.length;
    component.addPreviousAddress({
      houseNoAndStreet: 'Flat 99, Mall Road',
      villageOrCity: 'SHIMLA',
      state: 'HIMACHAL PRADESH',
      district: 'SHIMLA',
      policeStation: 'SADAR',
      pinCode: '171001',
      fromDate: '2024-01-01',
      toDate: '2024-12-31'
    });

    expect(component.previousAddressesArray.length).toBe(initialLen + 1);

    component.removePreviousAddress(initialLen);
    expect(component.previousAddressesArray.length).toBe(initialLen);
  });
});
