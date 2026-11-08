import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploaderComponent } from './file-uploader.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FileUploaderComponent', () => {
  let component: FileUploaderComponent;
  let fixture: ComponentFixture<FileUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileUploaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploaderComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
