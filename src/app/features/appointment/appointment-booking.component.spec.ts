import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentBookingComponent } from './appointment-booking.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PassportStateService } from '../../store/passport-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppointmentBookingComponent', () => {
  let component: AppointmentBookingComponent;
  let fixture: ComponentFixture<AppointmentBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AppointmentBookingComponent],
      providers: [PassportStateService, NotificationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentBookingComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
