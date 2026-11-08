import { AppEnvironment } from './environment.interface';

export const environment: AppEnvironment = {
  production: true,
  envName: 'production',
  portalTitle: 'Passport Seva Online Portal | Government of India',
  portalVersion: '2.0.0',
  apiBaseUrl: 'https://api.passportindia.gov.in/api/v1',
  sessionTimeoutMinutes: 15, // Mandatory 15-minute compliance security timeout
  enableMockMode: false,
  loggingLevel: 'error',
  banner: {
    show: false,
    label: '',
    bgColor: '',
    textColor: ''
  },
  digilocker: {
    clientId: 'PROD_PSP_MEA_INDIA_001',
    oauthUrl: 'https://digilocker.gov.in/oauth/authorize',
    redirectUri: 'https://portal.passportindia.gov.in/passport-application',
    mockVerification: false
  },
  payment: {
    sbiEpayMerchantId: 'PROD_SBI_EPAY_MEA_LIVE_1001',
    payuKey: 'PROD_PAYU_LIVE_KEY',
    razorpayKeyId: 'rzp_live_mea99201948',
    testMode: false
  }
};

