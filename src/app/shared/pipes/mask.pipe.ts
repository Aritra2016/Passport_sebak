import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskText'
})
export class MaskPipe implements PipeTransform {
  transform(value: string | undefined | null, visibleStart = 2, visibleEnd = 4): string {
    if (!value) return '';
    const clean = String(value).trim();
    if (clean.length <= (visibleStart + visibleEnd)) {
      return clean;
    }
    const start = clean.substring(0, visibleStart);
    const end = clean.substring(clean.length - visibleEnd);
    const masked = 'X'.repeat(clean.length - visibleStart - visibleEnd);
    return `${start}${masked}${end}`;
  }
}

