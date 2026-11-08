import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepperComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
