import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptComponent } from './receipt.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PassportStateService } from '../../store/passport-state.service';
import { MaskPipe } from '../../shared/pipes/mask.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReceiptComponent', () => {
  let component: ReceiptComponent;
  let fixture: ComponentFixture<ReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ReceiptComponent, MaskPipe],
      providers: [PassportStateService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
