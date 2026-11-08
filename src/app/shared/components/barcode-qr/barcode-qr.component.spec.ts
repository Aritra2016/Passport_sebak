import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeQrComponent } from './barcode-qr.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BarcodeQrComponent', () => {
  let component: BarcodeQrComponent;
  let fixture: ComponentFixture<BarcodeQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarcodeQrComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeQrComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
