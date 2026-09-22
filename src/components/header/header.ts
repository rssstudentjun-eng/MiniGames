import headerLogoUrl from '../../assets/icons/headerLogo.svg';
import './header.scss';
import { createAuthDialog, openAuthDialog } from '../dialogs/auth-dialog';

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

    link.addEventListener('click', () => {
      const activeLink = navList.querySelector('.headerNavLinkActive');

      activeLink?.classList.remove('headerNavLinkActive');
      link.classList.add('headerNavLinkActive');
    });

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

  const mobileLogo = logo.cloneNode(true) as HTMLAnchorElement;
  const mobileNavList = createNavList('mobileNavList');

  const mobileLogInButton = logInButton.cloneNode(true);
  const mobileSignUpButton = signUpButton.cloneNode(true);

  mobileMenu.append(mobileLogo, mobileNavList, mobileLogInButton, mobileSignUpButton);

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

    mobileMenu.classList.remove('mobileMenuOpen');
    document.body.classList.remove('scrollLocked');

    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  });

  container.append(logo, navList, buttonsWrapper, menuButton);

  const authDialog = createAuthDialog();
  for (const [trigger, mode] of [
    [logInButton, 'login'],
    [signUpButton, 'register'],
    [mobileLogInButton, 'login'],
    [mobileSignUpButton, 'register'],
  ] as const) {
    trigger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('mobileMenuOpen')) {
        mobileMenu.classList.remove('mobileMenuOpen');
        document.body.classList.remove('scrollLocked');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open menu');
        menuButton.focus();
      }
      openAuthDialog(authDialog, mode);
    });
  }

  header.append(container, mobileMenu, authDialog);

  return header;
}
