import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { AuthService } from '../../core/services/auth.service';
import { PassportApplication } from '../../core/models/passport.model';
import { NotificationService } from '../../core/services/notification.service';
import { CanComponentDeactivate } from '../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-application-container',
  templateUrl: './application-container.component.html',
  styleUrls: ['./application-container.component.css']
})
export class ApplicationContainerComponent implements OnInit, CanComponentDeactivate {
  currentStep = 1;
  maxReachedStep = 9;
  currentDraft!: PassportApplication;
  isSubmitted = false;
  showDraftAlertModal = false;

  subTabs = [
    { step: 1, title: 'Service Type' },
    { step: 2, title: 'Personal Info' },
    { step: 3, title: 'Family Details' },
    { step: 4, title: 'Address History' },
    { step: 5, title: 'Emergency Contact' },
    { step: 6, title: 'Previous Passport' },
    { step: 7, title: 'Declarations' },
    { step: 8, title: 'Documents' },
    { step: 9, title: 'Review & Submit' }
  ];

  constructor(
    private stateService: PassportStateService,
    private authService: AuthService,
    private notify: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    let draft = this.stateService.currentDraft();
    if (!draft || draft.status !== 'DRAFT') {
      draft = this.stateService.initNewDraft();
    } else if (user && user.role === 'CITIZEN') {
      // Ensure the active draft reflects the current logged in citizen
      this.stateService.syncDraftWithUser(user);
      draft = this.stateService.currentDraft()!;
    }
    this.currentDraft = draft;
    this.currentStep = draft.currentStep || 1;
    this.maxReachedStep = Math.max(this.currentStep, 9);
  }

  canDeactivate(): boolean {
    if (this.isSubmitted) return true;
    return confirm('You have an active passport application in progress. Do you wish to leave? Your progress is saved as a draft.');
  }

  onStepperStepChange(step: number): void {
    this.currentStep = step;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep(): void {
    if (this.currentStep < 9) {
      this.currentStep++;
      this.maxReachedStep = Math.max(this.maxReachedStep, this.currentStep);
    }
  }

  onStep1Complete(data: any): void {
    this.currentDraft.serviceType = data;
    this.stateService.saveDraftStep(1, { serviceType: data });
    this.nextStep();
  }

  onStep2Complete(data: any): void {
    this.currentDraft.personalDetails = data;
    this.stateService.saveDraftStep(2, { personalDetails: data });
    this.nextStep();
  }

  onStep3Complete(data: any): void {
    this.currentDraft.familyDetails = data;
    this.stateService.saveDraftStep(3, { familyDetails: data });
    this.nextStep();
  }

  onStep4Complete(data: any): void {
    this.currentDraft.addressDetails = data;
    this.stateService.saveDraftStep(4, { addressDetails: data });
    this.nextStep();
  }

  onStep5Complete(data: any): void {
    this.currentDraft.emergencyContact = data;
    this.stateService.saveDraftStep(5, { emergencyContact: data });
    this.nextStep();
  }

  onStep6Complete(data: any): void {
    this.currentDraft.previousPassport = data;
    this.stateService.saveDraftStep(6, { previousPassport: data });
    this.nextStep();
  }

  onStep7Complete(data: any): void {
    this.currentDraft.declarations = data;
    this.stateService.saveDraftStep(7, { declarations: data });
    this.nextStep();
  }

  onStep8Complete(data: any): void {
    this.currentDraft.documents = data;
    this.stateService.saveDraftStep(8, { documents: data });
    this.nextStep();
  }

  manualSaveDraft(): void {
    this.stateService.saveDraftStep(this.currentStep, this.currentDraft);
    console.warn('Draft Application:', this.currentDraft);
    console.warn('final payload:', JSON.parse(JSON.stringify(this.currentDraft)));
    this.showDraftAlertModal = true;
  }

  exitToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmitFinal(): void {
    this.isSubmitted = true;
    const arn = this.stateService.submitApplication();
    this.router.navigate(['/appointment'], { queryParams: { arn: arn } });
  }
}

