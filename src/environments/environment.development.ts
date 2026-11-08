import { AppEnvironment } from './environment.interface';

export const environment: AppEnvironment = {
  production: false,
  envName: 'development',
  portalTitle: 'Passport Seva Portal [DEV]',
  portalVersion: '2.0.0-dev',
  apiBaseUrl: 'http://localhost:8080/api/v1',
  sessionTimeoutMinutes: 30,
  enableMockMode: true,
  loggingLevel: 'debug',
  banner: {
    show: true,
    label: 'DEVELOPMENT ENVIRONMENT (Local)',
    bgColor: '#f59e0b',
    textColor: '#78350f'
  },
  digilocker: {
    clientId: 'DEV_PSP_UIDAI_001',
    oauthUrl: 'https://dev-digilocker.gov.in/oauth/authorize',
    redirectUri: 'http://localhost:4200/passport-application',
    mockVerification: true
  },
  payment: {
    sbiEpayMerchantId: 'TEST_SBI_EPAY_DEV_1001',
    payuKey: 'TEST_PAYU_DEV_KEY',
    razorpayKeyId: 'rzp_test_dev109284',
    testMode: true
  }
};

