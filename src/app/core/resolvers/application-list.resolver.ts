import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PassportApplication } from '../models/passport.model';
import { PassportStateService } from '../../store/passport-state.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationListResolve implements Resolve<PassportApplication[]> {
  constructor(private stateService: PassportStateService) {}

  resolve(): Observable<PassportApplication[]> {
    return of(this.stateService.applications());
  }
}

