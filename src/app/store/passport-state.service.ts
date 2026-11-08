import { Injectable, computed, effect, signal } from '@angular/core';
import {
  PassportApplication,
  AppointmentSlot,
  PaymentDetails,
  ApplicationStatus,
  ServiceTypeDetails,
  ApplicantPersonalDetails,
  FamilyDetails,
  AddressDetails,
  EmergencyContact,
  PreviousPassportDetails,
  LegalDeclarations,
  UploadedDocument
} from '../core/models/passport.model';
import { NotificationService } from '../core/services/notification.service';

const DRAFT_STORAGE_KEY = 'passport_portal_active_draft';
const APPS_STORAGE_KEY = 'passport_portal_all_applications';

@Injectable({
  providedIn: 'root'
})
export class PassportStateService {
  // Signals
  readonly currentDraft = signal<PassportApplication | null>(null);
  readonly applications = signal<PassportApplication[]>([]);
  readonly activeSlotHold = signal<AppointmentSlot | null>(null);
  readonly slotHoldExpiresAt = signal<number | null>(null);
  readonly slotRemainingSeconds = signal<number>(0);

  private slotTimerInterval: any = null;

  // Computed signals
  readonly isSlotHeld = computed(() => this.slotRemainingSeconds() > 0 && !!this.activeSlotHold());

  readonly formattedSlotTimer = computed(() => {
    const total = this.slotRemainingSeconds();
    if (total <= 0) return '00:00';
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  readonly hasDraft = computed(() => !!this.currentDraft());

  constructor(private notify: NotificationService) {
    this.loadInitialState();

    // Effect to persist draft whenever it changes
    effect(() => {
      const draft = this.currentDraft();
      if (draft) {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
          console.error('Failed to auto-save draft to localStorage', e);
        }
      }
    });

    // Effect to persist applications list
    effect(() => {
      const list = this.applications();
      try {
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save applications list', e);
      }
    });
  }

  private loadInitialState(): void {
    // 1. Load Applications
    let loadedApps: PassportApplication[] = [];
    try {
      const storedApps = localStorage.getItem(APPS_STORAGE_KEY);
      if (storedApps) {
        loadedApps = JSON.parse(storedApps);
      }
    } catch { }

    if (loadedApps.length === 0) {
      loadedApps = this.createDefaultDemoApplications();
    }
    this.applications.set(loadedApps);

    // 2. Load Active Draft
    try {
      const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (storedDraft) {
        this.currentDraft.set(JSON.parse(storedDraft));
      } else {
        this.initNewDraft();
      }
    } catch {
      this.initNewDraft();
    }
  }

  initNewDraft(appType: 'FRESH' | 'REISSUE' = 'FRESH', scheme: 'NORMAL' | 'TATKAAL' = 'NORMAL'): PassportApplication {
    let givenName = 'VIKRAMADITYA';
    let surname = 'SHARMA';
    let email = 'vikram.sharma@example.gov.in';
    let mobile = '9876543210';

    try {
      const storedAuth = localStorage.getItem('passport_portal_auth_user');
      if (storedAuth) {
        const user = JSON.parse(storedAuth);
        if (user && user.fullName) {
          const parts = user.fullName.trim().split(/\s+/);
          if (parts.length > 1) {
            givenName = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
            surname = parts[parts.length - 1].toUpperCase();
          } else {
            givenName = parts[0].toUpperCase();
            surname = '';
          }
          if (user.email) email = user.email;
          if (user.mobile) mobile = user.mobile;
        }
      }
    } catch { }

    const newDraft: PassportApplication = {
      arn: `DRAFT-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'DRAFT',
      currentStep: 1,
      serviceType: {
        applicationType: appType,
        schemeType: scheme,
        bookletSize: '36_PAGES',
        reissueReason: ''
      },
      personalDetails: {
        givenName: givenName,
        surname: surname,
        hasAlias: false,
        hasChangedName: false,
        dateOfBirth: '1995-08-15',
        isBirthOutOfIndia: false,
        birthPlace: 'NEW DELHI',
        birthDistrict: 'NEW DELHI',
        birthState: 'DELHI',
        birthCountry: 'INDIA',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        educationalQualification: 'GRADUATE_AND_ABOVE',
        isNonEcrEligible: true,
        employmentType: 'PRIVATE',
        panNumber: 'ABCPS1234D',
        voterId: 'DL/01/045/892019',
        aadhaarNumber: '3675 9834 6012'
      },
      familyDetails: {
        fatherGivenName: 'RAMESH CHANDER',
        fatherSurname: surname || 'SHARMA',
        motherGivenName: 'SUNITA',
        motherSurname: surname || 'SHARMA',
        isSingleParent: false
      },
      addressDetails: {
        houseNoAndStreet: 'B-42, SECTOR 14, ROHINI',
        villageOrCity: 'NEW DELHI',
        state: 'DELHI',
        district: 'NORTH WEST DELHI',
        policeStation: 'PRASHANT VIHAR',
        pinCode: '110085',
        mobileNumber: mobile,
        email: email,
        isPermanentSameAsCurrent: true,
        residingSinceYear: 4,
        residingSinceMonths: 6,
        hasResidedLessThanOneYear: false,
        previousAddresses: []
      },
      emergencyContact: {
        contactName: 'RAMESH CHANDER SHARMA',
        relationship: 'FATHER',
        address: 'B-42, SECTOR 14, ROHINI, NEW DELHI 110085',
        mobileNumber: '9810012345',
        email: 'ramesh.sharma@example.gov.in'
      },
      previousPassport: {
        hasHeldPassport: false,
        hasAppliedAndNotIssued: false
      },
      declarations: {
        hasCriminalProceedings: false,
        hasWarrantOrSummons: false,
        hasBeenConvicted: false,
        hasRefusedPassport: false,
        hasImpoundedPassport: false,
        hasForeignCitizenship: false,
        hasEmergencyCertificate: false,
        agreedToTerms: true
      },
      documents: []
    };

    this.currentDraft.set(newDraft);
    return newDraft;
  }

  syncDraftWithUser(user: any): void {
    if (!user) return;

    const parts = (user.fullName || '').trim().split(/\s+/);
    const givenName = parts.length > 1 ? parts.slice(0, parts.length - 1).join(' ').toUpperCase() : (parts[0] || 'CITIZEN').toUpperCase();
    const surname = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';

    const current = this.currentDraft();
    if (current) {
      const updated: PassportApplication = {
        ...current,
        personalDetails: {
          ...current.personalDetails,
          givenName: givenName,
          surname: surname
        },
        familyDetails: {
          ...current.familyDetails,
          fatherSurname: surname || current.familyDetails?.fatherSurname || 'SHARMA',
          motherSurname: surname || current.familyDetails?.motherSurname || 'SHARMA'
        },
        addressDetails: {
          ...current.addressDetails,
          email: user.email || current.addressDetails?.email || 'citizen@example.gov.in',
          mobileNumber: user.mobile || current.addressDetails?.mobileNumber || '9876543210'
        }
      };
      this.currentDraft.set(updated);
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
      } catch { }
    } else {
      this.initNewDraft();
    }
  }

  saveDraftStep(stepNumber: number, stepData: Partial<PassportApplication>): void {
    const current = this.currentDraft();
    if (!current) return;

    const updated: PassportApplication = {
      ...current,
      ...stepData,
      currentStep: Math.max(current.currentStep, stepNumber),
      updatedAt: new Date().toISOString()
    };

    this.currentDraft.set(updated);
    this.notify.info(`Step ${stepNumber} auto-saved as draft`, 'Draft Preserved');
  }

  submitApplication(): string {
    const current = this.currentDraft();
    if (!current) throw new Error('No active draft to submit');

    // Generate official Indian Passport ARN format: ARN-STATE-RANDOM8-YEAR
    const stateCode = current.addressDetails?.state ? current.addressDetails.state.substring(0, 2).toUpperCase() : 'DL';
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    const year = new Date().getFullYear();
    const arn = `ARN-${stateCode}01-${random8}-${year}`;

    const submittedApp: PassportApplication = {
      ...current,
      arn: arn,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update list
    this.applications.update(list => [submittedApp, ...list]);

    // Update draft to reflect submitted ARN
    this.currentDraft.set(submittedApp);

    this.notify.success(
      `Your passport application has been officially submitted! Application Reference Number: ${arn}`,
      'Submission Successful'
    );

    return arn;
  }

  holdSlot(slot: AppointmentSlot, durationMinutes = 10): void {
    this.releaseSlot(); // clear any previous

    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    const heldSlot: AppointmentSlot = {
      ...slot,
      heldUntil: expiresAt
    };

    this.activeSlotHold.set(heldSlot);
    this.slotHoldExpiresAt.set(expiresAt);
    this.slotRemainingSeconds.set(durationMinutes * 60);

    // Start interval
    this.slotTimerInterval = setInterval(() => {
      const diffMs = expiresAt - Date.now();
      const remSec = Math.max(0, Math.floor(diffMs / 1000));
      this.slotRemainingSeconds.set(remSec);

      if (remSec <= 0) {
        this.releaseSlot();
        this.notify.warning('Your 10-minute appointment slot reservation has expired. Please choose a slot again.', 'Slot Released');
      }
    }, 1000);

    this.notify.info(
      `Appointment slot temporarily reserved at ${slot.pskName} for ${durationMinutes} minutes. Complete payment to confirm.`,
      'Slot Held'
    );
  }

  releaseSlot(): void {
    if (this.slotTimerInterval) {
      clearInterval(this.slotTimerInterval);
      this.slotTimerInterval = null;
    }
    this.activeSlotHold.set(null);
    this.slotHoldExpiresAt.set(null);
    this.slotRemainingSeconds.set(0);
  }

  confirmAppointmentForApplication(arn: string, slot: AppointmentSlot): void {
    this.applications.update(list =>
      list.map(app => {
        if (app.arn === arn) {
          return {
            ...app,
            appointment: slot,
            status: 'APPOINTMENT_SCHEDULED' as ApplicationStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      })
    );

    const draft = this.currentDraft();
    if (draft && draft.arn === arn) {
      this.currentDraft.set({
        ...draft,
        appointment: slot,
        status: 'APPOINTMENT_SCHEDULED'
      });
    }

    this.releaseSlot();
    this.notify.success(`Appointment confirmed at ${slot.pskName} on ${slot.appointmentDate} at ${slot.appointmentTime}`, 'Booking Confirmed');
  }

  recordPayment(arn: string, payment: PaymentDetails): void {
    this.applications.update(list =>
      list.map(app => {
        if (app.arn === arn) {
          return {
            ...app,
            payment: payment,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      })
    );

    const draft = this.currentDraft();
    if (draft && draft.arn === arn) {
      this.currentDraft.set({
        ...draft,
        payment: payment
      });
    }

    this.notify.success(`Payment of ₹${payment.totalFee} processed successfully! E-Receipt generated.`, 'Payment Confirmed');
  }

  updateApplicationStatus(arn: string, newStatus: ApplicationStatus, speedPostTrackingNo?: string): void {
    this.applications.update(list =>
      list.map(app => {
        if (app.arn === arn) {
          return {
            ...app,
            status: newStatus,
            speedPostTrackingNo: speedPostTrackingNo || app.speedPostTrackingNo,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      })
    );

    const draft = this.currentDraft();
    if (draft && draft.arn === arn) {
      this.currentDraft.set({
        ...draft,
        status: newStatus,
        speedPostTrackingNo: speedPostTrackingNo || draft.speedPostTrackingNo
      });
    }

    this.notify.info(`Status for ARN ${arn} updated to: ${newStatus.replace(/_/g, ' ')}`, 'Status Synchronized');
  }

  getApplicationByArn(arn: string): PassportApplication | undefined {
    return this.applications().find(a => a.arn.toLowerCase() === arn.toLowerCase().trim());
  }

  private createDefaultDemoApplications(): PassportApplication[] {
    return [
      {
        arn: 'ARN-DL01-84920194-2026',
        createdAt: '2026-10-15T10:30:00.000Z',
        updatedAt: '2026-10-28T14:20:00.000Z',
        status: 'POLICE_VERIFICATION_INITIATED',
        currentStep: 9,
        serviceType: {
          applicationType: 'FRESH',
          schemeType: 'NORMAL',
          bookletSize: '36_PAGES'
        },
        personalDetails: {
          givenName: 'VIKRAMADITYA',
          surname: 'SHARMA',
          hasAlias: false,
          hasChangedName: false,
          dateOfBirth: '1995-08-15',
          isBirthOutOfIndia: false,
          birthPlace: 'NEW DELHI',
          birthDistrict: 'NEW DELHI',
          birthState: 'DELHI',
          birthCountry: 'INDIA',
          gender: 'MALE',
          maritalStatus: 'SINGLE',
          educationalQualification: 'GRADUATE_AND_ABOVE',
          isNonEcrEligible: true,
          employmentType: 'PRIVATE',
          panNumber: 'ABCPS1234D',
          aadhaarNumber: '3675 9834 6012'
        },
        familyDetails: {
          fatherGivenName: 'RAMESH CHANDER',
          fatherSurname: 'SHARMA',
          motherGivenName: 'SUNITA',
          motherSurname: 'SHARMA',
          isSingleParent: false
        },
        addressDetails: {
          houseNoAndStreet: 'B-42, SECTOR 14, ROHINI',
          villageOrCity: 'NEW DELHI',
          state: 'DELHI',
          district: 'NORTH WEST DELHI',
          policeStation: 'PRASHANT VIHAR',
          pinCode: '110085',
          mobileNumber: '9876543210',
          email: 'vikram.sharma@example.gov.in',
          isPermanentSameAsCurrent: true,
          residingSinceYear: 5,
          residingSinceMonths: 0,
          hasResidedLessThanOneYear: false,
          previousAddresses: []
        },
        emergencyContact: {
          contactName: 'RAMESH CHANDER SHARMA',
          relationship: 'FATHER',
          address: 'B-42, SECTOR 14, ROHINI, NEW DELHI 110085',
          mobileNumber: '9810012345',
          email: 'ramesh.sharma@example.gov.in'
        },
        previousPassport: {
          hasHeldPassport: false,
          hasAppliedAndNotIssued: false
        },
        declarations: {
          hasCriminalProceedings: false,
          hasWarrantOrSummons: false,
          hasBeenConvicted: false,
          hasRefusedPassport: false,
          hasImpoundedPassport: false,
          hasForeignCitizenship: false,
          hasEmergencyCertificate: false,
          agreedToTerms: true
        },
        documents: [
          {
            id: 'DOC-1',
            category: 'IDENTITY_PROOF',
            name: 'Aadhaar Card (e-KYC)',
            fileName: 'Aadhaar_Verified.xml',
            fileSize: '412 KB',
            uploadDate: '2026-10-15',
            verifiedByDigiLocker: true,
            documentType: 'Aadhaar Card'
          },
          {
            id: 'DOC-2',
            category: 'DOB_PROOF',
            name: 'Class X Certificate',
            fileName: 'CBSE_10th_Certificate.pdf',
            fileSize: '820 KB',
            uploadDate: '2026-10-15',
            verifiedByDigiLocker: true,
            documentType: 'Matriculation Certificate'
          }
        ],
        appointment: {
          pskId: 'PSK-DEL-01',
          pskName: 'PSK Herald House, ITO, New Delhi',
          pskAddress: 'Herald House, Bahadur Shah Zafar Marg, ITO, New Delhi 110002',
          appointmentDate: '2026-10-22',
          appointmentTime: '10:15 AM',
          batchNumber: 'BATCH-A04'
        },
        payment: {
          arn: 'ARN-DL01-84920194-2026',
          baseFee: 1500,
          tatkaalFee: 0,
          bookletExtraFee: 0,
          smsFee: 50,
          totalFee: 1550,
          paymentMethod: 'SBI_EPAY',
          paymentMode: 'UPI',
          transactionId: 'SBIePay9948210482',
          paymentDate: '2026-10-15T11:00:00.000Z',
          status: 'SUCCESS'
        },
        speedPostTrackingNo: 'EM849201849IN'
      },
      {
        arn: 'ARN-MH02-51928374-2026',
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-10-18T16:00:00.000Z',
        status: 'DISPATCHED',
        currentStep: 9,
        serviceType: {
          applicationType: 'REISSUE',
          schemeType: 'TATKAAL',
          bookletSize: '60_PAGES',
          reissueReason: 'Validity Expired within 3 years'
        },
        personalDetails: {
          givenName: 'PRIYA',
          surname: 'DESHMUKH',
          hasAlias: false,
          hasChangedName: false,
          dateOfBirth: '1992-04-12',
          isBirthOutOfIndia: false,
          birthPlace: 'PUNE',
          birthDistrict: 'PUNE',
          birthState: 'MAHARASHTRA',
          birthCountry: 'INDIA',
          gender: 'FEMALE',
          maritalStatus: 'MARRIED',
          educationalQualification: 'GRADUATE_AND_ABOVE',
          isNonEcrEligible: true,
          employmentType: 'GOVERNMENT',
          panNumber: 'ABCPS9876K',
          aadhaarNumber: '5482 1928 3746'
        },
        familyDetails: {
          fatherGivenName: 'ANAND',
          fatherSurname: 'DESHMUKH',
          motherGivenName: 'SHALINI',
          motherSurname: 'DESHMUKH',
          isSingleParent: false,
          spouseGivenName: 'ROHIT',
          spouseSurname: 'KULKARNI'
        },
        addressDetails: {
          houseNoAndStreet: 'Flat 402, Shivneri Residency, Baner Road',
          villageOrCity: 'PUNE',
          state: 'MAHARASHTRA',
          district: 'PUNE',
          policeStation: 'CHATURSHRINGI',
          pinCode: '411045',
          mobileNumber: '9822012345',
          email: 'priya.deshmukh@example.gov.in',
          isPermanentSameAsCurrent: true,
          residingSinceYear: 6,
          residingSinceMonths: 2,
          hasResidedLessThanOneYear: false,
          previousAddresses: []
        },
        emergencyContact: {
          contactName: 'ROHIT KULKARNI',
          relationship: 'SPOUSE',
          address: 'Flat 402, Shivneri Residency, Baner Road, Pune 411045',
          mobileNumber: '9822099999',
          email: 'rohit.k@example.gov.in'
        },
        previousPassport: {
          hasHeldPassport: true,
          previousPassportNumber: 'Z3918294',
          dateOfIssue: '2016-04-20',
          dateOfExpiry: '2026-04-19',
          placeOfIssue: 'RPO MUMBAI',
          hasAppliedAndNotIssued: false
        },
        declarations: {
          hasCriminalProceedings: false,
          hasWarrantOrSummons: false,
          hasBeenConvicted: false,
          hasRefusedPassport: false,
          hasImpoundedPassport: false,
          hasForeignCitizenship: false,
          hasEmergencyCertificate: false,
          agreedToTerms: true
        },
        documents: [],
        appointment: {
          pskId: 'PSK-PUN-01',
          pskName: 'PSK Mundhwa Pune',
          pskAddress: 'Zero One, Near Pingale Vasti, Mundhwa, Pune 411036',
          appointmentDate: '2026-10-05',
          appointmentTime: '09:30 AM',
          batchNumber: 'BATCH-T01'
        },
        payment: {
          arn: 'ARN-MH02-51928374-2026',
          baseFee: 1500,
          tatkaalFee: 2000,
          bookletExtraFee: 500,
          smsFee: 50,
          totalFee: 4050,
          paymentMethod: 'SBI_EPAY',
          paymentMode: 'CARD',
          transactionId: 'SBIePay8837194821',
          paymentDate: '2026-10-01T10:00:00.000Z',
          status: 'SUCCESS'
        },
        speedPostTrackingNo: 'EM902184912IN'
      }
    ];
  }
}

