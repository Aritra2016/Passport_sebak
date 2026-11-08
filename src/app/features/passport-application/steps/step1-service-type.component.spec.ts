import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step1ServiceTypeComponent } from './step1-service-type.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step1ServiceTypeComponent', () => {
  let component: Step1ServiceTypeComponent;
  let fixture: ComponentFixture<Step1ServiceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step1ServiceTypeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step1ServiceTypeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
