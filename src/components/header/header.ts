import headerLogoUrl from '../../assets/icons/headerLogo.svg';
import './header.scss';

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.classList.add('header');

  const container = document.createElement('div');
  container.classList.add('container', 'headerContainer');

  const headerLogoWrap = document.createElement('a');
  headerLogoWrap.classList.add('headerLogoWrap');
  headerLogoWrap.href = '/';

  const headerLogoIcon = document.createElement('img');
  headerLogoIcon.classList.add('headerLogoIcon');
  headerLogoIcon.src = headerLogoUrl;
  headerLogoIcon.alt = 'headerLogo';

  const headerLogoText = document.createElement('span');
  headerLogoText.classList.add('headerLogoText');
  headerLogoText.textContent = 'MiniGames';

  headerLogoWrap.append(headerLogoIcon, headerLogoText);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/' },
    { label: 'Tournaments', href: '/' },
    { label: 'Community', href: '/' },
  ];

  const headerNavList = document.createElement('ul');
  headerNavList.classList.add('headerNavList');

  for (const navItem of navItems) {
    const item = document.createElement('li');
    const link = document.createElement('a');

    link.classList.add('headerNavLink');
    link.textContent = navItem.label;
    link.dataset.text = navItem.label;
    link.href = navItem.href;

    if (navItem.label === 'Home') {
      link.classList.add('headerNavLinkActive');
    }

    link.addEventListener('click', () => {
      const activeLink = headerNavList.querySelector('.headerNavLinkActive');
      activeLink?.classList.remove('headerNavLinkActive');

      link.classList.add('headerNavLinkActive');
    });

    item.append(link);
    headerNavList.append(item);
  }

  const headerBtnsWrapper = document.createElement('div');
  headerBtnsWrapper.classList.add('headerBtnsWrapper');

  const logInButon = document.createElement('button');
  logInButon.type = 'button';

  const signUpButon = document.createElement('button');
  signUpButon.type = 'button';

  logInButon.textContent = 'Log In';
  signUpButon.textContent = 'Sign Up';
  logInButon.classList.add('headerBtn', 'logInBtn');
  signUpButon.classList.add('headerBtn', 'signUpBtn');

  headerBtnsWrapper.append(logInButon, signUpButon);

  // =====
  const menuButton = document.createElement('button');
  menuButton.classList.add('headerMenuBtn');
  menuButton.type = 'button';
  menuButton.ariaLabel = 'Open menu';
  menuButton.textContent = '☰';

  const mobileMenu = document.createElement('div');
  mobileMenu.classList.add('mobileMenu');

  const closeButton = document.createElement('button');
  closeButton.classList.add('mobileMenuCloseBtn');
  closeButton.type = 'button';
  closeButton.ariaLabel = 'Close menu';
  closeButton.textContent = '×';

  const mobileNavList = headerNavList.cloneNode(true) as HTMLUListElement;
  mobileNavList.classList.add('mobileNavList');

  const headerMobileMenu = document.createElement('div');

  headerMobileMenu.append(headerLogoWrap.cloneNode(true), closeButton);
  headerMobileMenu.classList.add('headerMobileMenu');

  mobileMenu.append(
    headerMobileMenu,
    mobileNavList,
    logInButon.cloneNode(true),
    signUpButon.cloneNode(true),
  );

  menuButton.addEventListener('click', () => {
    mobileMenu.classList.add('mobileMenuOpen');
    document.body.classList.add('scrollLocked');
  });

  closeButton.addEventListener('click', () => {
    mobileMenu.classList.remove('mobileMenuOpen');
    document.body.classList.remove('scrollLocked');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    mobileMenu.classList.remove('mobileMenuOpen');
    document.body.classList.remove('scrollLocked');
  });
  // =====

  container.append(headerLogoWrap, headerNavList, headerBtnsWrapper, menuButton);

  header.append(container, mobileMenu);

  return header;
}
