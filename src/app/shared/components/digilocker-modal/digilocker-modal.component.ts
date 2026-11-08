import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadedDocument } from '../../../core/models/passport.model';

@Component({
  selector: 'app-digilocker-modal',
  templateUrl: './digilocker-modal.component.html',
  styleUrls: ['./digilocker-modal.component.css']
})
export class DigilockerModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() documentsImported = new EventEmitter<UploadedDocument[]>();

  authStage: 'LOGIN' | 'CONSENT' | 'SUCCESS' = 'LOGIN';
  identifier = '';
  securityPin = '';

  selectAadhaar = true;
  selectClassX = true;
  selectDl = true;

  isFetching = false;
  importedDocs: UploadedDocument[] = [];

  onInputChange(event: any, fieldName?: string): void {
    const val = event?.target ? event.target.value : event;
    const key = event?.key;
    const isPassword = fieldName?.toLowerCase().includes('pin');
    const displayVal = isPassword ? '••••••' : val;
    if (key) {
      console.warn(`[Keyboard Event: keyup] Field: "${fieldName}", Key Pressed: "${key}", Current Value:`, [displayVal]);
    } else {
      console.warn(`[Input Event] Field: "${fieldName}", Current Value:`, [displayVal]);
    }
  }

  autoFillDemo(): void {
    this.identifier = '3675 9834 6012';
    this.securityPin = '123456';
  }

  proceedToConsent(): void {
    this.authStage = 'CONSENT';
  }

  getSelectedCount(): number {
    let count = 0;
    if (this.selectAadhaar) count++;
    if (this.selectClassX) count++;
    if (this.selectDl) count++;
    return count;
  }

  fetchDocuments(): void {
    this.isFetching = true;

    setTimeout(() => {
      this.isFetching = false;
      this.importedDocs = [];

      if (this.selectAadhaar) {
        this.importedDocs.push({
          id: `DOC-DL-${Date.now()}-1`,
          category: 'IDENTITY_PROOF',
          name: 'Aadhaar Card (e-KYC)',
          fileName: 'UIDAI_Aadhaar_Verified.xml',
          fileSize: '428 KB',
          uploadDate: new Date().toLocaleDateString('en-IN'),
          verifiedByDigiLocker: true,
          documentType: 'Aadhaar Card'
        });
      }

      if (this.selectClassX) {
        this.importedDocs.push({
          id: `DOC-DL-${Date.now()}-2`,
          category: 'DOB_PROOF',
          name: 'Class X Certificate',
          fileName: 'CBSE_10th_Certificate_Verified.pdf',
          fileSize: '742 KB',
          uploadDate: new Date().toLocaleDateString('en-IN'),
          verifiedByDigiLocker: true,
          documentType: 'Matriculation Certificate'
        });
      }

      if (this.selectDl) {
        this.importedDocs.push({
          id: `DOC-DL-${Date.now()}-3`,
          category: 'ADDRESS_PROOF',
          name: 'Driving License (MoRTH)',
          fileName: 'MoRTH_DL_SmartCard.pdf',
          fileSize: '512 KB',
          uploadDate: new Date().toLocaleDateString('en-IN'),
          verifiedByDigiLocker: true,
          documentType: 'Driving License'
        });
      }

      this.authStage = 'SUCCESS';
    }, 1200);
  }

  finalizeImport(): void {
    this.documentsImported.emit(this.importedDocs);
    this.closeModal();
  }

  closeModal(): void {
    this.isOpen = false;
    this.authStage = 'LOGIN';
    this.identifier = '';
    this.securityPin = '';
    this.close.emit();
  }
}

