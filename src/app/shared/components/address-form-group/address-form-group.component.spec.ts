import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressFormGroupComponent } from './address-form-group.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddressFormGroupComponent', () => {
  let component: AddressFormGroupComponent;
  let fixture: ComponentFixture<AddressFormGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddressFormGroupComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressFormGroupComponent);
    component = fixture.componentInstance;

    const fb = new FormBuilder();
    component.addressGroup = fb.group({
      houseNoAndStreet: ['Flat 402, Barakhamba Road'],
      villageOrCity: ['New Delhi'],
      state: ['DELHI'],
      district: ['Central Delhi'],
      policeStation: ['Connaught Place'],
      pinCode: ['110001']
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
