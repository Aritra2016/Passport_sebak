import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Feature Modules
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { PassportApplicationModule } from './features/passport-application/passport-application.module';
import { AppointmentModule } from './features/appointment/appointment.module';
import { PaymentModule } from './features/payment/payment.module';
import { TrackingModule } from './features/tracking/tracking.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    AuthModule,
    DashboardModule,
    PassportApplicationModule,
    AppointmentModule,
    PaymentModule,
    TrackingModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
