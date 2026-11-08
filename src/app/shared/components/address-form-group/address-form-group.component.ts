import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface StateDistrictMap {
  [state: string]: string[];
}

@Component({
  selector: 'app-address-form-group',
  templateUrl: './address-form-group.component.html',
  styleUrls: ['./address-form-group.component.css']
})
export class AddressFormGroupComponent implements OnInit {
  @Input() addressGroup!: FormGroup;
  @Input() prefix = 'addr_';

  readonly stateDistrictMap: StateDistrictMap = {
    'DELHI': ['CENTRAL DELHI', 'EAST DELHI', 'NEW DELHI', 'NORTH DELHI', 'NORTH EAST DELHI', 'NORTH WEST DELHI', 'SOUTH DELHI', 'SOUTH WEST DELHI', 'WEST DELHI'],
    'MAHARASHTRA': ['MUMBAI CITY', 'MUMBAI SUBURBAN', 'PUNE', 'THANE', 'NAGPUR', 'NASHIK', 'AURANGABAD', 'KOLHAPUR', 'SOLAPUR', 'AMRAVATI'],
    'KARNATAKA': ['BENGALURU URBAN', 'BENGALURU RURAL', 'MYSURU', 'MANGALURU', 'BELAGAVI', 'HUBBALLI-DHARWAD', 'KALABURAGI', 'SHIVAMOGGA'],
    'TAMIL NADU': ['CHENNAI', 'COIMBATORE', 'MADURAI', 'TIRUCHIRAPPALLI', 'SALEM', 'TIRUNELVELI', 'VELLORE', 'ERODE'],
    'WEST BENGAL': ['KOLKATA', 'NORTH 24 PARGANAS', 'SOUTH 24 PARGANAS', 'HOWRAH', 'HOOGHLY', 'DARJEELING', 'PASCHIM MEDINIPUR', 'PURBA BARDHAMAN'],
    'GUJARAT': ['AHMEDABAD', 'SURAT', 'VADODARA', 'RAJKOT', 'GANDHINAGAR', 'BHAVNAGAR', 'JAMNAGAR', 'JUNAGADH'],
    'UTTAR PRADESH': ['LUCKNOW', 'NOIDA (GAUTAM BUDDHA NAGAR)', 'GHAZIABAD', 'KANPUR', 'VARANASI', 'AGRA', 'PRAYAGRAJ', 'MEERUT', 'ALIGARH'],
    'TELANGANA': ['HYDERABAD', 'RANGAREDDY', 'MEDCHAL-MALKAJGIRI', 'WARANGAL', 'NIZAMABAD', 'KARIMNAGAR'],
    'KERALA': ['THIRUVANANTHAPURAM', 'ERNAKULAM (KOCHI)', 'KOZHIKODE', 'THRISSUR', 'MALAPPURAM', 'KANNUR', 'KOLLAM'],
    'RAJASTHAN': ['JAIPUR', 'JODHPUR', 'UDAIPUR', 'KOTA', 'AJMER', 'BIKANER', 'ALWAR'],
    'PUNJAB': ['AMRITSAR', 'LUDHIANA', 'JALANDHAR', 'PATIALA', 'BATHINDA', 'MOHALI (SAS NAGAR)'],
    'HARYANA': ['GURUGRAM', 'FARIDABAD', 'PANIPAT', 'AMBALA', 'KARNAL', 'HISAR', 'ROHTAK'],
    'BIHAR': ['PATNA', 'GAYA', 'BHAGALPUR', 'MUZAFFARPUR', 'PURNEA', 'DARBHANGA'],
    'MADHYA PRADESH': ['BHOPAL', 'INDORE', 'JABALPUR', 'GWALIOR', 'UJJAIN', 'SAGAR']
  };

  stateList: string[] = [];
  availableDistricts: string[] = [];

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    console.warn('Input value: ' + val, [val]);
  }

  ngOnInit(): void {
    this.stateList = Object.keys(this.stateDistrictMap).sort();
    const currentState = this.addressGroup.get('state')?.value;
    if (currentState && this.stateDistrictMap[currentState]) {
      this.availableDistricts = this.stateDistrictMap[currentState];
    } else {
      this.availableDistricts = ['CENTRAL DISTRICT', 'NORTH DISTRICT', 'SOUTH DISTRICT', 'EAST DISTRICT', 'WEST DISTRICT'];
    }
  }

  onStateChange(event: any): void {
    const selected = event.target.value;
    if (selected && this.stateDistrictMap[selected]) {
      this.availableDistricts = this.stateDistrictMap[selected];
    } else {
      this.availableDistricts = ['DISTRICT 1', 'DISTRICT 2', 'DISTRICT 3'];
    }
    this.addressGroup.get('district')?.setValue('');
  }

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.addressGroup.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}

