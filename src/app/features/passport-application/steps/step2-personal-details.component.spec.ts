import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step2PersonalDetailsComponent } from './step2-personal-details.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step2PersonalDetailsComponent', () => {
  let component: Step2PersonalDetailsComponent;
  let fixture: ComponentFixture<Step2PersonalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step2PersonalDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step2PersonalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dynamically manage aliases FormArray when hasAlias is toggled', () => {
    expect(component.aliasesArray.length).toBe(0);
    component.form.get('hasAlias')?.setValue(true);
    expect(component.aliasesArray.length).toBe(1);

    component.addAlias('VIKKY', 'SHARMA');
    expect(component.aliasesArray.length).toBe(2);

    component.removeAlias(0);
    expect(component.aliasesArray.length).toBe(1);

    component.form.get('hasAlias')?.setValue(false);
    expect(component.aliasesArray.length).toBe(0);
  });

  it('should dynamically manage previousNames FormArray when hasChangedName is toggled', () => {
    expect(component.previousNamesArray.length).toBe(0);
    component.form.get('hasChangedName')?.setValue(true);
    expect(component.previousNamesArray.length).toBe(1);

    component.addPreviousName('VIKRAM', 'KUMAR');
    expect(component.previousNamesArray.length).toBe(2);

    component.removePreviousName(1);
    expect(component.previousNamesArray.length).toBe(1);
  });
});
