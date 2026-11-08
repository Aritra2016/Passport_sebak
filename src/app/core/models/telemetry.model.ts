export type TelemetryEventType =
  | 'CONSOLE_LOG'
  | 'VALUE_CHANGE'
  | 'MOUSE_CLICK'
  | 'MOUSE_FUNCTION'
  | 'KEYBOARD_FUNCTION'
  | 'FORM_SUBMIT'
  | 'NAVIGATION_EVENT';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  eventType: TelemetryEventType;
  category: 'CONSOLE' | 'VALUE' | 'MOUSE' | 'KEYBOARD' | 'SYSTEM';
  summary: string;
  details: Record<string, unknown>;
  url: string;
  routePath?: string;
  component?: string;
  userRole?: string;
  networkStatus?: 'PENDING' | 'SUCCESS_200' | 'FAILED';
}

export interface TelemetryConfig {
  captureConsoleLogs: boolean;
  captureValueChanges: boolean;
  captureMouseEvents: boolean;
  captureKeyboardEvents: boolean;
  sendNetworkRequests: boolean;
  maxStoredEvents: number;
}

