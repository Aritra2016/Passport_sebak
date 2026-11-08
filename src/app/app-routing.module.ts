import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout & Core Guards
import { HomeComponent } from './core/layout/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UnsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { RoleGuard } from './core/guards/role.guard';

// Resolvers
import { ApplicationListResolve } from './core/resolvers/application-list.resolver';
import { ApplicationDetailResolve } from './core/resolvers/application-detail.resolver';
import { PskListResolve } from './core/resolvers/psk-list.resolver';

// View Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ApplicationContainerComponent } from './features/passport-application/application-container.component';
import { AppointmentBookingComponent } from './features/appointment/appointment-booking.component';
import { PaymentComponent } from './features/payment/payment.component';
import { ReceiptComponent } from './features/payment/receipt.component';
import { TrackingComponent } from './features/tracking/tracking.component';

/**
 * ========================================================================
 * MASTER APPLICATION ROUTING CONFIGURATION (PASSPORT SEVA 2.0)
 * ========================================================================
 * Reference Pattern:
 * - Root shell with HomeComponent layout wrapper
 * - Protected with AuthGuard and CanActivateChild
 * - Children routes mapped directly to specific components with Resolvers & Guards
 * - Parameterized child routes (:arn) for direct deep-linking
 * - Wildcard fallback route with onSameUrlNavigation: 'reload'
 * ========================================================================
 */
const routes: Routes = [
  // ----------------------------------------------------------------------
  // 1. Root Redirect
  // ----------------------------------------------------------------------
  {
    path: '',
    redirectTo: 'home/dashboard',
    pathMatch: 'full'
  },

  // ----------------------------------------------------------------------
  // 2. Public Authentication Routes (Outside Home layout shell)
  // ----------------------------------------------------------------------
  {
    path: 'auth/login',
    component: LoginComponent,
    title: 'Sign In | Passport Seva Portal'
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    title: 'Citizen Registration | Passport Seva Portal'
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },

  // ----------------------------------------------------------------------
  // 3. Authenticated Portal Shell (Protected with AuthGuard & CanActivateChild)
  // ----------------------------------------------------------------------
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // --- Dashboard & Operational Queues ---
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Citizen Dashboard | Passport Seva Portal',
        resolve: { applicationList: ApplicationListResolve }
      },
      {
        path: 'officer-queue',
        component: DashboardComponent,
        title: 'PSK Counter Granting Queue | Passport Seva Portal',
        canActivate: [RoleGuard],
        data: { roles: ['PSK_OFFICER'] },
        resolve: { applicationList: ApplicationListResolve }
      },
      {
        path: 'police-queue',
        component: DashboardComponent,
        title: 'Police Verification Queue | Passport Seva Portal',
        canActivate: [RoleGuard],
        data: { roles: ['POLICE_VERIFIER'] },
        resolve: { applicationList: ApplicationListResolve }
      },

      // --- Multi-Step Passport Application Wizard ---
      {
        path: 'passport-application',
        component: ApplicationContainerComponent,
        canDeactivate: [UnsavedChangesGuard],
        title: 'Apply for Indian Passport (Steps 1 to 9) | Passport Seva'
      },
      {
        path: 'passport-application/:arn',
        component: ApplicationContainerComponent,
        canDeactivate: [UnsavedChangesGuard],
        title: 'Edit Passport Application | Passport Seva',
        resolve: { applicationDetail: ApplicationDetailResolve }
      },

      // --- PSK Selection & Appointment Slot Booking ---
      {
        path: 'appointment',
        component: AppointmentBookingComponent,
        title: 'Schedule PSK Appointment | Passport Seva',
        resolve: { pskList: PskListResolve }
      },
      {
        path: 'appointment/:arn',
        component: AppointmentBookingComponent,
        title: 'Schedule PSK Appointment | Passport Seva',
        resolve: { applicationDetail: ApplicationDetailResolve, pskList: PskListResolve }
      },

      // --- Fee Calculation & Payment Gateway Checkout ---
      {
        path: 'payment',
        component: PaymentComponent,
        title: 'Statutory Fee Payment | Passport Seva'
      },
      {
        path: 'payment/:arn',
        component: PaymentComponent,
        title: 'Statutory Fee Payment | Passport Seva',
        resolve: { applicationDetail: ApplicationDetailResolve }
      },

      // --- Official Printable ARN Appointment Receipt ---
      {
        path: 'receipt',
        component: ReceiptComponent,
        title: 'Official Appointment E-Receipt (ARN) | Passport Seva'
      },
      {
        path: 'receipt/:arn',
        component: ReceiptComponent,
        title: 'Official Appointment E-Receipt (ARN) | Passport Seva',
        resolve: { applicationDetail: ApplicationDetailResolve }
      },

      // --- Live Status Tracking Milestone Pipeline ---
      {
        path: 'tracking',
        component: TrackingComponent,
        title: 'Live Application Status Tracking Pipeline | Passport Seva'
      },
      {
        path: 'tracking/:arn',
        component: TrackingComponent,
        title: 'Live Application Status Tracking Pipeline | Passport Seva',
        resolve: { applicationDetail: ApplicationDetailResolve }
      }
    ]
  },

  // ----------------------------------------------------------------------
  // 4. Convenience URL Aliases
  // ----------------------------------------------------------------------
  { path: 'dashboard', redirectTo: 'home/dashboard', pathMatch: 'full' },
  { path: 'apply', redirectTo: 'home/passport-application', pathMatch: 'full' },
  { path: 'passport-application', redirectTo: 'home/passport-application', pathMatch: 'full' },
  { path: 'appointment', redirectTo: 'home/appointment', pathMatch: 'full' },
  { path: 'book-slot', redirectTo: 'home/appointment', pathMatch: 'full' },
  { path: 'payment', redirectTo: 'home/payment', pathMatch: 'full' },
  { path: 'receipt', redirectTo: 'home/receipt', pathMatch: 'full' },
  { path: 'tracking', redirectTo: 'home/tracking', pathMatch: 'full' },
  { path: 'track', redirectTo: 'home/tracking', pathMatch: 'full' },

  // ----------------------------------------------------------------------
  // 5. Wildcard Fallback Route
  // ----------------------------------------------------------------------
  {
    path: '**',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
