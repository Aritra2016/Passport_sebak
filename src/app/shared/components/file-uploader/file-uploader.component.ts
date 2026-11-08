import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadedDocument } from '../../../core/models/passport.model';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent {
  @Input() title = 'Upload Document';
  @Input() description = 'Please upload a clear scanned copy.';
  @Input() category: 'PHOTO' | 'IDENTITY_PROOF' | 'ADDRESS_PROOF' | 'DOB_PROOF' = 'IDENTITY_PROOF';
  @Input() required = true;
  @Input() document: UploadedDocument | null = null;
  @Input() accept = '.pdf,.jpg,.jpeg,.png';

  @Output() fileUploaded = new EventEmitter<UploadedDocument>();
  @Output() fileRemoved = new EventEmitter<string>();

  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  private processFile(file: File): void {
    this.errorMessage = '';

    // Size limit: 2MB
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage = `File size ${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds 2MB limit.`;
      return;
    }

    // Extension check
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExts.some(ext => lowerName.endsWith(ext));
    if (!isValid) {
      this.errorMessage = 'Unsupported file format. Please upload PDF, JPG, or PNG.';
      return;
    }

    // Simulate upload progress
    this.isUploading = true;
    this.uploadProgress = 10;

    const interval = setInterval(() => {
      this.uploadProgress += 30;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;

        const uploadedDoc: UploadedDocument = {
          id: `DOC-${Date.now()}`,
          category: this.category,
          name: this.title,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          uploadDate: new Date().toLocaleDateString('en-IN'),
          verifiedByDigiLocker: false,
          documentType: this.title
        };

        this.fileUploaded.emit(uploadedDoc);
      }
    }, 150);
  }

  removeFile(): void {
    if (this.document) {
      this.fileRemoved.emit(this.document.id);
    }
  }
}

