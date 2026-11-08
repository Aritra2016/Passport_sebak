import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { SessionService } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    public notify: NotificationService,
    public sessionService: SessionService,
    public authService: AuthService
  ) {}

  extendSession(): void {
    this.sessionService.resetTimer();
    this.notify.success('Session extended by 15 minutes.', 'Session Active');
  }
}

