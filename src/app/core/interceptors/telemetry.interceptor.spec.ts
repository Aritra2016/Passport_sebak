import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TelemetryInterceptor } from './telemetry.interceptor';

describe('TelemetryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TelemetryInterceptor, multi: true }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should intercept /api/telemetry/ requests and return 200 OK without hitting backend', (done) => {
    http.post<any>('/api/telemetry/mouse-event', { test: true }).subscribe({
      next: (response) => {
        expect(response.success).toBeTrue();
        expect(response.endpoint).toBe('mouse-event');
        done();
      }
    });

    // In unit test environment, the mock response is returned via rxjs 'of' with delay
    // No request should be pending in httpMock because TelemetryInterceptor returns mock Observable directly
    httpMock.expectNone('/api/telemetry/mouse-event');
  });
});

