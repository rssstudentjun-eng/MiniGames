import { createHomePage } from '../pages/home/home-page.ts';
import { createLibraryPage } from '../pages/library/library-page.ts';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog.ts';
import { createAuthDialog, openAuthDialog } from '../components/dialogs/auth-dialog.ts';
import {
  closeRouteDialog,
  normalizeRouteParameters,
  openAuthentication,
  readRouteState,
} from './navigation.ts';

export { getRoutePath, navigate } from './navigation.ts';

const routerState: {
  pageKey?: string;
  destroyPage?: () => void;
  dialogKey?: string;
  dialog?: HTMLDialogElement;
} = {};

function synchronizeDialog(state: ReturnType<typeof readRouteState>): void {
  const gameKey = state.gameSlug ? `game:${state.gameSlug}` : undefined;
  const dialogKey = state.auth ? `auth:${state.auth}` : gameKey;
  if (dialogKey === routerState.dialogKey) return;
  if (state.auth && routerState.dialogKey?.startsWith('auth:') && routerState.dialog) {
    routerState.dialogKey = dialogKey;
    openAuthDialog(routerState.dialog, state.auth);
    return;
  }
  routerState.dialog?.close();
  routerState.dialog?.remove();
  routerState.dialog = undefined;
  routerState.dialogKey = dialogKey;
  if (!dialogKey) return;
  const dialog = state.auth
    ? createAuthDialog({ onClose: closeRouteDialog, onModeChange: openAuthentication })
    : createGameDetailsDialog(state.gameSlug!, closeRouteDialog);
  routerState.dialog = dialog;
  document.body.append(dialog);
  if (state.auth) openAuthDialog(dialog, state.auth);
  else dialog.showModal();
}

export function router(): void {
  const main = document.querySelector('main');
  if (!main) return;

  normalizeRouteParameters();
  const state = readRouteState();
  const { category, sort, page } = state.library;
  const pageKey =
    state.path === '/library' ? `${state.path}:${category}:${sort.value}:${page}` : state.path;
  if (pageKey !== routerState.pageKey) {
    routerState.destroyPage?.();
    routerState.destroyPage = undefined;
    routerState.pageKey = pageKey;
    if (state.path === '/home') {
      const homePage = createHomePage();
      main.replaceChildren(homePage.content);
      routerState.destroyPage = homePage.destroy;
    } else if (state.path === '/library') {
      const libraryPage = createLibraryPage(state.library);
      main.replaceChildren(libraryPage.content);
      routerState.destroyPage = libraryPage.destroy;
    } else {
      const notFound = document.createElement('h1');
      notFound.textContent = '404 - Page not found';
      main.replaceChildren(notFound);
    }
  }
  synchronizeDialog(state);
}
