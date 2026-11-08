import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastMessage[]>([]);
  readonly isLoading = signal<boolean>(false);

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Success'): void {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', message, title, 6000);
  }

  warning(message: string, title: string = 'Notice'): void {
    this.show('warning', message, title, 5000);
  }

  info(message: string, title: string = 'Information'): void {
    this.show('info', message, title);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }
}

