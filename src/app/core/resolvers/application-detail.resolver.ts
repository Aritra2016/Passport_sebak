import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PassportApplication } from '../models/passport.model';
import { PassportStateService } from '../../store/passport-state.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDetailResolve implements Resolve<PassportApplication | null> {
  constructor(
    private stateService: PassportStateService,
    private router: Router,
    private notify: NotificationService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PassportApplication | null> {
    const arn = route.paramMap.get('arn') || route.queryParamMap.get('arn');
    if (!arn) {
      return of(this.stateService.applications()[0] || null);
    }

    const app = this.stateService.getApplicationByArn(arn);
    if (!app) {
      this.notify.warning(`Application record for ${arn} was not found.`, 'Record Not Found');
      return of(null);
    }

    return of(app);
  }
}

