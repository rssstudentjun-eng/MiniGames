import './auth-dialog.scss';
import googleIcon from '../../assets/icons/googleIcon.svg';
import lockIcon from '../../assets/icons/lockIcon.svg';
import mailIcon from '../../assets/icons/mailIcon.svg';
import personIcon from '../../assets/icons/personIcon.svg';
import visibilityIcon from '../../assets/icons/visibilityIcon.svg';
import closeIcon from '../../assets/icons/closeIcon.svg';
import { AuthFieldName, validateAuthField } from '../../utils/auth-validation.ts';

export type AuthMode = 'login' | 'register';

type FieldOptions = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  icon: string;
  autocomplete: string;
  showPasswordButton?: boolean;
};

// =====
function validationForm(form: HTMLFormElement, mode: AuthMode): void {
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (!submitButton) return;

  const inputs = [...form.querySelectorAll<HTMLInputElement>('input')];
  const passwordInput = inputs.find((input) => input.name === 'password');
  const touchedFields = new Set<string>();

  const fields = inputs.map((input) => {
    const error = document.createElement('span');
    error.className = 'authError';
    error.id = `${input.id}-error`;
    error.hidden = true;
    error.setAttribute('aria-live', 'polite');

    input.required = true;
    input.setAttribute('aria-describedby', error.id);
    input.closest('.authField')?.append(error);

    return { input, error };
  });

  function updateValidation(): void {
    let isFormValid = true;

    for (const { input, error } of fields) {
      const message = validateAuthField(
        input.name as AuthFieldName,
        input.value,
        mode,
        passwordInput?.value ?? '',
      );

      if (message) isFormValid = false;

      const shouldShowError = touchedFields.has(input.name) && message !== '';

      error.textContent = shouldShowError ? message : '';
      error.hidden = !shouldShowError;
      input.setAttribute('aria-invalid', String(shouldShowError));
    }

    if (!submitButton) return;

    submitButton.disabled = !isFormValid;
  }

  for (const { input } of fields) {
    function handleFieldChange(): void {
      touchedFields.add(input.name);
      updateValidation();
    }

    input.addEventListener('input', handleFieldChange);
    input.addEventListener('change', handleFieldChange);
    input.addEventListener('blur', handleFieldChange);
  }

  updateValidation();
}

// =====

function createButton(text: string, className: string): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = className;
  button.textContent = text;

  return button;
}

function createIcon(source: string): HTMLImageElement {
  const image = document.createElement('img');

  image.src = source;
  image.alt = '';

  return image;
}

function createField(options: FieldOptions): HTMLDivElement {
  const field = document.createElement('div');
  field.className = 'authField';

  const labelText = document.createElement('label');
  labelText.textContent = options.label;

  const control = document.createElement('span');
  control.className = 'authControl';

  const input = document.createElement('input');
  input.id = `auth-${options.name}`;
  labelText.htmlFor = input.id;

  input.name = options.name;
  input.type = options.type;
  input.placeholder = options.placeholder;
  input.setAttribute('autocomplete', options.autocomplete);

  control.append(createIcon(options.icon), input);

  if (options.showPasswordButton) {
    const showPasswordButton = createButton('', 'authReveal');

    showPasswordButton.setAttribute('aria-label', 'Show password');
    showPasswordButton.setAttribute('aria-pressed', 'false');
    showPasswordButton.append(createIcon(visibilityIcon));

    showPasswordButton.addEventListener('click', () => {
      const isPasswordHidden = input.type === 'password';

      input.type = isPasswordHidden ? 'text' : 'password';

      showPasswordButton.setAttribute(
        'aria-label',
        isPasswordHidden ? 'Hide password' : 'Show password',
      );

      showPasswordButton.setAttribute('aria-pressed', String(isPasswordHidden));
    });

    control.append(showPasswordButton);
  }

  field.append(labelText, control);

  return field;
}

export function createAuthDialog(options: {
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'authDialog';
  dialog.setAttribute('aria-labelledby', 'auth-title');
  const closeButton = createButton('', 'authClose');
  closeButton.setAttribute('aria-label', 'Close authentication');
  closeButton.append(createIcon(closeIcon));
  closeButton.addEventListener('click', options.onClose);

  const tabs = document.createElement('div');
  tabs.className = 'authTabs';

  const loginTab = createButton('Login', 'authTab');
  const registerTab = createButton('Register', 'authTab');

  tabs.append(loginTab, registerTab);

  const title = document.createElement('h2');
  title.id = 'auth-title';

  const description = document.createElement('p');
  description.className = 'authDescription';

  const form = document.createElement('form');
  form.className = 'authForm';
  form.noValidate = true;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  const divider = document.createElement('div');
  divider.className = 'authDivider';
  divider.textContent = 'OR';

  const googleButton = createButton('', 'authGoogle');
  const googleButtonText = document.createElement('span');

  googleButton.append(createIcon(googleIcon), googleButtonText);

  const footer = document.createElement('p');
  footer.className = 'authFooter';

  function renderLoginForm(): void {
    title.textContent = 'Welcome Back!';
    description.textContent = 'Sign in to resume your games and progress.';

    loginTab.setAttribute('aria-pressed', 'true');
    registerTab.setAttribute('aria-pressed', 'false');

    form.replaceChildren();

    const emailField = createField({
      label: 'Email Address',
      name: 'email',
      type: 'email',
      placeholder: 'e.g. alex@minigames.com',
      icon: mailIcon,
      autocomplete: 'email',
    });

    const passwordField = createField({
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: '••••••',
      icon: lockIcon,
      autocomplete: 'current-password',
      showPasswordButton: true,
    });

    const forgotPasswordButton = createButton('Forgot Password?', 'authTextButton authForgot');

    const submitButton = createButton('Login', 'authSubmit');
    submitButton.type = 'submit';

    form.append(emailField, passwordField, forgotPasswordButton, submitButton);
    validationForm(form, 'login');

    googleButtonText.textContent = 'Continue with Google';

    const registerButton = createButton('Register', 'authTextButton');

    registerButton.addEventListener('click', () => {
      options.onModeChange('register');
    });

    footer.replaceChildren("Don't have an account? ", registerButton);
  }

  function renderRegisterForm(): void {
    title.textContent = 'Create Account';
    description.textContent = 'Join MiniGames to track your score & streak.';

    loginTab.setAttribute('aria-pressed', 'false');
    registerTab.setAttribute('aria-pressed', 'true');

    form.replaceChildren();

    const usernameField = createField({
      label: 'Username',
      name: 'username',
      type: 'text',
      placeholder: 'e.g. CozyGamer_99',
      icon: personIcon,
      autocomplete: 'username',
    });

    const emailField = createField({
      label: 'Email Address',
      name: 'email',
      type: 'email',
      placeholder: 'your.email@domain.com',
      icon: mailIcon,
      autocomplete: 'email',
    });

    const passwordField = createField({
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: 'Min. 8 characters',
      icon: lockIcon,
      autocomplete: 'new-password',
    });

    const confirmPasswordField = createField({
      label: 'Confirm Password',
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Repeat your password',
      icon: lockIcon,
      autocomplete: 'new-password',
    });

    const submitButton = createButton('Create Account', 'authSubmit');

    submitButton.type = 'submit';

    form.append(usernameField, emailField, passwordField, confirmPasswordField, submitButton);
    validationForm(form, 'register');

    googleButtonText.textContent = 'Sign up with Google';

    const loginButton = createButton('Login', 'authTextButton');

    loginButton.addEventListener('click', () => {
      options.onModeChange('login');
    });

    footer.replaceChildren('Already have an account? ', loginButton);
  }

  loginTab.addEventListener('click', () => {
    options.onModeChange('login');
  });

  registerTab.addEventListener('click', () => {
    options.onModeChange('register');
  });

  dialog.addEventListener('auth:mode', (event) => {
    const customEvent = event as CustomEvent<AuthMode>;

    if (customEvent.detail === 'register') {
      renderRegisterForm();
      return;
    }

    renderLoginForm();
  });

  let previousFocusedElement: HTMLElement | undefined;
  dialog.addEventListener('close', () => {
    if (!document.querySelector('.authDialog[open]')) {
      document.documentElement.classList.remove('authDialogLocked');
    }
    if (!document.querySelector('dialog[open]') && previousFocusedElement?.isConnected) {
      previousFocusedElement.focus();
    }
  });

  dialog.addEventListener('auth:open', () => {
    if (dialog.open) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      previousFocusedElement = document.activeElement;
    }

    dialog.showModal();

    document.documentElement.classList.add('authDialogLocked');
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    options.onClose();
  });

  function isClickOutsideDialog(event: PointerEvent | MouseEvent): boolean {
    const rect = dialog.getBoundingClientRect();

    const isOutsideHorizontal = event.clientX < rect.left || event.clientX > rect.right;

    const isOutsideVertical = event.clientY < rect.top || event.clientY > rect.bottom;

    return isOutsideHorizontal || isOutsideVertical;
  }

  let isBackdropPressed = false;

  dialog.addEventListener('pointerdown', (event) => {
    isBackdropPressed = event.target === dialog && isClickOutsideDialog(event);
  });

  dialog.addEventListener('click', (event) => {
    const isBackdropClicked =
      isBackdropPressed && event.target === dialog && isClickOutsideDialog(event);

    if (isBackdropClicked) {
      options.onClose();
    }

    isBackdropPressed = false;
  });

  dialog.append(closeButton, tabs, title, description, form, divider, googleButton, footer);

  renderLoginForm();

  return dialog;
}

export function openAuthDialog(dialog: HTMLDialogElement, mode: AuthMode): void {
  dialog.dispatchEvent(
    new CustomEvent<AuthMode>('auth:mode', {
      detail: mode,
    }),
  );

  dialog.dispatchEvent(new Event('auth:open'));
}
