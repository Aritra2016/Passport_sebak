import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PassportStateService } from '../../../store/passport-state.service';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { pinCodeValidator } from '../../../shared/validators/pincode.validator';
import { dobValidator } from '../../../shared/validators/dob.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  private telemetrySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private stateService: PassportStateService,
    private router: Router,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) {}

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    const isPassword = fieldName?.toLowerCase().includes('password') || fieldName?.toLowerCase().includes('pin');
    const displayVal = isPassword ? '••••••••' : val;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [displayVal]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [displayVal]);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      givenName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      dob: ['1998-05-20', [Validators.required, dobValidator()]],
      passportOffice: ['RPO_DELHI', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['Passport@2026', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['Passport@2026', [Validators.required]]
    });

    // Direct Component tracking - logs with exact register.component.ts line number in DevTools
    console.warn('[RegisterComponent] Initialized FormGroup:', this.registerForm);

    let previousValues = { ...this.registerForm.getRawValue() };
    this.registerForm.valueChanges.subscribe(currentValues => {
      Object.keys(currentValues).forEach(key => {
        const oldVal = previousValues[key];
        const newVal = currentValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          console.warn(`[RegisterComponent] Value changing for "${key}":`, {
            component: 'RegisterComponent',
            field: key,
            oldValue: key.toLowerCase().includes('password') ? '••••••••' : oldVal,
            newValue: key.toLowerCase().includes('password') ? '••••••••' : newVal,
            formStatus: this.registerForm.status,
            formGroup: this.registerForm,
            currentFormValue: currentValues
          });
        }
      });
      previousValues = { ...this.registerForm.getRawValue() };
    });

    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.registerForm,
      'Citizen Registration Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  isFieldInvalid(name: string): boolean {
    const c = this.registerForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const val = this.registerForm.value;
    const fullName = `${val.givenName} ${val.surname}`.trim();

    this.authService.register({
      fullName,
      email: val.email,
      mobile: val.mobile,
      role: 'CITIZEN'
    });

    const user = this.authService.currentUser();
    if (user) {
      this.stateService.syncDraftWithUser(user);
    }

    this.router.navigate(['/dashboard']);
  }
}

