import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { AuthService } from '../../core/services/auth.service';
import { PassportApplication, UserRole } from '../../core/models/passport.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    public authService: AuthService,
    public stateService: PassportStateService,
    private router: Router
  ) {}

  totalApplicationsCount(): number {
    return this.stateService.applications().length;
  }

  scheduledAppointmentsCount(): number {
    return this.stateService.applications().filter(a => a.appointment !== undefined).length;
  }

  policeVerificationCount(): number {
    return this.stateService.applications().filter(
      a => a.status === 'POLICE_VERIFICATION_INITIATED' || a.status === 'APPOINTMENT_ATTENDED'
    ).length;
  }

  dispatchedCount(): number {
    return this.stateService.applications().filter(a => a.status === 'DISPATCHED').length;
  }

  startNewApplication(type: 'FRESH' | 'REISSUE'): void {
    this.stateService.initNewDraft(type);
    this.router.navigate(['/passport-application']);
  }

  continueDraft(app: PassportApplication): void {
    this.stateService.currentDraft.set(app);
    this.router.navigate(['/passport-application']);
  }

  bookAppointment(app: PassportApplication): void {
    this.stateService.currentDraft.set(app);
    this.router.navigate(['/appointment'], { queryParams: { arn: app.arn } });
  }

  makePayment(app: PassportApplication): void {
    this.stateService.currentDraft.set(app);
    this.router.navigate(['/payment'], { queryParams: { arn: app.arn } });
  }

  viewReceipt(app: PassportApplication): void {
    this.router.navigate(['/payment/receipt'], { queryParams: { arn: app.arn } });
  }

  trackApplication(arn: string): void {
    this.router.navigate(['/tracking'], { queryParams: { arn: arn } });
  }

  markBiometricsAttended(arn: string): void {
    this.stateService.updateApplicationStatus(arn, 'APPOINTMENT_ATTENDED');
    setTimeout(() => {
      this.stateService.updateApplicationStatus(arn, 'POLICE_VERIFICATION_INITIATED');
    }, 1000);
  }

  clearPoliceVerification(arn: string): void {
    this.stateService.updateApplicationStatus(arn, 'POLICE_VERIFIED');
  }

  printAndDispatch(arn: string): void {
    this.stateService.updateApplicationStatus(arn, 'PASSPORT_PRINTED');
    setTimeout(() => {
      const trackingNo = `EM${Math.floor(100000000 + Math.random() * 900000000)}IN`;
      this.stateService.updateApplicationStatus(arn, 'DISPATCHED', trackingNo);
    }, 1200);
  }
}

