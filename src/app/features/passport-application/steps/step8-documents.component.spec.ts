import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step8DocumentsComponent } from './step8-documents.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step8DocumentsComponent', () => {
  let component: Step8DocumentsComponent;
  let fixture: ComponentFixture<Step8DocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Step8DocumentsComponent],
      providers: [NotificationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step8DocumentsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
