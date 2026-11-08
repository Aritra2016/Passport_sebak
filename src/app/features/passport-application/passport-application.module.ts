import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PassportApplicationRoutingModule } from './passport-application-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Components
import { ApplicationContainerComponent } from './application-container.component';
import { Step1ServiceTypeComponent } from './steps/step1-service-type.component';
import { Step2PersonalDetailsComponent } from './steps/step2-personal-details.component';
import { Step3FamilyDetailsComponent } from './steps/step3-family-details.component';
import { Step4AddressDetailsComponent } from './steps/step4-address-details.component';
import { Step5EmergencyContactComponent } from './steps/step5-emergency-contact.component';
import { Step6PreviousPassportComponent } from './steps/step6-previous-passport.component';
import { Step7DeclarationsComponent } from './steps/step7-declarations.component';
import { Step8DocumentsComponent } from './steps/step8-documents.component';
import { Step9ReviewComponent } from './steps/step9-review.component';

@NgModule({
  declarations: [
    ApplicationContainerComponent,
    Step1ServiceTypeComponent,
    Step2PersonalDetailsComponent,
    Step3FamilyDetailsComponent,
    Step4AddressDetailsComponent,
    Step5EmergencyContactComponent,
    Step6PreviousPassportComponent,
    Step7DeclarationsComponent,
    Step8DocumentsComponent,
    Step9ReviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PassportApplicationRoutingModule
  ],
  exports: [
    ApplicationContainerComponent
  ]
})
export class PassportApplicationModule {}
