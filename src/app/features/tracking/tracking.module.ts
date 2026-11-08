import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingRoutingModule } from './tracking-routing.module';
import { TrackingComponent } from './tracking.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    TrackingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TrackingRoutingModule
  ],
  exports: [
    TrackingComponent
  ]
})
export class TrackingModule {}
