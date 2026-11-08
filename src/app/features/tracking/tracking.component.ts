import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { ApplicationStatus, PassportApplication } from '../../core/models/passport.model';
import { NotificationService } from '../../core/services/notification.service';

export interface PipelineStageUI {
  stageNumber: number;
  title: string;
  subTitle: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  dateStr?: string;
  description: string;
  officerRemarks?: string;
  icon: string;
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  searchArn = '';
  searchDob = '1995-08-15';
  activeApplication?: PassportApplication;
  pipelineStages: PipelineStageUI[] = [];

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [val]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [val]);
    }
  }

  constructor(
    public stateService: PassportStateService,
    private route: ActivatedRoute,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const queryArn = this.route.snapshot.queryParams['arn'];
    const apps = this.stateService.applications();

    if (queryArn) {
      this.searchArn = queryArn;
    } else if (apps.length > 0) {
      this.searchArn = apps[0].arn;
    }

    this.onTrack();
  }

  selectApplication(app: PassportApplication): void {
    this.searchArn = app.arn;
    this.searchDob = app.personalDetails.dateOfBirth;
    this.activeApplication = app;
    this.buildPipeline();
  }

  onTrack(): void {
    if (!this.searchArn) return;
    this.activeApplication = this.stateService.getApplicationByArn(this.searchArn);
    if (this.activeApplication) {
      this.buildPipeline();
    } else {
      this.notify.error('No record found matching the entered ARN. Please verify.', 'Record Not Found');
    }
  }

  simulateStatus(newStatus: ApplicationStatus): void {
    if (!this.activeApplication) return;
    const trackingNo = newStatus === 'DISPATCHED' ? `EM${Math.floor(100000000 + Math.random() * 900000000)}IN` : undefined;
    this.stateService.updateApplicationStatus(this.activeApplication.arn, newStatus, trackingNo);
    this.activeApplication = this.stateService.getApplicationByArn(this.activeApplication.arn);
    this.buildPipeline();
  }

  buildPipeline(): void {
    if (!this.activeApplication) return;
    const s = this.activeApplication.status;

    // Ordered stages mapping
    // 1: SUBMITTED
    // 2: APPOINTMENT_ATTENDED
    // 3: POLICE_VERIFICATION_INITIATED
    // 4: PASSPORT_PRINTED
    // 5: DISPATCHED

    const stageRank: Record<string, number> = {
      'DRAFT': 0,
      'SUBMITTED': 1,
      'APPOINTMENT_SCHEDULED': 1,
      'APPOINTMENT_ATTENDED': 2,
      'POLICE_VERIFICATION_INITIATED': 3,
      'POLICE_VERIFIED': 3.5,
      'PASSPORT_PRINTED': 4,
      'DISPATCHED': 5
    };

    const currentRank = stageRank[s] ?? 1;

    const getStatus = (targetRank: number): 'COMPLETED' | 'CURRENT' | 'PENDING' => {
      if (currentRank > targetRank) return 'COMPLETED';
      if (Math.floor(currentRank) === targetRank) return 'CURRENT';
      return 'PENDING';
    };

    this.pipelineStages = [
      {
        stageNumber: 1,
        title: 'Application Submitted & Fee Paid',
        subTitle: getStatus(1) === 'COMPLETED' ? 'Completed' : (getStatus(1) === 'CURRENT' ? 'In Progress' : 'Pending'),
        status: getStatus(1),
        dateStr: '15 Oct 2026, 11:30 AM',
        description: 'Online application submitted successfully. Payment verified and appointment slot allocated.',
        icon: '📝'
      },
      {
        stageNumber: 2,
        title: 'Appointment Attended & Biometrics Captured',
        subTitle: getStatus(2) === 'COMPLETED' ? 'Completed' : (getStatus(2) === 'CURRENT' ? 'At PSK Counter' : 'Pending'),
        status: getStatus(2),
        dateStr: currentRank >= 2 ? '22 Oct 2026, 10:15 AM' : undefined,
        description: 'Applicant appeared at Passport Seva Kendra (PSK Herald House). Digital photo, fingerprints, and original documents verified.',
        officerRemarks: currentRank >= 2 ? 'All original documents verified at Counter C. File granted for police verification.' : undefined,
        icon: '🏢'
      },
      {
        stageNumber: 3,
        title: 'Police Verification Initiated',
        subTitle: getStatus(3) === 'COMPLETED' ? 'Completed' : (getStatus(3) === 'CURRENT' ? 'Field Verification Active' : 'Pending'),
        status: getStatus(3),
        dateStr: currentRank >= 3 ? '24 Oct 2026, 02:00 PM' : undefined,
        description: `Electronic verification dispatch sent to Special Branch and ${this.activeApplication.addressDetails.policeStation}.`,
        officerRemarks: currentRank >= 3.5 ? 'Clear report submitted by investigating police officer. No adverse criminal record.' : 'Field verification visit scheduled by assigned beat officer.',
        icon: '👮'
      },
      {
        stageNumber: 4,
        title: 'Passport Printed & Quality Checked',
        subTitle: getStatus(4) === 'COMPLETED' ? 'Completed' : (getStatus(4) === 'CURRENT' ? 'Printing in Progress' : 'Pending'),
        status: getStatus(4),
        dateStr: currentRank >= 4 ? '28 Oct 2026, 04:45 PM' : undefined,
        description: 'Electronic booklet personalization at Security Printing Press, Nashik. Contactless chip encoded and quality check passed.',
        icon: '🖨️'
      },
      {
        stageNumber: 5,
        title: 'Dispatched via India Post Speed Post',
        subTitle: getStatus(5) === 'COMPLETED' || getStatus(5) === 'CURRENT' ? 'Dispatched' : 'Pending',
        status: getStatus(5),
        dateStr: currentRank >= 5 ? '30 Oct 2026, 09:30 AM' : undefined,
        description: `Passport package dispatched to registered residence address via India Post Speed Post. Consignment No: ${this.activeApplication.speedPostTrackingNo || 'EM849201849IN'}.`,
        icon: '✈️'
      }
    ];
  }

  trackSpeedPost(): void {
    this.notify.info(`Tracking Speed Post Consignment ${this.activeApplication?.speedPostTrackingNo || 'EM849201849IN'} on India Post National Hub.`, 'India Post Tracking');
  }
}

