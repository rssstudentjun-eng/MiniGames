import { createHomePage } from '../pages/home/home-page.ts';
import { createLibraryPage } from '../pages/library/library-page.ts';
import { createNotFoundPage } from '../pages/not-found/not-found-page.ts';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog.ts';
import { createAuthDialog, openAuthDialog } from '../components/dialogs/auth-dialog.ts';
import { hasActiveSession } from '../state/session.ts';
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

const actionState: { authDialog?: HTMLDialogElement; gameDialog?: HTMLDialogElement } = {};

function closeActionAuth(): void {
  actionState.authDialog?.close();
  actionState.authDialog?.remove();
  actionState.authDialog = undefined;
  if (actionState.gameDialog) {
    document.body.append(actionState.gameDialog);
    actionState.gameDialog.showModal();
    actionState.gameDialog.dispatchEvent(new Event('app:profile'));
    actionState.gameDialog = undefined;
  }
}

export function setupSessionDialogs(): void {
  globalThis.addEventListener('app:profile', () => {
    routerState.dialog?.dispatchEvent(new Event('app:profile'));
  });
  globalThis.addEventListener('app:require-auth', () => {
    if (actionState.authDialog || !routerState.dialogKey?.startsWith('game:')) return;
    actionState.gameDialog = routerState.dialog;
    actionState.gameDialog?.close();
    actionState.authDialog = createAuthDialog({
      onClose: closeActionAuth,
      onModeChange: (mode) => {
        if (actionState.authDialog) openAuthDialog(actionState.authDialog, mode);
      },
    });
    document.body.append(actionState.authDialog);
    openAuthDialog(actionState.authDialog, 'login');
  });
}

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
    ? createAuthDialog({
        onClose: closeRouteDialog,
        onModeChange: openAuthentication,
      })
    : createGameDetailsDialog(state.gameSlug!, closeRouteDialog);
  routerState.dialog = dialog;
  document.body.append(dialog);
  if (state.auth) openAuthDialog(dialog, state.auth);
  else dialog.showModal();
}

export function router(): void {
  hasActiveSession();
  if (actionState.authDialog) closeActionAuth();
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
      main.replaceChildren(createNotFoundPage());
    }
  }
  synchronizeDialog(state);
}
