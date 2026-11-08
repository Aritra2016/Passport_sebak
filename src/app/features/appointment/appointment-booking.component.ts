import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { AppointmentSlot, PassportApplication, PskLocation } from '../../core/models/passport.model';
import { NotificationService } from '../../core/services/notification.service';

export interface CalendarDay {
  date: string;
  dayNumber: number;
  dayName: string;
  isAvailable: boolean;
  isFastFilling: boolean;
  isFull: boolean;
  isPast: boolean;
  slotsCount: number;
}

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.css']
})
export class AppointmentBookingComponent implements OnInit {
  selectedArn = '';
  activeApplication?: PassportApplication;

  selectedState = 'DELHI';
  selectedDistrict = 'ALL';
  selectedCenterType = 'ALL';

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [val]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [val]);
    }
  }

  allKendras: PskLocation[] = [
    {
      id: 'PSK-DEL-01',
      name: 'PSK Herald House, ITO',
      type: 'PSK',
      state: 'DELHI',
      district: 'CENTRAL DELHI',
      address: 'Herald House, 5-A, Bahadur Shah Zafar Marg, ITO, New Delhi',
      pinCode: '110002',
      earliestAvailableDate: '10 Nov 2026',
      availableSlotCount: 42,
      operatingHours: '09:00 AM - 05:00 PM'
    },
    {
      id: 'PSK-DEL-02',
      name: 'PSK Shalimar Place, Rohini',
      type: 'PSK',
      state: 'DELHI',
      district: 'NORTH WEST DELHI',
      address: 'Aggarwal City Mall, Pitampura / Shalimar Bagh, New Delhi',
      pinCode: '110088',
      earliestAvailableDate: '12 Nov 2026',
      availableSlotCount: 28,
      operatingHours: '09:00 AM - 05:00 PM'
    },
    {
      id: 'POPSK-DEL-03',
      name: 'POPSK Krishna Nagar Head Post Office',
      type: 'POPSK',
      state: 'DELHI',
      district: 'EAST DELHI',
      address: 'Krishna Nagar Head Post Office Complex, East Delhi',
      pinCode: '110051',
      earliestAvailableDate: '15 Nov 2026',
      availableSlotCount: 14,
      operatingHours: '09:30 AM - 04:30 PM'
    },
    {
      id: 'PSK-MUM-01',
      name: 'PSK Andheri East, Mumbai',
      type: 'PSK',
      state: 'MAHARASHTRA',
      district: 'MUMBAI SUBURBAN',
      address: 'The Great Oasis, D-9, Road No. 21, MIDC, Andheri East, Mumbai',
      pinCode: '400093',
      earliestAvailableDate: '11 Nov 2026',
      availableSlotCount: 35,
      operatingHours: '09:00 AM - 05:00 PM'
    },
    {
      id: 'PSK-BLR-01',
      name: 'PSK Lalbagh, Bengaluru',
      type: 'PSK',
      state: 'KARNATAKA',
      district: 'BENGALURU URBAN',
      address: 'Salarpuria Grange, 45/1, Mission Road, Near Subbaiah Circle, Bengaluru',
      pinCode: '560027',
      earliestAvailableDate: '09 Nov 2026',
      availableSlotCount: 50,
      operatingHours: '09:00 AM - 05:00 PM'
    }
  ];

  filteredKendras: PskLocation[] = [];
  availableDistricts: string[] = ['CENTRAL DELHI', 'NORTH WEST DELHI', 'EAST DELHI', 'SOUTH DELHI'];

  selectedKendra: PskLocation | null = null;
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  selectedTime = '';

  readonly morningSlots = ['09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM'];
  readonly afternoonSlots = ['01:30 PM', '02:15 PM', '03:00 PM', '03:45 PM'];

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
      this.selectedArn = queryArn;
    } else if (apps.length > 0) {
      this.selectedArn = apps[0].arn;
    }

    this.loadActiveApplication();
    this.onFilterChange();
    this.generateCalendarDays();

    console.warn('[AppointmentBookingComponent] Initialized:', { arn: this.selectedArn, app: this.activeApplication });
    console.warn('this is coming::::::::', this.filteredKendras);
  }

  loadActiveApplication(): void {
    this.activeApplication = this.stateService.getApplicationByArn(this.selectedArn);
    if (this.activeApplication?.addressDetails?.state) {
      const st = this.activeApplication.addressDetails.state.toUpperCase();
      if (this.allKendras.some(k => k.state === st)) {
        this.selectedState = st;
      }
    }
  }

  onArnChange(arn: string): void {
    this.selectedArn = arn;
    this.loadActiveApplication();
  }

  onFilterChange(): void {
    this.filteredKendras = this.allKendras.filter(k => {
      const matchState = k.state === this.selectedState;
      const matchDist = this.selectedDistrict === 'ALL' || k.district === this.selectedDistrict;
      const matchType = this.selectedCenterType === 'ALL' || k.type === this.selectedCenterType;
      return matchState && matchDist && matchType;
    });

    if (this.filteredKendras.length > 0) {
      this.selectKendra(this.filteredKendras[0]);
    } else {
      this.selectedKendra = null;
    }
  }

  selectKendra(k: PskLocation): void {
    this.selectedKendra = k;
    this.selectedDay = null;
    this.selectedTime = '';
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    this.calendarDays = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Generate 14 days starting from Nov 08, 2026
    for (let i = 1; i <= 14; i++) {
      const dayNum = 7 + i;
      const dateStr = `${dayNum.toString().padStart(2, '0')} Nov 2026`;
      const dayIndex = (dayNum + 6) % 7;
      const name = dayNames[dayIndex];

      const isSunday = name === 'SUN';
      const isPast = i < 2;

      let slots = 0;
      let isAvail = false;
      let isFast = false;
      let isFull = false;

      if (!isSunday && !isPast) {
        if (i % 5 === 0) {
          isFull = true;
          slots = 0;
        } else if (i % 3 === 0) {
          isFast = true;
          slots = 6;
        } else {
          isAvail = true;
          slots = 24 + (i * 3);
        }
      }

      this.calendarDays.push({
        date: dateStr,
        dayNumber: dayNum,
        dayName: name,
        isAvailable: isAvail,
        isFastFilling: isFast,
        isFull: isFull || isSunday,
        isPast: isPast,
        slotsCount: slots
      });
    }

    // Default select first available
    const firstAvail = this.calendarDays.find(d => d.isAvailable);
    if (firstAvail) {
      this.selectDay(firstAvail);
    }
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
    this.selectedTime = this.morningSlots[1]; // default 10:00 AM
  }

  onHoldSlot(): void {
    if (!this.selectedKendra || !this.selectedDay || !this.selectedTime) return;

    const slot: AppointmentSlot = {
      pskId: this.selectedKendra.id,
      pskName: this.selectedKendra.name,
      pskAddress: this.selectedKendra.address,
      appointmentDate: this.selectedDay.date,
      appointmentTime: this.selectedTime,
      batchNumber: `BATCH-${this.selectedTime.replace(/[^0-9]/g, '')}`
    };

    // Trigger 10-minute slot hold
    this.stateService.holdSlot(slot, 10);
  }

  proceedToPayment(): void {
    this.router.navigate(['/payment'], { queryParams: { arn: this.selectedArn } });
  }
}

