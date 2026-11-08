import { Injectable, NgZone, Optional, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TelemetryEvent, TelemetryConfig } from '../models/telemetry.model';

export interface ComponentTelemetryMetadata {
  className: string;
  selector: string;
  file: string;
  formTitle: string;
  instance?: any;
}

const COMPONENT_REGISTRY: Record<string, { className: string; selector: string; file: string; formTitle: string }> = {
  'app-step1-service-type': {
    className: 'Step1ServiceTypeComponent',
    selector: 'app-step1-service-type',
    file: 'src/app/features/passport-application/steps/step1-service-type.component.ts',
    formTitle: 'Step 1: Service Type Selection Form'
  },
  'app-step2-personal-details': {
    className: 'Step2PersonalDetailsComponent',
    selector: 'app-step2-personal-details',
    file: 'src/app/features/passport-application/steps/step2-personal-details.component.ts',
    formTitle: 'Step 2: Applicant Personal Particulars Form'
  },
  'app-step3-family-details': {
    className: 'Step3FamilyDetailsComponent',
    selector: 'app-step3-family-details',
    file: 'src/app/features/passport-application/steps/step3-family-details.component.ts',
    formTitle: 'Step 3: Family Details Form'
  },
  'app-step4-address-details': {
    className: 'Step4AddressDetailsComponent',
    selector: 'app-step4-address-details',
    file: 'src/app/features/passport-application/steps/step4-address-details.component.ts',
    formTitle: 'Step 4: Residential Address Details Form'
  },
  'app-step5-emergency-contact': {
    className: 'Step5EmergencyContactComponent',
    selector: 'app-step5-emergency-contact',
    file: 'src/app/features/passport-application/steps/step5-emergency-contact.component.ts',
    formTitle: 'Step 5: Emergency Contacts Form'
  },
  'app-step6-previous-passport': {
    className: 'Step6PreviousPassportComponent',
    selector: 'app-step6-previous-passport',
    file: 'src/app/features/passport-application/steps/step6-previous-passport.component.ts',
    formTitle: 'Step 6: Previous Passport & History Form'
  },
  'app-step7-declarations': {
    className: 'Step7DeclarationsComponent',
    selector: 'app-step7-declarations',
    file: 'src/app/features/passport-application/steps/step7-declarations.component.ts',
    formTitle: 'Step 7: Statutory Declarations Form'
  },
  'app-step8-documents': {
    className: 'Step8DocumentsComponent',
    selector: 'app-step8-documents',
    file: 'src/app/features/passport-application/steps/step8-documents.component.ts',
    formTitle: 'Step 8: Document Upload & DigiLocker Form'
  },
  'app-step9-review': {
    className: 'Step9ReviewComponent',
    selector: 'app-step9-review',
    file: 'src/app/features/passport-application/steps/step9-review.component.ts',
    formTitle: 'Step 9: Final Review & Submission'
  },
  'app-login': {
    className: 'LoginComponent',
    selector: 'app-login',
    file: 'src/app/features/auth/login/login.component.ts',
    formTitle: 'Citizen Sign-In Form'
  },
  'app-register': {
    className: 'RegisterComponent',
    selector: 'app-register',
    file: 'src/app/features/auth/register/register.component.ts',
    formTitle: 'Citizen Registration Form'
  },
  'app-appointment-booking': {
    className: 'AppointmentBookingComponent',
    selector: 'app-appointment-booking',
    file: 'src/app/features/appointment/appointment-booking.component.ts',
    formTitle: 'PSK Appointment Slot Booking Form'
  },
  'app-payment-checkout': {
    className: 'PaymentComponent',
    selector: 'app-payment-checkout',
    file: 'src/app/features/payment/payment.component.ts',
    formTitle: 'Payment Gateway & Fee Checkout Form'
  },
  'app-tracking': {
    className: 'TrackingComponent',
    selector: 'app-tracking',
    file: 'src/app/features/tracking/tracking.component.ts',
    formTitle: 'Live Application Status Tracker Form'
  },
  'app-address-form-group': {
    className: 'AddressFormGroupComponent',
    selector: 'app-address-form-group',
    file: 'src/app/shared/components/address-form-group/address-form-group.component.ts',
    formTitle: 'Address Reusable Form Component'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ActivityTelemetryService {
  // Preserve original native browser console methods to avoid infinite recursion
  public readonly rawConsole = {
    log: window.console.log.bind(window.console),
    info: window.console.info.bind(window.console),
    warn: window.console.warn.bind(window.console),
    error: window.console.error.bind(window.console)
  };

  // Signals for reactive tracking state
  public readonly events = signal<TelemetryEvent[]>([]);
  public readonly isTrackingActive = signal<boolean>(true);
  public readonly stats = signal({
    total: 0,
    consoleLogs: 0,
    valueChanges: 0,
    mouseEvents: 0,
    keyboardEvents: 0,
    networkRequestsSent: 0
  });

  public readonly config = signal<TelemetryConfig>({
    captureConsoleLogs: true,
    captureValueChanges: true,
    captureMouseEvents: true,
    captureKeyboardEvents: true,
    sendNetworkRequests: true,
    maxStoredEvents: 250
  });

  private isInternalOperation = false;
  private isInitialized = false;
  private lastCapturedValueMap = new Map<string, string>();
  private recentChangesCache = new Map<string, number>();
  private inputDebounceTimers = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {}

  /**
   * Initializes global DOM listeners and console interception.
   */
  start(): void {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    // Keep native browser console untouched so DevTools always attributes line numbers directly to components
    this.attachGlobalListeners();

    // Log the initial startup event into network tab
    this.dispatchNetworkEvent('SYSTEM', 'TELEMETRY_ENGINE_STARTED', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  /**
   * Safe console interception (disabled by default to preserve native V8 component line attribution).
   */
  private attachConsoleInterceptor(): void {
    // Left empty to prevent hijacking native console stack traces
  }

  private handleInterceptedConsole(level: 'log' | 'info' | 'warn' | 'error', args: unknown[]): void {
    if (!this.isTrackingActive() || !this.config().captureConsoleLogs || this.isInternalOperation) {
      return;
    }

    // Filter out our own colored console outputs or Angular internal logs to prevent noise
    const firstArg = args[0];
    if (typeof firstArg === 'string' && (
      firstArg.includes('[TELEMETRY') ||
      firstArg.includes('[COMPONENT:') ||
      firstArg.includes('[REACTIVE FORM CHANGE]') ||
      firstArg.includes('[VALUE CHANGING]') ||
      firstArg.includes('[KEYBOARD EVENT]') ||
      firstArg.includes('[MOUSE EVENT]') ||
      firstArg.includes('[NETWORK AUDIT]')
    )) {
      return;
    }

    const serializedArgs = args.map(arg => {
      try {
        if (typeof arg === 'object' && arg !== null) {
          return JSON.parse(JSON.stringify(arg));
        }
        return String(arg);
      } catch {
        return '[Unserializable Object]';
      }
    });

    const summary = serializedArgs.join(' ').substring(0, 120);

    const event: TelemetryEvent = {
      id: `console_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: 'CONSOLE_LOG',
      category: 'CONSOLE',
      summary: `console.${level}: ${summary}`,
      details: {
        level,
        arguments: serializedArgs,
        rawCount: args.length
      },
      url: window.location.pathname,
      networkStatus: 'PENDING'
    };

    this.recordEvent(event);
    this.sendToNetworkTab('console-log', event);
  }

  /**
   * Attaches global listeners for keyboard, mouse, and value changes.
   * Runs outside Angular zone to avoid unnecessary change detection cycles.
   */
  private attachGlobalListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      // 1. Mouse Functions (Click, ContextMenu, Button Presses)
      document.addEventListener('click', (event: MouseEvent) => {
        this.handleMouseClick(event);
      }, true);

      // 2. Keyboard Functions (KeyDown, KeyUp)
      document.addEventListener('keydown', (event: KeyboardEvent) => {
        this.handleKeyboardEvent(event);
      }, true);

      // 3. Value Changing (Input, Change, Select)
      document.addEventListener('input', (event: Event) => {
        this.handleValueChange(event, 'input');
      }, true);

      document.addEventListener('change', (event: Event) => {
        this.handleValueChange(event, 'change');
      }, true);
    });
  }

  /**
   * Captures mouse clicks with coordinates, target element description, and sends to Network tab.
   * Note: Raw mouse banners are suppressed in the console to keep DevTools clean and focused.
   */
  private handleMouseClick(event: MouseEvent): void {
    if (!this.isTrackingActive() || !this.config().captureMouseEvents) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    // Ignore clicks inside the telemetry drawer itself to avoid cluttering
    if (target.closest('.telemetry-drawer-root')) {
      return;
    }

    const selector = this.describeElement(target);
    const buttonText = (target.innerText || target.getAttribute('value') || target.getAttribute('aria-label') || '').trim().substring(0, 50);
    const buttonName = event.button === 0 ? 'Left-Click' : event.button === 2 ? 'Right-Click' : 'Middle-Click';

    const details = {
      mouseButton: buttonName,
      coordinates: { x: event.clientX, y: event.clientY, pageX: event.pageX, pageY: event.pageY },
      targetTag: target.tagName.toLowerCase(),
      targetId: target.id || null,
      targetClasses: target.className || null,
      targetText: buttonText || null,
      selector: selector,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    };

    const summary = `${buttonName} on <${target.tagName.toLowerCase()}> "${buttonText || selector}" at (${event.clientX}, ${event.clientY})`;

    const telemetryEvent: TelemetryEvent = {
      id: `mouse_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: 'MOUSE_CLICK',
      category: 'MOUSE',
      summary: summary,
      details: details,
      url: window.location.pathname,
      networkStatus: 'PENDING'
    };

    this.recordEvent(telemetryEvent);
    this.sendToNetworkTab('mouse-event', telemetryEvent);
  }

  /**
   * Captures keyboard presses and functions (key, code, target, modifiers) and sends to Network tab.
   * Note: Raw keyboard spam banners are suppressed in the console to keep DevTools clean and focused.
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isTrackingActive() || !this.config().captureKeyboardEvents) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const targetDesc = target ? this.describeElement(target) : 'document';
    const isSpecialKey = ['Enter', 'Tab', 'Escape', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);

    const details = {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      isSpecialActionKey: isSpecialKey,
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey
      },
      targetElement: targetDesc,
      targetId: target?.id || null,
      targetTagName: target?.tagName.toLowerCase() || 'body'
    };

    const summary = `Key "${event.key}" [${event.code}] pressed on ${targetDesc}`;

    const telemetryEvent: TelemetryEvent = {
      id: `kbd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: 'KEYBOARD_FUNCTION',
      category: 'KEYBOARD',
      summary: summary,
      details: details,
      url: window.location.pathname,
      networkStatus: 'PENDING'
    };

    this.recordEvent(telemetryEvent);
    this.sendToNetworkTab('keyboard-event', telemetryEvent);
  }

  /**
   * Captures form input and control value changing events (old value vs new value)
   * explicitly identifying which actual Component and Reactive Form is changing,
   * what field is changing, logging clearly to DevTools Console and sending to the Network tab.
   */
  private handleValueChange(event: Event, eventTrigger: 'input' | 'change'): void {
    if (!this.isTrackingActive() || !this.config().captureValueChanges) {
      return;
    }

    const target = event.target as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) | null;
    if (!target || !('value' in target)) {
      return;
    }

    const compMeta = this.resolveComponentMetadata(null, target);
    const controlInfo = this.resolveControlInfo(target);
    const trackingKey = `${compMeta.className}::${controlInfo.fullPath}`;

    const isCheckbox = target.type === 'checkbox';
    const rawNewValue = isCheckbox ? (target as HTMLInputElement).checked : target.value;
    const oldValue = this.lastCapturedValueMap.get(trackingKey) ?? '(initial/empty)';

    // Form status resolution from Angular classes
    const formElement = target.closest('form');
    const isFormValid = formElement
      ? formElement.classList.contains('ng-valid') || formElement.checkValidity()
      : !target.classList.contains('ng-invalid');
    const formStatus: 'VALID' | 'INVALID' = isFormValid ? 'VALID' : 'INVALID';
    const controlStatus = target.classList.contains('ng-invalid') ? 'INVALID' : 'VALID';

    // For continuous typing in text inputs, debounce slightly (250ms) so typing a word produces one clean log
    if (eventTrigger === 'input' && target.type !== 'radio' && target.type !== 'checkbox') {
      const existingTimer = this.inputDebounceTimers.get(trackingKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      this.inputDebounceTimers.set(
        trackingKey,
        setTimeout(() => {
          this.processValueChange({
            formName: compMeta.formTitle,
            controlName: controlInfo.controlName,
            label: controlInfo.label,
            fullPath: controlInfo.fullPath,
            trackingKey,
            oldValue,
            newValue: rawNewValue,
            formStatus,
            controlStatus,
            target,
            componentMeta: compMeta
          });
        }, 250)
      );
      return;
    }

    // For 'change' events (radio, checkbox, dropdown select, or on blur/Enter), process immediately
    this.processValueChange({
      formName: compMeta.formTitle,
      controlName: controlInfo.controlName,
      label: controlInfo.label,
      fullPath: controlInfo.fullPath,
      trackingKey,
      oldValue,
      newValue: rawNewValue,
      formStatus,
      controlStatus,
      target,
      componentMeta: compMeta
    });
  }

  private processValueChange(params: {
    formName: string;
    controlName: string;
    label: string;
    fullPath: string;
    trackingKey: string;
    oldValue: unknown;
    newValue: unknown;
    formStatus: 'VALID' | 'INVALID';
    controlStatus: string;
    target?: HTMLElement;
    componentMeta?: ComponentTelemetryMetadata;
  }): void {
    const isSensitive = params.controlName.toLowerCase().includes('password');
    const oldFormatted = this.formatValue(params.oldValue, isSensitive);
    const newFormatted = this.formatValue(params.newValue, isSensitive);

    if (oldFormatted === newFormatted) {
      return;
    }

    this.lastCapturedValueMap.set(params.trackingKey, String(params.newValue));

    this.recordAndLogReactiveFormChange({
      formName: params.formName,
      controlName: params.controlName,
      label: params.label,
      fullPath: params.fullPath,
      oldValue: oldFormatted,
      newValue: newFormatted,
      formStatus: params.formStatus,
      controlStatus: params.controlStatus,
      source: 'DOM_EVENT',
      targetElement: params.target,
      componentMeta: params.componentMeta
    });
  }

  /**
   * Directly hooks into an Angular Reactive FormGroup to capture and log
   * every control mutation with the EXACT component instance, component name,
   * component selector, file path, control name, old vs new value, and validity.
   */
  public trackReactiveForm(
    componentOrName: any,
    formGroup: FormGroup,
    customFormTitle?: string
  ): Subscription {
    const meta = this.resolveComponentMetadata(componentOrName);
    const formTitle = customFormTitle || meta.formTitle;
    const componentInstance = typeof componentOrName === 'object' ? componentOrName : undefined;

    let previousValueSnapshot = { ...formGroup.getRawValue() };

    return formGroup.valueChanges.subscribe((newValueSnapshot) => {
      const keys = Object.keys(newValueSnapshot);

      for (const key of keys) {
        const oldVal = previousValueSnapshot[key];
        const newVal = newValueSnapshot[key];

        // Deep equality check for primitives and FormArrays/Objects
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          const control = formGroup.get(key);
          const formStatus: 'VALID' | 'INVALID' = formGroup.valid ? 'VALID' : 'INVALID';
          const controlStatus = control ? (control.valid ? 'VALID' : 'INVALID') : 'UNKNOWN';

          // If this is a FormArray, inspect individual array items if possible
          if (Array.isArray(newVal)) {
            const oldArr = Array.isArray(oldVal) ? oldVal : [];
            this.handleArrayValueChange(formTitle, key, oldArr, newVal, formGroup, meta, componentInstance);
          } else {
            this.recordAndLogReactiveFormChange({
              formName: formTitle,
              controlName: key,
              label: this.humanizeControlName(key),
              fullPath: key,
              oldValue: oldVal,
              newValue: newVal,
              formStatus,
              controlStatus,
              errors: control?.errors || null,
              source: 'REACTIVE_FORM_SUBSCRIPTION',
              componentMeta: meta,
              componentInstance: componentInstance,
              formSnapshot: { ...formGroup.getRawValue() }
            });
          }
        }
      }

      previousValueSnapshot = { ...formGroup.getRawValue() };
    });
  }

  private handleArrayValueChange(
    formName: string,
    arrayKey: string,
    oldArr: any[],
    newArr: any[],
    formGroup: FormGroup,
    meta: ComponentTelemetryMetadata,
    componentInstance?: any
  ): void {
    const formStatus: 'VALID' | 'INVALID' = formGroup.valid ? 'VALID' : 'INVALID';

    if (oldArr.length !== newArr.length) {
      this.recordAndLogReactiveFormChange({
        formName,
        controlName: arrayKey,
        label: `${this.humanizeControlName(arrayKey)} (Count: ${newArr.length})`,
        fullPath: `${arrayKey}.length`,
        oldValue: `${oldArr.length} item(s)`,
        newValue: `${newArr.length} item(s)`,
        formStatus,
        controlStatus: 'VALID',
        source: 'REACTIVE_FORM_ARRAY',
        componentMeta: meta,
        componentInstance,
        formSnapshot: { ...formGroup.getRawValue() }
      });
      return;
    }

    // Inspect individual elements inside the array
    for (let i = 0; i < newArr.length; i++) {
      const oldItem = oldArr[i] || {};
      const newItem = newArr[i] || {};

      if (typeof newItem === 'object' && newItem !== null) {
        const subKeys = Object.keys(newItem);
        for (const subKey of subKeys) {
          if (newItem[subKey] !== oldItem[subKey]) {
            this.recordAndLogReactiveFormChange({
              formName,
              controlName: subKey,
              label: `${this.humanizeControlName(subKey)} [#${i + 1}]`,
              fullPath: `${arrayKey}[${i}].${subKey}`,
              oldValue: oldItem[subKey],
              newValue: newItem[subKey],
              formStatus,
              controlStatus: 'VALID',
              source: 'REACTIVE_FORM_ARRAY_ITEM',
              componentMeta: meta,
              componentInstance,
              formSnapshot: { ...formGroup.getRawValue() }
            });
          }
        }
      }
    }
  }

  /**
   * Centralized method to log the reactive form value change to DevTools Console,
   * prominently displaying the ACTUAL COMPONENT, component selector, and file location.
   */
  public recordAndLogReactiveFormChange(data: {
    formName: string;
    controlName: string;
    label: string;
    fullPath?: string;
    oldValue: unknown;
    newValue: unknown;
    formStatus: 'VALID' | 'INVALID';
    controlStatus?: string;
    errors?: unknown;
    source?: string;
    targetElement?: HTMLElement;
    componentMeta?: ComponentTelemetryMetadata;
    componentInstance?: any;
    formSnapshot?: any;
  }): void {
    const isSensitive = data.controlName.toLowerCase().includes('password');
    const oldFormatted = this.formatValue(data.oldValue, isSensitive);
    const newFormatted = this.formatValue(data.newValue, isSensitive);

    // Skip duplicate continuous events if identical
    if (oldFormatted === newFormatted) {
      return;
    }

    // Resolve component metadata if not already passed
    const compMeta = data.componentMeta || this.resolveComponentMetadata(data.formName, data.targetElement);
    const compInstance = data.componentInstance || compMeta.instance;

    // Deduplication check: prevent identical log within 200ms
    const dedupeKey = `${compMeta.className}::${data.fullPath || data.controlName}::${newFormatted}`;
    const now = Date.now();
    const lastTimestamp = this.recentChangesCache.get(dedupeKey);
    if (lastTimestamp && (now - lastTimestamp) < 200) {
      return;
    }
    this.recentChangesCache.set(dedupeKey, now);

    const displayField = data.label
      ? `${data.label} (${data.fullPath || data.controlName})`
      : (data.fullPath || data.controlName);

    // 2. Prepare structured telemetry event
    const summary = `[${compMeta.className}] ${data.label}: "${oldFormatted}" ➔ "${newFormatted}"`;
    const telemetryEvent: TelemetryEvent = {
      id: `val_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: 'VALUE_CHANGE',
      category: 'VALUE',
      summary: summary,
      details: {
        componentName: compMeta.className,
        componentSelector: compMeta.selector,
        componentFile: compMeta.file,
        formName: compMeta.formTitle,
        controlName: data.controlName,
        fieldPath: data.fullPath || data.controlName,
        label: data.label,
        oldValue: oldFormatted,
        newValue: newFormatted,
        formStatus: data.formStatus,
        controlStatus: data.controlStatus || 'VALID',
        validationErrors: data.errors || null
      },
      url: window.location.pathname,
      networkStatus: 'PENDING'
    };

    // 3. Store event in reactive signal array for UI inspection drawer
    this.recordEvent(telemetryEvent);

    // 4. Send to Network Tab via HTTP POST to appear in browser DevTools Network tab
    this.sendToNetworkTab('value-change', telemetryEvent);
  }

  /**
   * Resolves the component metadata (Class Name, Tag Selector, File Path, Form Title)
   * from an Angular component instance, form title, or DOM element.
   */
  public resolveComponentMetadata(
    source?: any,
    targetEl?: HTMLElement
  ): ComponentTelemetryMetadata {
    // 1. If source is an Angular component instance (e.g. passed as `this`)
    if (source && typeof source === 'object' && source.constructor && source.constructor.name !== 'Object') {
      const className = source.constructor.name;
      for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
        if (meta.className === className) {
          return {
            className: meta.className,
            selector: meta.selector,
            file: meta.file,
            formTitle: meta.formTitle,
            instance: source
          };
        }
      }
      const selector = 'app-' + className.replace(/Component$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      return {
        className: className,
        selector: selector,
        file: `${selector.replace(/^app-/, '')}.component.ts`,
        formTitle: className.replace(/Component$/, ' Form'),
        instance: source
      };
    }

    // 2. If source is a string (e.g. form title or step name)
    if (typeof source === 'string') {
      for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
        if (source.includes(meta.className) || source.includes(meta.formTitle) || source.includes(tag)) {
          return {
            className: meta.className,
            selector: meta.selector,
            file: meta.file,
            formTitle: meta.formTitle
          };
        }
      }
    }

    // 3. If target DOM element is provided, traverse ancestors to find nearest component tag
    if (targetEl) {
      for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
        if (targetEl.closest(tag)) {
          return {
            className: meta.className,
            selector: meta.selector,
            file: meta.file,
            formTitle: meta.formTitle
          };
        }
      }
    }

    return {
      className: 'AngularFormComponent',
      selector: 'app-reactive-form',
      file: 'src/app/features/passport-application/application-container.component.ts',
      formTitle: typeof source === 'string' ? source : 'Passport Portal Reactive Form'
    };
  }

  /**
   * Resolves the control name, field path, and human-friendly label for any form control.
   */
  public resolveControlInfo(target: HTMLElement): {
    controlKey: string;
    controlName: string;
    label: string;
    fullPath: string;
  } {
    // 1. Extract raw control name from Angular reactive form directives or standard attributes
    let controlName =
      target.getAttribute('formcontrolname') ||
      target.getAttribute('formControlName') ||
      target.getAttribute('ng-reflect-name') ||
      (target as HTMLInputElement).name ||
      target.id ||
      '';

    // 2. Check if inside FormArray or nested FormGroup
    const arrayContainer = target.closest('[formarrayname], [formArrayName]');
    const groupContainer = target.closest('[formgroupname], [formGroupName]');
    let arrayPath = '';

    if (arrayContainer) {
      const arrayName = arrayContainer.getAttribute('formarrayname') || arrayContainer.getAttribute('formArrayName') || 'items';
      const groupIdx = groupContainer?.getAttribute('formgroupname') || groupContainer?.getAttribute('formGroupName') || '0';
      arrayPath = `${arrayName}[${groupIdx}].`;
    }

    const fullPath = arrayPath ? `${arrayPath}${controlName}` : controlName;

    // 3. Extract human-readable label
    let labelText = '';

    // If target has id, check matching <label for="id">
    if (target.id) {
      const labelEl = document.querySelector(`label[for="${target.id}"]`);
      if (labelEl) {
        labelText = labelEl.textContent || '';
      }
    }

    // If no label found by for=, check surrounding form-group or radio-card
    if (!labelText) {
      const parentGroup = target.closest('.form-group, .section-group, .toggle-group, .radio-card, label');
      if (parentGroup) {
        const labelEl = parentGroup.querySelector('label, .section-title, .title, strong');
        if (labelEl && labelEl !== target) {
          labelText = labelEl.textContent || '';
        }
      }
    }

    // Clean label text (strip *, required badges, newlines, excess spaces)
    labelText = labelText
      .replace(/\*/g, '')
      .replace(/mandatory/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If still no label or it's empty, use the humanized control name
    if (!labelText) {
      labelText = this.humanizeControlName(controlName || 'field');
    }

    const controlKey = fullPath || controlName || target.id || (target as HTMLInputElement).name || 'control';

    return {
      controlKey,
      controlName: controlName || 'field',
      label: labelText,
      fullPath: fullPath || controlName || 'control'
    };
  }

  /**
   * Maps camelCase Angular control names to friendly official passport field labels.
   */
  public humanizeControlName(name: string): string {
    const knownLabels: Record<string, string> = {
      givenName: 'Given Name (First & Middle Name)',
      surname: 'Surname',
      hasAlias: 'Known by Other Names (Aliases)',
      aliasGivenName: 'Alias Given Name',
      aliasSurname: 'Alias Surname',
      aliases: 'Aliases (FormArray)',
      hasChangedName: 'Ever Changed Name',
      previousName: 'Previous Name',
      previousNames: 'Previous Names (FormArray)',
      dateOfBirth: 'Date of Birth',
      isBirthOutOfIndia: 'Born Outside India',
      birthPlace: 'Place of Birth (Village/Town/City)',
      birthDistrict: 'District of Birth',
      birthState: 'State / UT of Birth',
      birthCountry: 'Country of Birth',
      gender: 'Gender',
      maritalStatus: 'Marital Status',
      educationalQualification: 'Educational Qualification',
      employmentType: 'Employment Type',
      isNonEcrEligible: 'Non-ECR Category Eligibility',
      panNumber: 'PAN Card Number',
      voterId: 'Voter ID Number',
      aadhaarNumber: 'Aadhaar Card Number',
      applicationType: 'Applying For (Fresh vs Re-issue)',
      reissueReason: 'Reason for Re-issue',
      schemeType: 'Application Scheme (Normal vs Tatkaal)',
      bookletSize: 'Booklet Size (36 vs 60 Pages)',
      fatherGivenName: "Father's Given Name",
      fatherSurname: "Father's Surname",
      motherGivenName: "Mother's Given Name",
      motherSurname: "Mother's Surname",
      guardianGivenName: "Legal Guardian's Given Name",
      guardianSurname: "Legal Guardian's Surname",
      isSingleParent: 'Single Parent Application',
      familyMembers: 'Family Members (FormArray)',
      houseNoAndStreet: 'House No. & Street Address',
      villageOrTown: 'Village / Town / City',
      district: 'District',
      policeStation: 'Police Station',
      pinCode: 'PIN Code',
      mobileNumber: 'Mobile Number',
      emailId: 'Email Address',
      residingSince: 'Residing at Current Address Since',
      hasPreviousAddresses: 'Residing Less Than 1 Year',
      previousAddresses: 'Previous Addresses (FormArray)',
      emergencyName: 'Emergency Contact Full Name',
      emergencyAddress: 'Emergency Contact Address',
      emergencyMobile: 'Emergency Contact Mobile',
      emergencyEmail: 'Emergency Contact Email',
      alternateContacts: 'Alternate Emergency Contacts (FormArray)',
      hasHeldPassport: 'Ever Held Indian Passport',
      previousPassportNumber: 'Previous Passport Number',
      passportIssueDate: 'Passport Issue Date',
      passportExpiryDate: 'Passport Expiry Date',
      placeOfIssue: 'Place of Passport Issue',
      hasAppliedNotIssued: 'Ever Applied But Not Issued',
      pastApplications: 'Past Rejected Applications (FormArray)',
      hasCriminalRecord: 'Criminal Proceedings / Charges Pending',
      hasConviction: 'Conviction by Court of Law',
      hasRefusalOrImpounding: 'Passport Refusal or Revocation History',
      hasRepatriationHistory: 'Repatriation or Deportation History',
      acceptTerms: 'Statutory Declaration Acceptance'
    };

    if (knownLabels[name]) {
      return knownLabels[name];
    }

    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatValue(value: unknown, isSensitive: boolean = false): string {
    if (value === null || value === undefined || value === '') {
      return '(empty)';
    }
    if (isSensitive) {
      return '••••••••';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes (true)' : 'No (false)';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  /**
   * Dispatches an HTTP POST request to the application's telemetry API endpoint.
   * This ensures the request is captured in the browser DevTools "Network" tab!
   */
  public sendToNetworkTab(endpointName: string, event: TelemetryEvent): void {
    if (!this.config().sendNetworkRequests) {
      return;
    }

    this.isInternalOperation = true;

    const url = `/api/telemetry/${endpointName}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Telemetry-Type': event.eventType,
      'X-Telemetry-Category': event.category,
      'X-Event-Id': event.id,
      'X-Client-Timestamp': event.timestamp
    });

    const payload = {
      eventId: event.id,
      eventType: event.eventType,
      category: event.category,
      summary: event.summary,
      timestamp: event.timestamp,
      url: event.url,
      payload: event.details
    };

    this.http.post(url, payload, { headers }).subscribe({
      next: () => {
        this.isInternalOperation = false;
        event.networkStatus = 'SUCCESS_200';
        this.stats.update(s => ({ ...s, networkRequestsSent: s.networkRequestsSent + 1 }));
      },
      error: () => {
        this.isInternalOperation = false;
        event.networkStatus = 'FAILED';
      }
    });
  }

  /**
   * Helper to manually dispatch an event to Console and Network tab.
   */
  public dispatchNetworkEvent(category: 'CONSOLE' | 'VALUE' | 'MOUSE' | 'KEYBOARD' | 'SYSTEM', eventType: string, details: Record<string, unknown>): void {
    const event: TelemetryEvent = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType: eventType as any,
      category: category,
      summary: `Manual Telemetry Event: ${eventType}`,
      details: details,
      url: window.location.pathname,
      networkStatus: 'PENDING'
    };

    this.recordEvent(event);
    this.sendToNetworkTab(eventType.toLowerCase().replace(/_/g, '-'), event);
  }

  private recordEvent(event: TelemetryEvent): void {
    this.events.update(list => {
      const updated = [event, ...list];
      if (updated.length > this.config().maxStoredEvents) {
        return updated.slice(0, this.config().maxStoredEvents);
      }
      return updated;
    });

    this.stats.update(s => {
      return {
        ...s,
        total: s.total + 1,
        consoleLogs: event.category === 'CONSOLE' ? s.consoleLogs + 1 : s.consoleLogs,
        valueChanges: event.category === 'VALUE' ? s.valueChanges + 1 : s.valueChanges,
        mouseEvents: event.category === 'MOUSE' ? s.mouseEvents + 1 : s.mouseEvents,
        keyboardEvents: event.category === 'KEYBOARD' ? s.keyboardEvents + 1 : s.keyboardEvents
      };
    });
  }

  private describeElement(el: HTMLElement): string {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const name = el.getAttribute('name') ? `[name="${el.getAttribute('name')}"]` : '';
    const ctrl = el.getAttribute('formcontrolname') ? `[formControlName="${el.getAttribute('formcontrolname')}"]` : '';
    const type = el.getAttribute('type') ? `[type="${el.getAttribute('type')}"]` : '';
    return `${tag}${id}${ctrl}${name}${type}`;
  }

  public clearEvents(): void {
    this.events.set([]);
    this.stats.set({
      total: 0,
      consoleLogs: 0,
      valueChanges: 0,
      mouseEvents: 0,
      keyboardEvents: 0,
      networkRequestsSent: 0
    });
  }

  public toggleTracking(): void {
    const next = !this.isTrackingActive();
    this.isTrackingActive.set(next);
  }

  public exportAuditTrailJson(): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.events(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `passport_seva_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
