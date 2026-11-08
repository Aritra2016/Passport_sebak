import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PassportStateService } from '../../../store/passport-state.service';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { UserRole } from '../../../core/models/passport.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  otpSent = false;
  returnUrl = '/dashboard';
  private telemetrySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private stateService: PassportStateService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) { }

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + (fieldName === 'password' ? '••••••••' : val), [fieldName === 'password' ? '••••••••' : val]);
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.fb.group({
      loginId: ['vikram.sharma@example.gov.in', [Validators.required]],
      fullName: [''],
      authMode: ['PASSWORD', [Validators.required]],
      password: ['Passport@2026', [Validators.required]],
      otp: [''],
      role: ['CITIZEN', [Validators.required]]
    });

    this.loginForm.get('authMode')?.valueChanges.subscribe(mode => {
      if (mode === 'OTP') {
        this.loginForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.loginForm.get('password')?.clearValidators();
      } else {
        this.loginForm.get('password')?.setValidators([Validators.required]);
        this.loginForm.get('otp')?.clearValidators();
      }
      this.loginForm.get('otp')?.updateValueAndValidity();
      this.loginForm.get('password')?.updateValueAndValidity();
    });

    // Direct Component tracking - logs with exact login.component.ts line number in DevTools
    console.warn('createLoginFormGroup:', this.loginForm.getRawValue());
    console.warn('[LoginComponent] Initialized FormGroup:', this.loginForm);

    let previousValues = { ...this.loginForm.getRawValue() };
    this.loginForm.valueChanges.subscribe(currentValues => {
      Object.keys(currentValues).forEach(key => {
        const oldVal = previousValues[key];
        const newVal = currentValues[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          console.warn(`[LoginComponent] Value changing for "${key}":`, {
            component: 'LoginComponent',
            field: key,
            oldValue: key === 'password' ? '••••••••' : oldVal,
            newValue: key === 'password' ? '••••••••' : newVal,
            formStatus: this.loginForm.status,
            formGroup: this.loginForm,
            currentFormValue: currentValues
          });
        }
      });
      previousValues = { ...this.loginForm.getRawValue() };
    });

    this.telemetrySub = this.telemetryService?.trackReactiveForm(
      this,
      this.loginForm,
      'Citizen Sign-In Form'
    );
  }

  ngOnDestroy(): void {
    this.telemetrySub?.unsubscribe();
  }

  generateOtp(): void {
    this.otpSent = true;
    this.loginForm.get('otp')?.setValue('123456');
  }

  quickLogin(role: UserRole): void {
    const creds: Record<UserRole, { id: string; name: string }> = {
      CITIZEN: { id: 'vikram.sharma@example.gov.in', name: 'Vikramaditya Sharma' },
      PSK_OFFICER: { id: 'officer.delhi@passportindia.gov.in', name: 'Rajesh Verma' },
      POLICE_VERIFIER: { id: 'inspector.kulkarni@delhipolice.gov.in', name: 'Amit Kulkarni' }
    };

    const target = creds[role];
    this.authService.login(target.id, 'Passport@2026', role, target.name);
    const user = this.authService.currentUser();
    if (user && role === 'CITIZEN') {
      this.stateService.syncDraftWithUser(user);
    }
    this.router.navigateByUrl(this.returnUrl);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const val = this.loginForm.value;
    const cred = val.authMode === 'OTP' ? val.otp : val.password;

    this.authService.login(val.loginId, cred, val.role, val.fullName);
    const user = this.authService.currentUser();
    if (user && val.role === 'CITIZEN') {
      this.stateService.syncDraftWithUser(user);
    }
    this.router.navigateByUrl(this.returnUrl);
  }
}

