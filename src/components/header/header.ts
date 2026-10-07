import headerLogoUrl from '../../assets/icons/headerLogo.svg';
import './header.scss';
import { openAuthentication } from '../../app/navigation.ts';
import { session, type SessionProfile } from '../../state/session.ts';
import { logoutUser } from '../../services/auth.ts';
import { showSnackbar } from '../snackbar/snackbar.ts';

export function getProfileName(profile: SessionProfile): string {
  return profile.displayName?.trim() || profile.email?.split('@', 1)[0]?.trim() || 'Player';
}

export function getProfileInitials(name: string): string {
  const words = name.trim().split(/\s+/u, 2);
  let initials = '';

  for (const word of words) {
    const character = word.match(/[\p{L}\p{N}]/u);

    if (character) {
      initials += character[0].toUpperCase();
    }
  }

  if (!initials) return '?';

  return initials;
}

function createProfile(profile: SessionProfile): HTMLElement {
  const container = document.createElement('div');
  container.className = 'headerProfile';
  const name = getProfileName(profile);
  const avatar = document.createElement('span');
  avatar.className = 'headerAvatar';
  avatar.textContent = getProfileInitials(name);

  if (profile.avatarUrl) {
    const image = document.createElement('img');
    image.alt = '';
    image.addEventListener('error', () => {
      avatar.textContent = getProfileInitials(name);
    });
    image.src = profile.avatarUrl;
    avatar.replaceChildren(image);
  }

  const label = document.createElement('span');
  label.className = 'headerProfileName';
  label.textContent = name;
  container.append(avatar, label);
  return container;
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Tournaments', href: '/' },
  { label: 'Community', href: '/' },
];

function createNavList(className: string): HTMLUListElement {
  const navList = document.createElement('ul');
  navList.classList.add(className);

  for (const navItem of navItems) {
    const item = document.createElement('li');
    const link = document.createElement('a');

    link.classList.add('headerNavLink');
    link.textContent = navItem.label;
    link.href = navItem.href;

    if (navItem.label === 'Home') {
      link.dataset.page = 'home';
    } else if (navItem.label === 'Library') {
      link.dataset.page = 'library';
    }

    item.append(link);
    navList.append(item);
  }

  return navList;
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.classList.add('header');

  const container = document.createElement('div');
  container.classList.add('container', 'headerContainer');

  const logo = document.createElement('a');
  logo.classList.add('headerLogoWrap');
  logo.href = '/';
  logo.dataset.page = 'home';

  const logoIcon = document.createElement('img');
  logoIcon.classList.add('headerLogoIcon');
  logoIcon.src = headerLogoUrl;
  logoIcon.alt = 'MiniGames logo';

  const logoText = document.createElement('span');
  logoText.classList.add('headerLogoText');
  logoText.textContent = 'MiniGames';

  logo.append(logoIcon, logoText);

  const navList = createNavList('headerNavList');

  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.classList.add('headerBtnsWrapper');

  const logInButton = document.createElement('button');
  logInButton.type = 'button';
  logInButton.textContent = 'Log In';
  logInButton.classList.add('headerBtn', 'logInBtn');

  const signUpButton = document.createElement('button');
  signUpButton.type = 'button';
  signUpButton.textContent = 'Sign Up';
  signUpButton.classList.add('headerBtn', 'signUpBtn');

  buttonsWrapper.append(logInButton, signUpButton);

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.classList.add('headerMenuBtn');
  menuButton.setAttribute('aria-label', 'Open menu');

  for (let index = 0; index < 3; index++) {
    const line = document.createElement('span');
    line.classList.add('headerMenuLine');
    menuButton.append(line);
  }

  const mobileMenu = document.createElement('div');
  mobileMenu.classList.add('mobileMenu');

  function closeMobileMenu(): void {
    mobileMenu.classList.remove('mobileMenuOpen');
    document.body.classList.remove('scrollLocked');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  }

  mobileMenu.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest<HTMLAnchorElement>('a[data-page]');
    const page = link?.dataset.page;

    if (page !== 'home' && page !== 'library') {
      return;
    }

    closeMobileMenu();
    menuButton.focus();
  });

  const mobileLogo = logo.cloneNode(true) as HTMLAnchorElement;
  const mobileNavList = createNavList('mobileNavList');

  const mobileLogInButton = logInButton.cloneNode(true) as HTMLButtonElement;
  const mobileSignUpButton = signUpButton.cloneNode(true) as HTMLButtonElement;
  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.textContent = 'Logout';
  logoutButton.classList.add('headerBtn', 'logInBtn');

  logoutButton.addEventListener('click', async () => {
    if (logoutButton.disabled) return;
    logoutButton.disabled = true;

    try {
      await logoutUser();
      closeMobileMenu();
      menuButton.focus();
      showSnackbar('You are signed out.', 'success');
    } catch {
      showSnackbar('Sign-out failed. Please try again.', 'error');
    } finally {
      logoutButton.disabled = false;
    }
  });

  mobileMenu.append(mobileLogo, mobileNavList, mobileLogInButton, mobileSignUpButton);

  function updateProfile(): void {
    if (session.profile) {
      buttonsWrapper.replaceChildren(createProfile(session.profile));
      mobileLogInButton.remove();
      mobileSignUpButton.remove();
      mobileMenu.append(logoutButton);
    } else {
      logoutButton.remove();
      buttonsWrapper.replaceChildren(logInButton, signUpButton);
      mobileMenu.append(mobileLogInButton, mobileSignUpButton);
    }
  }

  globalThis.addEventListener('app:profile', updateProfile);
  updateProfile();

  menuButton.setAttribute('aria-expanded', 'false');

  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('mobileMenuOpen');

    document.body.classList.toggle('scrollLocked', isOpen);

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !mobileMenu.classList.contains('mobileMenuOpen')) {
      return;
    }

    closeMobileMenu();
  });

  container.append(logo, navList, buttonsWrapper, menuButton);

  for (const [trigger, mode] of [
    [logInButton, 'login'],
    [signUpButton, 'register'],
    [mobileLogInButton, 'login'],
    [mobileSignUpButton, 'register'],
  ] as const) {
    trigger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('mobileMenuOpen')) {
        closeMobileMenu();
        menuButton.focus();
      }
      openAuthentication(mode);
    });
  }

  header.append(container, mobileMenu);

  return header;
}
