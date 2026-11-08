import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserRole } from '../models/passport.model';
import { NotificationService } from './notification.service';

const AUTH_STORAGE_KEY = 'passport_portal_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userState = signal<UserProfile | null>(this.loadStoredUser());

  readonly currentUser = computed(() => this.userState());
  readonly isAuthenticated = computed(() => !!this.userState());
  readonly currentRole = computed<UserRole>(() => this.userState()?.role ?? 'CITIZEN');

  constructor(
    private router: Router,
    private notify: NotificationService
  ) { }

  private loadStoredUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
    }
    // Default mock citizen user for smooth out-of-the-box experience
    const defaultCitizen: UserProfile = {
      id: 'USR-2026-9021',
      fullName: 'Vikramaditya Sharma',
      email: 'vikram.sharma@example.gov.in',
      mobile: '9876543210',
      role: 'CITIZEN',
      token: 'jwt-mock-token-citizen-2026'
    };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultCitizen));
    } catch { }
    return defaultCitizen;
  }

  login(identifier: string, passOrOtp: string, role: UserRole = 'CITIZEN', explicitFullName?: string): boolean {
    let name = explicitFullName?.trim();

    if (!name) {
      if (role === 'PSK_OFFICER') {
        name = 'Rajesh Verma (Granting Officer)';
      } else if (role === 'POLICE_VERIFIER') {
        name = 'Inspector Amit Kulkarni (Special Branch)';
      } else if (identifier.includes('@')) {
        const userPart = identifier.split('@')[0];
        // Convert "aritra.khatua" -> "Aritra Khatua"
        name = userPart
          .split(/[\._\-]/)
          .filter(Boolean)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
      } else if (identifier.match(/[a-zA-Z]/)) {
        name = identifier.trim();
      } else {
        name = 'Vikramaditya Sharma';
      }
    }

    const email = identifier.includes('@')
      ? identifier.trim()
      : `${name.toLowerCase().replace(/\s+/g, '.') || 'citizen'}@example.gov.in`;

    const user: UserProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: name,
      email: email,
      mobile: identifier.match(/^\d{10}$/) ? identifier : '9876543210',
      role: role,
      token: `jwt-mock-token-${role.toLowerCase()}-${Date.now()}`
    };

    this.userState.set(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }

    this.notify.success(`Welcome back, ${user.fullName}! Logged in as ${this.formatRole(role)}.`, 'Authentication Successful');
    return true;
  }

  register(userData: { fullName: string; email: string; mobile: string; role?: UserRole }): boolean {
    const user: UserProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: userData.fullName,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role || 'CITIZEN',
      token: `jwt-mock-token-reg-${Date.now()}`
    };

    this.userState.set(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }

    this.notify.success(`Account registered successfully. Welcome, ${user.fullName}!`, 'Registration Complete');
    return true;
  }

  switchRole(newRole: UserRole): void {
    const current = this.userState();
    if (!current) return;

    const names: Record<UserRole, string> = {
      CITIZEN: current.role === 'CITIZEN' ? current.fullName : 'Vikramaditya Sharma',
      PSK_OFFICER: 'Rajesh Verma (Granting Officer)',
      POLICE_VERIFIER: 'Inspector Amit Kulkarni (Special Branch)'
    };

    const updated: UserProfile = {
      ...current,
      role: newRole,
      fullName: names[newRole]
    };

    this.userState.set(updated);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    } catch { }

    this.notify.info(`Switched active view to ${this.formatRole(newRole)}`, 'Role Updated');
  }

  logout(): void {
    this.userState.set(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch { }
    this.notify.info('You have been logged out securely.', 'Session Ended');
    this.router.navigate(['/auth/login']);
  }

  formatRole(role: UserRole): string {
    switch (role) {
      case 'CITIZEN': return 'Citizen / Applicant';
      case 'PSK_OFFICER': return 'PSK Verification Officer';
      case 'POLICE_VERIFIER': return 'Police Verification Officer';
      default: return role;
    }
  }
}

