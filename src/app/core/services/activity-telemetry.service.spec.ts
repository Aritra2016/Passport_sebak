import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityTelemetryService } from './activity-telemetry.service';

describe('ActivityTelemetryService', () => {
  let service: ActivityTelemetryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityTelemetryService]
    });

    service = TestBed.inject(ActivityTelemetryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send HTTP request to Network tab for telemetry events', () => {
    service.dispatchNetworkEvent('VALUE', 'TEST_VALUE_CHANGE', { field: 'givenName', value: 'AARAV' });

    const req = httpMock.expectOne('/api/telemetry/test-value-change');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-Telemetry-Type')).toBe('TEST_VALUE_CHANGE');
    expect(req.request.body.payload.field).toBe('givenName');

    req.flush({ success: true, eventId: 'evt_123' });
    expect(service.stats().networkRequestsSent).toBe(1);
  });

  it('should toggle tracking active state', () => {
    expect(service.isTrackingActive()).toBeTrue();
    service.toggleTracking();
    expect(service.isTrackingActive()).toBeFalse();
    service.toggleTracking();
    expect(service.isTrackingActive()).toBeTrue();
  });

  it('should clear stored events and stats', () => {
    service.dispatchNetworkEvent('MOUSE', 'TEST_CLICK', { x: 100, y: 200 });
    const req = httpMock.expectOne('/api/telemetry/test-click');
    req.flush({ success: true });

    expect(service.events().length).toBeGreaterThan(0);
    service.clearEvents();
    expect(service.events().length).toBe(0);
    expect(service.stats().total).toBe(0);
  });
});

