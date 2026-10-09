import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase.ts';
import { showSnackbar } from '../components/snackbar/snackbar.ts';

export type SessionProfile = {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
};

export const sessionKey = 'minigames:rssstudentjun-eng:app-session';
const sessionLifetime = 5 * 60 * 1000;
const sessionState: {
  expirationTimer?: ReturnType<typeof setTimeout>;
  pendingSignOut: Promise<void>;
} = { pendingSignOut: Promise.resolve() };

export const session = {
  profile: undefined as SessionProfile | undefined,
};

export function setSessionProfile(profile: SessionProfile | undefined): void {
  clearTimeout(sessionState.expirationTimer);
  session.profile = profile;
  if (profile) {
    localStorage.setItem(sessionKey, JSON.stringify(profile));
    sessionState.expirationTimer = setTimeout(
      hasActiveSession,
      Math.max(0, sessionLifetime - (Date.now() - profile.authenticatedAt)),
    );
  } else {
    localStorage.removeItem(sessionKey);
  }
  globalThis.dispatchEvent(new Event('app:profile'));
}

export function isValidSession(value: unknown): value is SessionProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<SessionProfile>;
  return (
    typeof profile.displayName === 'string' &&
    typeof profile.email === 'string' &&
    typeof profile.authenticatedAt === 'number' &&
    Number.isFinite(profile.authenticatedAt) &&
    profile.authenticatedAt > 0 &&
    profile.authenticatedAt <= Date.now() &&
    (profile.avatarUrl === undefined || typeof profile.avatarUrl === 'string')
  );
}

function clearSession(isExpired = false): void {
  void signOutOfFirebase();
  if (isExpired) showSnackbar('Your session has expired. Please sign in again.', 'error');
}

export async function waitForSessionSignOut(): Promise<void> {
  try {
    await sessionState.pendingSignOut;
  } catch {
    return;
  }
}

export function endSession(): Promise<void> {
  setSessionProfile(undefined);
  sessionState.pendingSignOut = signOut(auth);
  return sessionState.pendingSignOut;
}

export function hasActiveSession(): boolean {
  const stored = localStorage.getItem(sessionKey);
  if (stored === null) {
    if (session.profile) clearSession();
    return false;
  }

  let profile: unknown;
  try {
    profile = JSON.parse(stored);
  } catch {
    clearSession();
    return false;
  }

  if (!isValidSession(profile)) {
    clearSession();
    return false;
  }
  if (Date.now() - profile.authenticatedAt >= sessionLifetime) {
    clearSession(true);
    return false;
  }
  if (JSON.stringify(session.profile) !== JSON.stringify(profile)) setSessionProfile(profile);
  return true;
}

export function restoreSession(): void {
  if (localStorage.getItem(sessionKey) === null) clearSession();
  else hasActiveSession();
}

async function signOutOfFirebase(): Promise<void> {
  try {
    await endSession();
  } catch {
    showSnackbar('Could not sign out of Firebase. Please try again.', 'error');
  }
}
