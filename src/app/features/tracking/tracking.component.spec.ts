import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackingComponent } from './tracking.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PassportStateService } from '../../store/passport-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TrackingComponent', () => {
  let component: TrackingComponent;
  let fixture: ComponentFixture<TrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [TrackingComponent, StatusBadgePipe],
      providers: [PassportStateService, NotificationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
