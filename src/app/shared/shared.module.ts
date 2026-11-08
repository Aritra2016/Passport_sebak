import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { StepperComponent } from './components/stepper/stepper.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { AddressFormGroupComponent } from './components/address-form-group/address-form-group.component';
import { DigilockerModalComponent } from './components/digilocker-modal/digilocker-modal.component';
import { BarcodeQrComponent } from './components/barcode-qr/barcode-qr.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TelemetryInspectorComponent } from './components/telemetry-inspector/telemetry-inspector.component';
import { HomeComponent } from '../core/layout/home/home.component';

// Directives
import { UpperCaseDirective } from './directives/uppercase.directive';
import { InputMaskDirective } from './directives/input-mask.directive';

// Pipes
import { MaskPipe } from './pipes/mask.pipe';
import { StatusBadgePipe } from './pipes/status-badge.pipe';

@NgModule({
  declarations: [
    HomeComponent,
    StepperComponent,
    FileUploaderComponent,
    AddressFormGroupComponent,
    DigilockerModalComponent,
    BarcodeQrComponent,
    NavbarComponent,
    FooterComponent,
    TelemetryInspectorComponent,
    UpperCaseDirective,
    InputMaskDirective,
    MaskPipe,
    StatusBadgePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HomeComponent,
    StepperComponent,
    FileUploaderComponent,
    AddressFormGroupComponent,
    DigilockerModalComponent,
    BarcodeQrComponent,
    NavbarComponent,
    FooterComponent,
    TelemetryInspectorComponent,
    UpperCaseDirective,
    InputMaskDirective,
    MaskPipe,
    StatusBadgePipe
  ]
})
export class SharedModule {}

