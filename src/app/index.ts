import '../styles/globals.scss';
import { createHeader } from '../components/header/header';
import { createFooter } from '../components/footer/ footer.ts';
import { createHomePage } from '../pages/home/home-page.ts';
import { createLibraryPage } from '../pages/library/library-page.ts';

export type Page = 'home' | 'library';

const app = document.createElement('div');

app.id = 'app';

function renderPage(page: Page): void {
  const pageContent = page === 'home' ? createHomePage() : createLibraryPage();
  main.replaceChildren(pageContent);

  for (const link of header.querySelectorAll<HTMLAnchorElement>('[data-page]')) {
    const isActive = link.dataset.page === page;

    link.classList.toggle('headerNavLinkActive', isActive);

    link.toggleAttribute('aria-current', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  }
}

app.addEventListener('click', (event) => {
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
  renderPage(page);
  window.scrollTo(0, 0);
});

const header = createHeader();
const main = document.createElement('main');
const footer = createFooter();

app.prepend(header, main, footer);
renderPage('home');
document.body.append(app);
