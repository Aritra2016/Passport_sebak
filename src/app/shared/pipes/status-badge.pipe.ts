import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus } from '../../core/models/passport.model';

@Pipe({
  name: 'statusBadge'
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: ApplicationStatus | string | undefined): { text: string; cssClass: string } {
    if (!status) {
      return { text: 'Draft Incomplete', cssClass: 'status-draft' };
    }

    switch (status) {
      case 'DRAFT':
        return { text: 'Draft In Progress', cssClass: 'status-draft' };
      case 'SUBMITTED':
        return { text: 'Application Submitted', cssClass: 'status-submitted' };
      case 'APPOINTMENT_SCHEDULED':
        return { text: 'Appointment Scheduled', cssClass: 'status-appointment' };
      case 'APPOINTMENT_ATTENDED':
        return { text: 'Appointment Attended & Biometrics Captured', cssClass: 'status-attended' };
      case 'POLICE_VERIFICATION_INITIATED':
        return { text: 'Police Verification In Progress', cssClass: 'status-police' };
      case 'POLICE_VERIFIED':
        return { text: 'Police Verification Cleared', cssClass: 'status-verified' };
      case 'PASSPORT_PRINTED':
        return { text: 'Passport Printed & QC Passed', cssClass: 'status-printed' };
      case 'DISPATCHED':
        return { text: 'Dispatched via Speed Post', cssClass: 'status-dispatched' };
      default:
        return { text: status.replace(/_/g, ' '), cssClass: 'status-default' };
    }
  }
}

