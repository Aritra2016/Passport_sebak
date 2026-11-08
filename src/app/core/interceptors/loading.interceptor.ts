import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private notify: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.includes('/api/telemetry')) {
      if (this.activeRequests === 0) {
        console.log('Loader shown');
      }
    }

    if (this.activeRequests === 0) {
      this.notify.setLoading(true);
    }
    this.activeRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          if (!request.url.includes('/api/telemetry')) {
            console.log('Hiding loader (token path)');
          }
          this.notify.setLoading(false);
        }
      })
    );
  }
}

