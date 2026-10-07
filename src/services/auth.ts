import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase.ts';
import { endSession, setSessionProfile, waitForSessionSignOut } from '../state/session.ts';

export async function logoutUser(): Promise<void> {
  await endSession();
}

export async function registerUser(email: string, password: string, username: string) {
  await waitForSessionSignOut();
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName: username,
  });

  setSessionProfile({
    displayName: result.user.displayName ?? '',
    email: result.user.email ?? '',
    authenticatedAt: Date.now(),
    ...(result.user.photoURL && { avatarUrl: result.user.photoURL }),
  });

  return result.user;
}

export async function loginUser(email: string, password: string) {
  await waitForSessionSignOut();
  const result = await signInWithEmailAndPassword(auth, email, password);
  setSessionProfile({
    displayName: result.user.displayName ?? '',
    email: result.user.email ?? '',
    authenticatedAt: Date.now(),
    ...(result.user.photoURL && { avatarUrl: result.user.photoURL }),
  });
  return result.user;
}

export async function loginWithGoogle() {
  await waitForSessionSignOut();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  setSessionProfile({
    displayName: result.user.displayName ?? '',
    email: result.user.email ?? '',
    authenticatedAt: Date.now(),
    ...(result.user.photoURL && { avatarUrl: result.user.photoURL }),
  });

  return result.user;
}
