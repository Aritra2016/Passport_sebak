import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentBookingComponent } from './appointment-booking.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AppointmentBookingComponent,
    canActivate: [AuthGuard],
    title: 'Schedule PSK Appointment & Slot Hold | Passport Seva',
    data: {
      breadcrumb: 'Schedule Appointment',
      roles: ['CITIZEN'],
      description: 'PSK Locator, color-coded interactive calendar, and 10-minute slot hold countdown'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule {}
