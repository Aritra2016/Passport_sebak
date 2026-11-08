import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { AppointmentSlot, PassportApplication, PaymentDetails } from '../../core/models/passport.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  application?: PassportApplication;
  selectedGateway: 'SBI_EPAY' | 'PAYU' | 'RAZORPAY' = 'SBI_EPAY';
  selectedMode: 'UPI' | 'NET_BANKING' | 'CARD' = 'UPI';
  optSmsService = true;
  upiVpa = 'citizen@okaxis';

  showGatewayModal = false;
  paymentProcessingStage: 'INPUT' | 'PROCESSING' | 'SUCCESS' = 'INPUT';
  lastTransactionId = '';

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    const isPassword = fieldName?.toLowerCase().includes('password') || fieldName?.toLowerCase().includes('pin') || fieldName?.toLowerCase().includes('cvv');
    const displayVal = isPassword ? '•••' : val;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [displayVal]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [displayVal]);
    }
  }

  constructor(
    public stateService: PassportStateService,
    private route: ActivatedRoute,
    private router: Router,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const queryArn = this.route.snapshot.queryParams['arn'];
    const apps = this.stateService.applications();

    if (queryArn) {
      this.application = this.stateService.getApplicationByArn(queryArn);
    } else if (apps.length > 0) {
      this.application = apps[0];
    }

    console.warn('[PaymentComponent] Initialized:', {
      arn: this.application?.arn,
      application: this.application,
      selectedGateway: this.selectedGateway,
      selectedMode: this.selectedMode,
      totalFee: this.calculateTotal()
    });
  }

  calculateTotal(): number {
    let total = 1500;
    if (this.application?.serviceType?.schemeType === 'TATKAAL') {
      total += 2000;
    }
    if (this.application?.serviceType?.bookletSize === '60_PAGES') {
      total += 500;
    }
    if (this.optSmsService) {
      total += 50;
    }
    return total;
  }

  getGatewayName(): string {
    switch (this.selectedGateway) {
      case 'SBI_EPAY': return 'SBI ePay (Govt. Partner)';
      case 'PAYU': return 'PayU Payments';
      case 'RAZORPAY': return 'Razorpay';
      default: return 'Online Gateway';
    }
  }

  openPaymentBridge(): void {
    console.warn('[PaymentComponent] Opening payment bridge modal:', {
      gateway: this.selectedGateway,
      mode: this.selectedMode,
      totalFee: this.calculateTotal()
    });
    this.paymentProcessingStage = 'INPUT';
    this.showGatewayModal = true;
  }

  processPayment(): void {
    console.warn('[PaymentComponent] Initiating payment transaction via:', this.selectedGateway);
    this.paymentProcessingStage = 'PROCESSING';

    setTimeout(() => {
      this.paymentProcessingStage = 'SUCCESS';
      this.lastTransactionId = `SBIePay${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      if (this.application) {
        const paymentDetails: PaymentDetails = {
          arn: this.application.arn,
          baseFee: 1500,
          tatkaalFee: this.application.serviceType.schemeType === 'TATKAAL' ? 2000 : 0,
          bookletExtraFee: this.application.serviceType.bookletSize === '60_PAGES' ? 500 : 0,
          smsFee: this.optSmsService ? 50 : 0,
          totalFee: this.calculateTotal(),
          paymentMethod: this.selectedGateway,
          paymentMode: this.selectedMode,
          transactionId: this.lastTransactionId,
          paymentDate: new Date().toISOString(),
          status: 'SUCCESS'
        };

        console.warn('[PaymentComponent] Payment successful, recording details:', paymentDetails);
        this.stateService.recordPayment(this.application.arn, paymentDetails);

        // If slot is held in state, confirm appointment
        const heldSlot = this.stateService.activeSlotHold();
        if (heldSlot) {
          this.stateService.confirmAppointmentForApplication(this.application.arn, heldSlot);
        } else if (!this.application.appointment) {
          // Provide default slot if none explicitly selected
          const defaultSlot: AppointmentSlot = {
            pskId: 'PSK-DEL-01',
            pskName: 'PSK Herald House, ITO, New Delhi',
            pskAddress: 'Herald House, 5-A, Bahadur Shah Zafar Marg, ITO, New Delhi 110002',
            appointmentDate: '15 Nov 2026',
            appointmentTime: '10:00 AM',
            batchNumber: 'BATCH-A04'
          };
          this.stateService.confirmAppointmentForApplication(this.application.arn, defaultSlot);
        }
      }
    }, 1400);
  }

  goToReceipt(): void {
    this.showGatewayModal = false;
    this.router.navigate(['/payment/receipt'], { queryParams: { arn: this.application?.arn } });
  }
}

