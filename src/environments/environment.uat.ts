import { AppEnvironment } from './environment.interface';

export const environment: AppEnvironment = {
  production: false,
  envName: 'uat',
  portalTitle: 'Passport Seva Portal [UAT Testing]',
  portalVersion: '2.0.0-uat-rc.1',
  apiBaseUrl: 'https://uat-api.passportindia.gov.in/api/v1',
  sessionTimeoutMinutes: 15, // Standard 15-minute portal timeout under UAT validation
  enableMockMode: true,
  loggingLevel: 'info',
  banner: {
    show: true,
    label: 'UAT STAGING ENVIRONMENT (Verification & Acceptance Testing Only)',
    bgColor: '#7c3aed', // Royal Purple
    textColor: '#ffffff'
  },
  digilocker: {
    clientId: 'UAT_PSP_STAGE_902',
    oauthUrl: 'https://uat-digilocker.gov.in/oauth/authorize',
    redirectUri: 'https://uat-portal.passportindia.gov.in/passport-application',
    mockVerification: true
  },
  payment: {
    sbiEpayMerchantId: 'UAT_SBI_EPAY_STAGE_5001',
    payuKey: 'UAT_PAYU_SANDBOX_KEY',
    razorpayKeyId: 'rzp_test_uat992019',
    testMode: true
  }
};

