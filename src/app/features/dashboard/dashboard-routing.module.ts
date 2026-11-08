import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard & Applications Overview | Passport Seva Portal',
    data: {
      breadcrumb: 'Dashboard',
      roles: ['CITIZEN', 'PSK_OFFICER', 'POLICE_VERIFIER'],
      description: 'Overview of submitted applications, PSK officer queue, and police verification desk'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
