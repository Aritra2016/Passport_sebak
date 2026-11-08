import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/passport.model';
import { PassportStateService } from '../../../store/passport-state.service';
import { SessionService } from '../../../core/services/session.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  readonly env = environment;
  isHighContrast = false;

  constructor(
    public authService: AuthService,
    public stateService: PassportStateService,
    private sessionService: SessionService
  ) {}

  sessionCountdown(): string {
    const sec = this.sessionService.sessionRemainingSeconds();
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  onRoleChange(event: any): void {
    const newRole = event.target.value as UserRole;
    this.authService.switchRole(newRole);
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    if (this.isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  setFontSize(size: 'small' | 'normal' | 'large'): void {
    const root = document.documentElement;
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }
}

