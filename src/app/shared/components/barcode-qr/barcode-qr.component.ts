import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-barcode-qr',
  templateUrl: './barcode-qr.component.html',
  styleUrls: ['./barcode-qr.component.css']
})
export class BarcodeQrComponent implements OnChanges {
  @Input() type: 'barcode' | 'qrcode' = 'barcode';
  @Input() value = 'ARN-DL01-84920194-2026';
  @Input() width = 280;
  @Input() height = 65;
  @Input() qrSize = 110;

  barcodeBars: { x: number; w: number }[] = [];
  qrModules: { x: number; y: number }[] = [];

  ngOnChanges(): void {
    this.generateBarcode();
    this.generateQrPattern();
  }

  private generateBarcode(): void {
    this.barcodeBars = [];
    let currentX = 0;
    const str = this.value || 'ARN-DEFAULT';

    // Start pattern
    this.barcodeBars.push({ x: currentX, w: 2 }); currentX += 4;
    this.barcodeBars.push({ x: currentX, w: 1 }); currentX += 3;

    // Generate bar widths pseudo-randomly based on characters
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      const w1 = (code % 3) + 1;
      const space1 = ((code >> 1) % 2) + 2;
      const w2 = ((code >> 2) % 3) + 1;
      const space2 = 2;

      this.barcodeBars.push({ x: currentX, w: w1 });
      currentX += w1 + space1;
      this.barcodeBars.push({ x: currentX, w: w2 });
      currentX += w2 + space2;
    }

    // Stop pattern
    this.barcodeBars.push({ x: currentX, w: 2 }); currentX += 4;
    this.barcodeBars.push({ x: currentX, w: 2 });
  }

  private generateQrPattern(): void {
    this.qrModules = [];
    const str = this.value || 'ARN-DATA';
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
      seed = (seed + str.charCodeAt(i) * (i + 1)) % 1000;
    }

    // Generate 18x18 pseudo-random data dots avoiding corners
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        const x = 12 + c * 4;
        const y = 12 + r * 4;

        // Skip corners (top-left, top-right, bottom-left) and center
        const inTopLeft = x < 36 && y < 36;
        const inTopRight = x > 64 && y < 36;
        const inBottomLeft = x < 36 && y > 64;
        const inCenter = x >= 44 && x <= 56 && y >= 44 && y <= 56;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
          const pseudoBit = ((seed * (r + 1) + c * 37) % 7) > 2;
          if (pseudoBit) {
            this.qrModules.push({ x, y });
          }
        }
      }
    }
  }
}

