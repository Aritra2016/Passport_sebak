import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackingComponent } from './tracking.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TrackingComponent,
    canActivate: [AuthGuard],
    title: 'Live Application Status Tracking Pipeline | Passport Seva',
    data: {
      breadcrumb: 'Track Status',
      roles: ['CITIZEN', 'PSK_OFFICER', 'POLICE_VERIFIER'],
      description: '5-stage visual progress pipeline and India Post Speed Post consignment tracking'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackingRoutingModule {}
