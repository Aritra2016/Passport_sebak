import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PskLocation } from '../models/passport.model';

@Injectable({
  providedIn: 'root'
})
export class PskListResolve implements Resolve<PskLocation[]> {
  private readonly kendras: PskLocation[] = [
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

  resolve(): Observable<PskLocation[]> {
    return of(this.kendras);
  }
}

