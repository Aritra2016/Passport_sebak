import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationContainerComponent } from './application-container.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PassportStateService } from '../../store/passport-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ApplicationContainerComponent', () => {
  let component: ApplicationContainerComponent;
  let fixture: ComponentFixture<ApplicationContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ApplicationContainerComponent],
      providers: [PassportStateService, NotificationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
