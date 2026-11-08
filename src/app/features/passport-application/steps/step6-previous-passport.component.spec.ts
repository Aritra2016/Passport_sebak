import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step6PreviousPassportComponent } from './step6-previous-passport.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step6PreviousPassportComponent', () => {
  let component: Step6PreviousPassportComponent;
  let fixture: ComponentFixture<Step6PreviousPassportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step6PreviousPassportComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step6PreviousPassportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize pastApplications FormArray', () => {
    expect(component.pastApplicationsArray).toBeTruthy();
    expect(component.pastApplicationsArray instanceof FormArray).toBeTrue();
  });

  it('should dynamically manage pastApplications FormArray when hasAppliedAndNotIssued is toggled', () => {
    expect(component.pastApplicationsArray.length).toBe(0);

    component.form.get('hasAppliedAndNotIssued')?.setValue(true);
    expect(component.pastApplicationsArray.length).toBe(1);

    component.addPastApplication({
      fileNumber: 'DL1069820194821',
      appliedYear: '2022',
      appliedPassportOffice: 'RPO DELHI'
    });
    expect(component.pastApplicationsArray.length).toBe(2);

    component.removePastApplication(0);
    expect(component.pastApplicationsArray.length).toBe(1);

    component.form.get('hasAppliedAndNotIssued')?.setValue(false);
    expect(component.pastApplicationsArray.length).toBe(0);
  });
});
