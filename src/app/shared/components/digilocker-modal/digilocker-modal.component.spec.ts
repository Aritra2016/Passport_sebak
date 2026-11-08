import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DigilockerModalComponent } from './digilocker-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DigilockerModalComponent', () => {
  let component: DigilockerModalComponent;
  let fixture: ComponentFixture<DigilockerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DigilockerModalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DigilockerModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
