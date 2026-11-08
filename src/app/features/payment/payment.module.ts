import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { ReceiptComponent } from './receipt.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    PaymentComponent,
    ReceiptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    PaymentRoutingModule
  ],
  exports: [
    PaymentComponent,
    ReceiptComponent
  ]
})
export class PaymentModule {}
