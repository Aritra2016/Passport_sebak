import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { UploadedDocument } from '../../../core/models/passport.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';

@Component({
  selector: 'app-step8-documents',
  templateUrl: './step8-documents.component.html',
  styleUrls: ['./step8-documents.component.css']
})
export class Step8DocumentsComponent implements OnInit {
  @Input() initialDocs: UploadedDocument[] = [];
  @Output() stepComplete = new EventEmitter<UploadedDocument[]>();
  @Output() prevStep = new EventEmitter<void>();

  uploadedDocs: UploadedDocument[] = [];
  isDigilockerOpen = false;

  constructor(
    private notify: NotificationService,
    @Optional() private telemetryService?: ActivityTelemetryService
  ) {}

  ngOnInit(): void {
    this.uploadedDocs = [...(this.initialDocs || [])];

    // If empty, add mock photo document for user convenience
    if (this.uploadedDocs.length === 0) {
      this.uploadedDocs.push({
        id: 'DOC-PHOTO-1',
        category: 'PHOTO',
        name: 'Recent Passport Size Photograph',
        fileName: 'Passport_Photo_Vikram.jpg',
        fileSize: '320 KB',
        uploadDate: new Date().toLocaleDateString('en-IN'),
        verifiedByDigiLocker: false,
        documentType: 'Photograph'
      });
    }

    console.warn('this is coming::::::::', this.uploadedDocs);
  }

  getDocByCategory(category: string): UploadedDocument | null {
    return this.uploadedDocs.find(d => d.category === category) || null;
  }

  onDocUploaded(doc: UploadedDocument): void {
    const oldDoc = this.getDocByCategory(doc.category);
    // Replace if category exists
    this.uploadedDocs = this.uploadedDocs.filter(d => d.category !== doc.category);
    this.uploadedDocs.push(doc);
    this.notify.success(`${doc.name} uploaded successfully.`, 'Document Saved');

    this.telemetryService?.recordAndLogReactiveFormChange({
      formName: 'Step 8: Document Upload & DigiLocker Form',
      controlName: doc.category,
      label: doc.name,
      oldValue: oldDoc ? oldDoc.fileName : '(none)',
      newValue: `${doc.fileName} (${doc.fileSize})`,
      formStatus: this.isAllMandatoryUploaded() ? 'VALID' : 'INVALID',
      componentInstance: this
    });
  }

  onDocRemoved(docId: string): void {
    const doc = this.uploadedDocs.find(d => d.id === docId);
    this.uploadedDocs = this.uploadedDocs.filter(d => d.id !== docId);

    if (doc) {
      this.telemetryService?.recordAndLogReactiveFormChange({
        formName: 'Step 8: Document Upload & DigiLocker Form',
        controlName: doc.category,
        label: doc.name,
        oldValue: doc.fileName,
        newValue: '(removed)',
        formStatus: this.isAllMandatoryUploaded() ? 'VALID' : 'INVALID',
        componentInstance: this
      });
    }
  }

  openDigilocker(): void {
    this.isDigilockerOpen = true;
  }

  onDigilockerImport(docs: UploadedDocument[]): void {
    docs.forEach(doc => {
      this.uploadedDocs = this.uploadedDocs.filter(d => d.category !== doc.category);
      this.uploadedDocs.push(doc);
    });
    this.notify.success(`${docs.length} verified documents imported from DigiLocker!`, 'DigiLocker Synced');

    this.telemetryService?.recordAndLogReactiveFormChange({
      formName: 'Step 8: Document Upload & DigiLocker Form',
      controlName: 'digilockerImport',
      label: 'DigiLocker Verified Documents',
      oldValue: '(empty)',
      newValue: `${docs.length} verified certificates imported`,
      formStatus: this.isAllMandatoryUploaded() ? 'VALID' : 'INVALID',
      componentInstance: this
    });
  }

  isAllMandatoryUploaded(): boolean {
    const cats = new Set(this.uploadedDocs.map(d => d.category));
    return cats.has('IDENTITY_PROOF') && cats.has('ADDRESS_PROOF') && cats.has('DOB_PROOF');
  }

  onPrev(): void {
    this.prevStep.emit();
  }

  onNext(): void {
    this.stepComplete.emit(this.uploadedDocs);
  }
}

