import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step7DeclarationsComponent } from './step7-declarations.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step7DeclarationsComponent', () => {
  let component: Step7DeclarationsComponent;
  let fixture: ComponentFixture<Step7DeclarationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [Step7DeclarationsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step7DeclarationsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
