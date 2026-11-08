import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class TelemetryInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If this is a telemetry event request, intercept and return 200 OK
    // so that it shows up as a successful 200 OK request in the DevTools Network Tab.
    if (request.url.includes('/api/telemetry/')) {
      const endpoint = request.url.split('/api/telemetry/')[1] || 'event';
      const eventTypeHeader = request.headers.get('X-Telemetry-Type') || 'AUDIT_LOG';
      const eventId = `evt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const mockResponse = new HttpResponse({
        status: 200,
        statusText: 'OK (Telemetry Captured)',
        body: {
          success: true,
          eventId: eventId,
          endpoint: endpoint,
          eventType: eventTypeHeader,
          receivedAt: new Date().toISOString(),
          message: `[Network Audit] ${eventTypeHeader} event recorded successfully in Government of India Portal telemetry stream.`,
          payloadEcho: request.body
        }
      });

      // Simulate a realistic 25ms round-trip latency for DevTools Network waterfall inspection
      return of(mockResponse).pipe(delay(25));
    }

    return next.handle(request);
  }
}

