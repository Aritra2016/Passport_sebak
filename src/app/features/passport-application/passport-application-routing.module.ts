import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationContainerComponent } from './application-container.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

const routes: Routes = [
  {
    path: '',
    component: ApplicationContainerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [UnsavedChangesGuard],
    title: 'Passport Application Wizard (Steps 1 to 9) | Passport Seva',
    data: {
      breadcrumb: 'Apply for Passport',
      roles: ['CITIZEN'],
      description: '9-step wizard for Fresh / Re-issue Indian Passport applications with DigiLocker e-KYC'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PassportApplicationRoutingModule {}
