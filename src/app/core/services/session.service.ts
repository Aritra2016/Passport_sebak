import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  readonly sessionTimeoutMinutes = environment.sessionTimeoutMinutes;
  readonly sessionRemainingSeconds = signal<number>(this.sessionTimeoutMinutes * 60);
  readonly showWarning = signal<boolean>(false);

  private timerInterval: any = null;

  constructor() {
    this.startSessionTimer();
    this.setupActivityListeners();
  }

  private startSessionTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.sessionRemainingSeconds.set(this.sessionTimeoutMinutes * 60);

    this.timerInterval = setInterval(() => {
      const remaining = this.sessionRemainingSeconds() - 1;
      if (remaining <= 0) {
        this.sessionRemainingSeconds.set(0);
        this.showWarning.set(true);
        clearInterval(this.timerInterval);
      } else {
        this.sessionRemainingSeconds.set(remaining);
        if (remaining <= 120 && !this.showWarning()) {
          this.showWarning.set(true);
        }
      }
    }, 1000);
  }

  resetTimer(): void {
    this.showWarning.set(false);
    this.startSessionTimer();
  }

  private setupActivityListeners(): void {
    if (typeof window !== 'undefined') {
      const reset = () => {
        if (this.sessionRemainingSeconds() > 120) {
          this.sessionRemainingSeconds.set(this.sessionTimeoutMinutes * 60);
        }
      };
      window.addEventListener('mousemove', reset, { passive: true });
      window.addEventListener('keydown', reset, { passive: true });
    }
  }
}

