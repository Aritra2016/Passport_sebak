import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemetryInspectorComponent } from './telemetry-inspector.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TelemetryInspectorComponent', () => {
  let component: TelemetryInspectorComponent;
  let fixture: ComponentFixture<TelemetryInspectorComponent>;
  let telemetryService: ActivityTelemetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TelemetryInspectorComponent],
      providers: [ActivityTelemetryService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryInspectorComponent);
    component = fixture.componentInstance;
    telemetryService = TestBed.inject(ActivityTelemetryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle expansion state', () => {
    expect(component.isExpanded).toBeFalse();
    component.toggleExpand();
    expect(component.isExpanded).toBeTrue();
    component.toggleExpand();
    expect(component.isExpanded).toBeFalse();
  });

  it('should filter events by category', () => {
    component.setCategory('VALUE');
    expect(component.selectedCategory).toBe('VALUE');
  });

  it('should trigger test simulation events', () => {
    spyOn(telemetryService, 'dispatchNetworkEvent');
    component.triggerTestSimulation();
    expect(telemetryService.dispatchNetworkEvent).toHaveBeenCalledTimes(4);
  });
});

