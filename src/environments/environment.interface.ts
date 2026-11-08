export interface AppEnvironment {
  production: boolean;
  envName: 'development' | 'uat' | 'production';
  portalTitle: string;
  portalVersion: string;
  apiBaseUrl: string;
  sessionTimeoutMinutes: number;
  enableMockMode: boolean;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
  banner: {
    show: boolean;
    label: string;
    bgColor: string;
    textColor: string;
  };
  digilocker: {
    clientId: string;
    oauthUrl: string;
    redirectUri: string;
    mockVerification: boolean;
  };
  payment: {
    sbiEpayMerchantId: string;
    payuKey: string;
    razorpayKeyId: string;
    testMode: boolean;
  };
}

