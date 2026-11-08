import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Citizen Sign In | Passport Seva Portal',
    data: {
      breadcrumb: 'Sign In',
      description: 'Applicant Login with password/OTP and 1-Click Role Switcher'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'New Citizen Registration | Passport Seva Portal',
    data: {
      breadcrumb: 'Registration',
      description: 'Register as new Citizen Applicant on Passport Seva Online Portal'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
