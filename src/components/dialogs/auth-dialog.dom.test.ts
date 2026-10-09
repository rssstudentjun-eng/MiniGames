import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { createAuthDialog, openAuthDialog, type AuthMode } from './auth-dialog.ts';
import { loginUser, loginWithGoogle, registerUser } from '../../services/auth.ts';
import { shouldBlockAuth } from '../../app/navigation.ts';
import { showSnackbar } from '../snackbar/snackbar.ts';

vi.mock('../../services/auth.ts', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

vi.mock('../../app/navigation.ts', () => ({ shouldBlockAuth: vi.fn() }));
vi.mock('../snackbar/snackbar.ts', () => ({ showSnackbar: vi.fn() }));

function setupDialog(mode: AuthMode = 'login') {
  const onClose = vi.fn();
  const onModeChange = vi.fn((nextMode: AuthMode) => openAuthDialog(dialog, nextMode));
  const dialog = createAuthDialog({ onClose, onModeChange });
  dialog.showModal = () => {
    dialog.open = true;
  };
  dialog.close = () => {
    dialog.open = false;
    dialog.dispatchEvent(new Event('close'));
  };
  document.body.append(dialog);
  openAuthDialog(dialog, mode);
  const form = dialog.querySelector<HTMLFormElement>('form')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  return { dialog, form, submit, onClose, onModeChange };
}

function fillField(dialog: HTMLDialogElement, name: string, value: string): HTMLInputElement {
  const input = [...dialog.querySelectorAll('input')].find((field) => field.name === name)!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(shouldBlockAuth).mockReturnValue(false);
});

afterEach(() => {
  for (const dialog of document.querySelectorAll('dialog')) dialog.close();
  document.body.replaceChildren();
  document.documentElement.classList.remove('authDialogLocked');
});

describe('Auth dialog validation', () => {
  it('keeps an empty form disabled and clears the email error after correction', () => {
    const { dialog, submit } = setupDialog();
    expect(submit.disabled).toBe(true);
    expect(dialog.querySelector<HTMLElement>('#auth-email-error')!.hidden).toBe(true);

    const email = fillField(dialog, 'email', 'invalid');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(dialog.querySelector('#auth-email-error')!.textContent).toBe(
      'Enter a valid email address.',
    );

    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'abcdef');
    expect(email.getAttribute('aria-invalid')).toBe('false');
    expect(dialog.querySelector<HTMLElement>('#auth-email-error')!.hidden).toBe(true);
    expect(submit.disabled).toBe(false);
  });

  it('shows the required error on blur and validates changes', () => {
    const { dialog } = setupDialog();
    const email = dialog.querySelector<HTMLInputElement>('input[name="email"]')!;
    email.dispatchEvent(new Event('blur'));
    expect(dialog.querySelector('#auth-email-error')!.textContent).toBe('This field is required.');
    email.value = 'alex@example.com';
    email.dispatchEvent(new Event('change'));
    expect(dialog.querySelector<HTMLElement>('#auth-email-error')!.hidden).toBe(true);
  });

  it('revalidates confirmation when the registration password changes', () => {
    const { dialog, submit } = setupDialog('register');
    fillField(dialog, 'username', 'Alex');
    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'Alex12!');
    fillField(dialog, 'confirmPassword', 'Alex12!');
    expect(submit.disabled).toBe(false);
    fillField(dialog, 'password', 'Alex13!');
    expect(submit.disabled).toBe(true);
    expect(dialog.querySelector('#auth-confirmPassword-error')!.textContent).toBe(
      'Passwords do not match.',
    );
  });

  it('clears fields and errors when switching modes using tabs and the footer', () => {
    const { dialog, onModeChange } = setupDialog();
    fillField(dialog, 'email', 'invalid');
    dialog.querySelector<HTMLButtonElement>(':scope .authTabs button:nth-child(2)')!.click();
    expect(onModeChange).toHaveBeenCalledWith('register');
    expect(dialog.querySelectorAll('input')).toHaveLength(4);
    for (const input of dialog.querySelectorAll('input')) expect(input.value).toBe('');
    for (const error of dialog.querySelectorAll<HTMLElement>('.authError'))
      expect(error.hidden).toBe(true);
    dialog.querySelector<HTMLButtonElement>(':scope .authFooter button')!.click();
    expect(onModeChange).toHaveBeenCalledWith('login');
    expect(dialog.querySelectorAll('input')).toHaveLength(2);
  });

  it('toggles password visibility and its accessible label', () => {
    const { dialog } = setupDialog();
    const password = dialog.querySelector<HTMLInputElement>('input[name="password"]')!;
    dialog.querySelector<HTMLButtonElement>('.authReveal')!.click();
    expect(password.type).toBe('text');
    expect(dialog.querySelector('.authReveal')!.getAttribute('aria-label')).toBe('Hide password');
    dialog.querySelector<HTMLButtonElement>('.authReveal')!.click();
    expect(password.type).toBe('password');
  });
});

describe('Auth dialog requests', () => {
  it('logs in and shows a success message', async () => {
    const { dialog, form, onClose } = setupDialog();
    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'abcdef');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(loginUser).toHaveBeenCalledWith('alex@example.com', 'abcdef');
    expect(showSnackbar).toHaveBeenCalledWith('You are signed in.', 'success');
  });

  it('does not call authentication for an invalid form', () => {
    const { form, onClose } = setupDialog();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(loginUser).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks all controls, blocks duplicate requests and closing while login is pending', async () => {
    const { dialog, form, onClose } = setupDialog();
    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'abcdef');
    let cancelRequest!: () => void;
    const request = new Promise<never>((resolve, reject) => {
      cancelRequest = () => reject(new Error('Request failed'));
    });
    vi.mocked(loginUser).mockReturnValue(request);
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(dialog.getAttribute('aria-busy')).toBe('true');
    for (const control of dialog.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
      'input, button',
    ))
      expect(control.disabled).toBe(true);
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    dialog.querySelector<HTMLButtonElement>('.authClose')!.click();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    dialog.dispatchEvent(new MouseEvent('pointerdown', { clientX: -1, clientY: -1 }));
    dialog.dispatchEvent(new MouseEvent('click', { clientX: -1, clientY: -1 }));
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(loginUser).toHaveBeenCalledTimes(1);
    expect(loginUser).toHaveBeenCalledWith('alex@example.com', 'abcdef');
    cancelRequest();
    await vi.waitFor(() => expect(dialog.getAttribute('aria-busy')).toBe('false'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sends the registration values and closes after success', async () => {
    const { dialog, form, onClose } = setupDialog('register');
    fillField(dialog, 'username', 'Alex');
    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'Alex12!');
    fillField(dialog, 'confirmPassword', 'Alex12!');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(registerUser).toHaveBeenCalledWith('alex@example.com', 'Alex12!', 'Alex');
    expect(loginUser).not.toHaveBeenCalled();
  });

  it('keeps entered values and unlocks the form after a login error', async () => {
    vi.mocked(loginUser).mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'Invalid credentials'),
    );
    const { dialog, form, submit, onClose } = setupDialog();
    fillField(dialog, 'email', 'alex@example.com');
    fillField(dialog, 'password', 'abcdef');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() =>
      expect(showSnackbar).toHaveBeenCalledWith('Incorrect email or password.', 'error'),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(submit.disabled).toBe(false);
    expect(dialog.querySelector<HTMLInputElement>('input[name="email"]')!.value).toBe(
      'alex@example.com',
    );
    expect(dialog.open).toBe(true);
  });

  it('closes after successful Google authentication', async () => {
    const { dialog, onClose } = setupDialog();
    dialog.querySelector<HTMLButtonElement>('.authGoogle')!.click();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith('You are signed in.', 'success');
  });

  it('keeps the dialog open and restores validation after Google cancellation', async () => {
    vi.mocked(loginWithGoogle).mockRejectedValue(
      new FirebaseError('auth/popup-closed-by-user', 'Cancelled'),
    );
    const { dialog, submit, onClose } = setupDialog();
    dialog.querySelector<HTMLButtonElement>('.authGoogle')!.click();
    await vi.waitFor(() =>
      expect(showSnackbar).toHaveBeenCalledWith('Google sign-in was cancelled.', 'error'),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector<HTMLButtonElement>('.authGoogle')!.disabled).toBe(false);
    expect(submit.disabled).toBe(true);
    for (const input of dialog.querySelectorAll('input')) expect(input.disabled).toBe(false);
  });
});

describe('Auth dialog opening and closing', () => {
  it('restores focus and removes the scroll lock after closing', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const { dialog } = setupDialog();
    expect(document.documentElement.classList.contains('authDialogLocked')).toBe(true);
    dialog.querySelector<HTMLInputElement>('input')!.focus();
    dialog.close();
    expect(document.documentElement.classList.contains('authDialogLocked')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('does not open when the navigation guard blocks authentication', () => {
    vi.mocked(shouldBlockAuth).mockReturnValue(true);
    const { dialog } = setupDialog();
    expect(dialog.open).toBe(false);
    expect(document.documentElement.classList.contains('authDialogLocked')).toBe(false);
  });

  it('closes with the close button', () => {
    const { dialog, onClose } = setupDialog();
    dialog.querySelector<HTMLButtonElement>('.authClose')!.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape', () => {
    const { dialog, onClose } = setupDialog();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', () => {
    const { dialog, onClose } = setupDialog();
    dialog.dispatchEvent(new MouseEvent('pointerdown', { clientX: -1, clientY: -1 }));
    dialog.dispatchEvent(new MouseEvent('click', { clientX: -1, clientY: -1 }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
