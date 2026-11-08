import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { ReceiptComponent } from './receipt.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    canActivate: [AuthGuard],
    title: 'Statutory Passport Fee Payment | Passport Seva',
    data: {
      breadcrumb: 'Fee & Payment',
      roles: ['CITIZEN'],
      description: 'Fee calculation breakdown and payment gateway bridge (SBI ePay, PayU, Razorpay)'
    }
  },
  {
    path: 'receipt',
    component: ReceiptComponent,
    canActivate: [AuthGuard],
    title: 'Official Appointment E-Receipt (ARN) | Passport Seva',
    data: {
      breadcrumb: 'Appointment Receipt',
      roles: ['CITIZEN'],
      description: 'Printable official MEA appointment receipt with scannable Barcode & QR Code'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {}
