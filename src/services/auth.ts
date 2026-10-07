import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase.ts';
import { setSessionProfile } from '../state/session.ts';

export async function logoutUser(): Promise<void> {
  await signOut(auth);
  setSessionProfile(undefined);
}

export async function registerUser(email: string, password: string, username: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName: username,
  });

  setSessionProfile({
    displayName: result.user.displayName,
    email: result.user.email,
    avatarUrl: result.user.photoURL,
  });

  return result.user;
}

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  setSessionProfile({
    displayName: result.user.displayName,
    email: result.user.email,
    avatarUrl: result.user.photoURL,
  });
  return result.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  setSessionProfile({
    displayName: result.user.displayName,
    email: result.user.email,
    avatarUrl: result.user.photoURL,
  });

  return result.user;
}
