import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models/passport.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as UserRole[] | undefined;

    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    const currentRole = this.authService.currentRole();
    if (expectedRoles.includes(currentRole)) {
      return true;
    }

    this.notify.error(
      `Access denied. This view requires ${expectedRoles.map(r => this.authService.formatRole(r)).join(' or ')} privileges.`,
      'Unauthorized Access'
    );
    this.router.navigate(['/dashboard']);
    return false;
  }
}

