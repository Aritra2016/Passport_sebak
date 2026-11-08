import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step9ReviewComponent } from './step9-review.component';
import { MaskPipe } from '../../../shared/pipes/mask.pipe';
import { PassportStateService } from '../../../store/passport-state.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Step9ReviewComponent', () => {
  let component: Step9ReviewComponent;
  let fixture: ComponentFixture<Step9ReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Step9ReviewComponent, MaskPipe],
      providers: [PassportStateService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Step9ReviewComponent);
    component = fixture.componentInstance;

    const stateService = TestBed.inject(PassportStateService);
    component.application = stateService.initNewDraft();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
