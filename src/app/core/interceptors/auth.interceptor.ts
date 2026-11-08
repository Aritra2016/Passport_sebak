import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.authService.currentUser();
    const token = user?.token;

    if (!request.url.includes('/api/telemetry')) {
      console.log(`Interceptor called for URL:\n${request.url}`);
      if (token) {
        console.log('Handling request with token');
      }
    }

    let modifiedReq = request.clone({
      setHeaders: {
        'X-Portal-Client': 'PassportSeva-Portal-2026',
        'X-Portal-Env': environment.envName,
        'X-Portal-Version': environment.portalVersion,
        'X-Request-Timestamp': new Date().toISOString()
      }
    });

    if (token) {
      modifiedReq = modifiedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(modifiedReq);
  }
}

