import '../styles/globals.scss';
import { createHeader } from '../components/header/header';
import { createFooter } from '../components/footer/ footer.ts';
import { getRoutePath, navigate, router } from './router';
import { restoreRedirectedRoute } from './navigation.ts';

export type Page = 'home' | 'library';

const app = document.createElement('div');

app.id = 'app';
function updateNavigation(): void {
  const path = getRoutePath();

  for (const link of header.querySelectorAll<HTMLAnchorElement>('[data-page]')) {
    const isActive = `/${link.dataset.page}` === path;

    link.classList.toggle('headerNavLinkActive', isActive);

    link.toggleAttribute('aria-current', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  }
}

app.addEventListener('click', (event) => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }
  if (!(event.target instanceof Element)) {
    return;
  }
  const link = event.target.closest<HTMLAnchorElement>('a[data-page]');

  if (!link) {
    return;
  }

  const page = link.dataset.page;

  if (page !== 'home' && page !== 'library') {
    return;
  }

  event.preventDefault();
  navigate(`/${page}`);
  window.scrollTo(0, 0);
});

const header = createHeader();
const main = document.createElement('main');
const footer = createFooter();

app.prepend(header, main, footer);
document.body.append(app);

for (const link of app.querySelectorAll<HTMLAnchorElement>('a[data-page]')) {
  link.href = `${import.meta.env.BASE_URL}${link.dataset.page}`;
}

function renderRoute(): void {
  router();
  updateNavigation();
}

restoreRedirectedRoute();
renderRoute();
globalThis.addEventListener('popstate', renderRoute);
globalThis.addEventListener('app:navigate', renderRoute);
