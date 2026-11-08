import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notify: NotificationService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected network error occurred.';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              errorMessage = 'Your session has expired. Please log in again.';
              this.authService.logout();
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'Requested government record or endpoint was not found.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'Server is currently undergoing scheduled maintenance. Please try again.';
              break;
            default:
              errorMessage = error.error?.message || `Service error (Code: ${error.status})`;
          }
        }

        this.notify.error(errorMessage, 'Service Alert');
        return throwError(() => error);
      })
    );
  }
}

