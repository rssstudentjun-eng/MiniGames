import type { AuthMode } from '../components/dialogs/auth-dialog.ts';

export type AuthFieldName = 'email' | 'username' | 'password' | 'confirmPassword';

export function validateAuthField(
  name: AuthFieldName,
  value: string,
  mode: AuthMode,
  password = '',
): string {
  if (!value) return 'This field is required.';

  if (name === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.';
  }

  if (name === 'username') {
    if (value.length < 2 || value.length > 30) {
      return 'Username must contain 2–30 characters.';
    }

    if (!/^[A-Z]/.test(value)) {
      return 'Username must start with an uppercase English letter.';
    }

    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return 'Use English letters and digits only.';
    }
  } else if (name === 'password') {
    if (value.length < 6) {
      return 'Password must contain at least 6 characters.';
    }

    if (mode === 'register') {
      if (!/^[\u{21}-\u{7E}]+$/u.test(value)) {
        return 'Use English letters, digits and special characters only.';
      }

      if (!/[A-Z]/.test(value)) {
        return 'Add an uppercase English letter.';
      }

      if (!/[0-9]/.test(value)) {
        return 'Add a digit.';
      }

      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Add a special character.';
      }
    }
  }

  if (name === 'confirmPassword' && value !== password) {
    return 'Passwords do not match.';
  }

  return '';
}
