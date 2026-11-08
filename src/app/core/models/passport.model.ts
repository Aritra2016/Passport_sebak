export type ApplicationType = 'FRESH' | 'REISSUE';
export type SchemeType = 'NORMAL' | 'TATKAAL';
export type BookletSize = '36_PAGES' | '60_PAGES';
export type Gender = 'MALE' | 'FEMALE' | 'TRANSGENDER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
export type EducationalQualification = 
  | 'GRADUATE_AND_ABOVE'
  | '10TH_AND_ABOVE'
  | 'BETWEEN_8TH_AND_9TH'
  | '7TH_OR_LESS';

export type EmploymentType =
  | 'GOVERNMENT'
  | 'PSU'
  | 'PRIVATE'
  | 'SELF_EMPLOYED'
  | 'STUDENT'
  | 'HOMEMAKER'
  | 'RETIRED'
  | 'OTHERS';

export type UserRole = 'CITIZEN' | 'PSK_OFFICER' | 'POLICE_VERIFIER';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  token?: string;
}

export interface ServiceTypeDetails {
  applicationType: ApplicationType;
  schemeType: SchemeType;
  bookletSize: BookletSize;
  reissueReason?: string;
  changeInParticulars?: string[];
}

export interface ApplicantPersonalDetails {
  givenName: string;
  surname: string;
  hasAlias: boolean;
  aliasGivenName?: string;
  aliasSurname?: string;
  hasChangedName: boolean;
  previousName?: string;
  aliasesList?: { givenName: string; surname: string }[];
  previousNamesList?: { previousGivenName: string; previousSurname: string }[];
  dateOfBirth: string;
  isBirthOutOfIndia: boolean;
  birthPlace: string;
  birthDistrict: string;
  birthState: string;
  birthCountry: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  educationalQualification: EducationalQualification;
  isNonEcrEligible: boolean;
  employmentType: EmploymentType;
  panNumber?: string;
  voterId?: string;
  aadhaarNumber: string;
}

export interface FamilyMemberItem {
  id?: string;
  relationship: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN' | 'SPOUSE' | 'OTHER';
  givenName: string;
  surname: string;
  nationality?: string;
}

export interface FamilyDetails {
  fatherGivenName: string;
  fatherSurname: string;
  motherGivenName: string;
  motherSurname: string;
  isSingleParent: boolean;
  singleParentType?: 'MOTHER_ONLY' | 'FATHER_ONLY';
  legalGuardianGivenName?: string;
  legalGuardianSurname?: string;
  spouseGivenName?: string;
  spouseSurname?: string;
  minorFatherPassport?: string;
  minorMotherPassport?: string;
  familyMembers?: FamilyMemberItem[];
}

export interface AddressDetails {
  houseNoAndStreet: string;
  villageOrCity: string;
  state: string;
  district: string;
  policeStation: string;
  pinCode: string;
  mobileNumber: string;
  email: string;
  isPermanentSameAsCurrent: boolean;
  permanentAddress?: {
    houseNoAndStreet: string;
    villageOrCity: string;
    state: string;
    district: string;
    policeStation: string;
    pinCode: string;
  };
  residingSinceYear: number;
  residingSinceMonths: number;
  hasResidedLessThanOneYear: boolean;
  previousAddresses: AddressHistoryItem[];
}

export interface AddressHistoryItem {
  id?: string;
  houseNoAndStreet: string;
  villageOrCity: string;
  state: string;
  district: string;
  policeStation: string;
  pinCode: string;
  fromDate: string;
  toDate: string;
}

export interface EmergencyContactItem {
  contactName: string;
  relationship: string;
  address: string;
  mobileNumber: string;
  email: string;
}

export interface EmergencyContact {
  contactName: string;
  relationship: string;
  address: string;
  mobileNumber: string;
  email: string;
  alternateContacts?: EmergencyContactItem[];
}

export interface PastApplicationItem {
  id?: string;
  fileNumber: string;
  appliedYear: string;
  appliedPassportOffice: string;
  appliedReason?: string;
}

export interface PreviousPassportDetails {
  hasHeldPassport: boolean;
  previousPassportNumber?: string;
  dateOfIssue?: string;
  dateOfExpiry?: string;
  placeOfIssue?: string;
  fileNumber?: string;
  hasAppliedAndNotIssued: boolean;
  appliedFileNumber?: string;
  appliedYear?: string;
  appliedPassportOffice?: string;
  appliedReason?: string;
  pastApplications?: PastApplicationItem[];
}

export interface LegalDeclarations {
  hasCriminalProceedings: boolean;
  criminalDetails?: string;
  hasWarrantOrSummons: boolean;
  warrantDetails?: string;
  hasBeenConvicted: boolean;
  convictionDetails?: string;
  hasRefusedPassport: boolean;
  refusedDetails?: string;
  hasImpoundedPassport: boolean;
  impoundedDetails?: string;
  hasForeignCitizenship: boolean;
  foreignCitizenshipDetails?: string;
  hasEmergencyCertificate: boolean;
  emergencyCertificateDetails?: string;
  agreedToTerms: boolean;
}

export interface UploadedDocument {
  id: string;
  category: 'PHOTO' | 'IDENTITY_PROOF' | 'ADDRESS_PROOF' | 'DOB_PROOF';
  name: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  verifiedByDigiLocker: boolean;
  documentType: string;
  previewUrl?: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_ATTENDED'
  | 'POLICE_VERIFICATION_INITIATED'
  | 'POLICE_VERIFIED'
  | 'PASSPORT_PRINTED'
  | 'DISPATCHED';

export interface PskLocation {
  id: string;
  name: string;
  type: 'PSK' | 'POPSK';
  state: string;
  district: string;
  address: string;
  pinCode: string;
  earliestAvailableDate: string;
  availableSlotCount: number;
  operatingHours: string;
}

export interface AppointmentSlot {
  pskId: string;
  pskName: string;
  pskAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  batchNumber: string;
  heldUntil?: number;
}

export interface PaymentDetails {
  arn: string;
  baseFee: number;
  tatkaalFee: number;
  bookletExtraFee: number;
  smsFee: number;
  totalFee: number;
  paymentMethod: 'SBI_EPAY' | 'PAYU' | 'RAZORPAY';
  paymentMode: 'UPI' | 'NET_BANKING' | 'CARD';
  transactionId: string;
  paymentDate: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface TrackingStage {
  stageNumber: number;
  title: string;
  statusText: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  description: string;
  remarks?: string;
}

export interface PassportApplication {
  arn: string;
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  currentStep: number;
  serviceType: ServiceTypeDetails;
  personalDetails: ApplicantPersonalDetails;
  familyDetails: FamilyDetails;
  addressDetails: AddressDetails;
  emergencyContact: EmergencyContact;
  previousPassport: PreviousPassportDetails;
  declarations: LegalDeclarations;
  documents: UploadedDocument[];
  appointment?: AppointmentSlot;
  payment?: PaymentDetails;
  speedPostTrackingNo?: string;
}

