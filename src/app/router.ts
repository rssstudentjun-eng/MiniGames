import { createHomePage } from '../pages/home/home-page.ts';
import { createLibraryPage } from '../pages/library/library-page.ts';

interface RoutePage {
  content: DocumentFragment;
  destroy?: () => void;
}

const routes: Record<string, () => RoutePage> = {
  '/home': createHomePage,
  '/library': () => ({
    content: createLibraryPage(),
  }),
};

const pageState: { destroy?: () => void } = {};

export function getRoutePath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathname = globalThis.location.pathname;
  const hasBase = base && (pathname === base || pathname.startsWith(`${base}/`));
  const path = hasBase ? pathname.slice(base.length) : pathname;

  return path.replace(/\/$/, '') || '/home';
}

export function router(): void {
  const main = document.querySelector('main');
  if (!main) return;

  const path = getRoutePath();
  const createPage = routes[path];

  pageState.destroy?.();
  pageState.destroy = undefined;
  main.replaceChildren();

  if (createPage) {
    const page = createPage();
    main.replaceChildren(page.content);
    pageState.destroy = page.destroy;
    return;
  }
  const notFound = document.createElement('h1');
  notFound.textContent = '404 - Page not found';

  main.append(notFound);
}

export function navigate(path: string): void {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  history.pushState({}, '', `${base}${path}`);
  router();
}
